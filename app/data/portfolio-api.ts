export type PortfolioPost = {
  id: number;
  title: string;
  venue: string;
  place: string;
  year: string;
  credits: string[];
  image: string;
  gallery?: string[];
  category?: PortfolioCategory;
  content?: string;
  externalUrl?: string;
};

export type PortfolioCategory = "Teatr" | "Sztuka" | "Warsztaty";

const fallbackCategories: PortfolioCategory[] = ["Teatr", "Sztuka", "Warsztaty"];

type WordPressRendered = {
  rendered?: string;
};

type WordPressCategory = {
  id: number;
  name: string;
};

type WordPressPost = {
  id: number;
  slug: string;
  title?: WordPressRendered;
  content?: WordPressRendered;
  categories?: number[];
  acf?: {
    project_venue?: unknown;
    project_place?: unknown;
    project_year?: unknown;
    project_credits?: unknown;
    project_gallery?: unknown;
    project_external_url?: unknown;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
  };
};

export type PortfolioPostViewModel = PortfolioPost & {
  category: PortfolioCategory;
  slug: string;
};

export async function loadPortfolioImageSrc(image: string) {
  return image;
}

export function getPortfolioPostBySlug(
  slug: string,
): PortfolioPostViewModel | null {
  void slug;
  return null;
}

function getWordPressApiUrl() {
  const configuredUrl = import.meta.env.VITE_WORDPRESS_API_URL as
    | string
    | undefined;

  if (configuredUrl) return configuredUrl;
  if (import.meta.env.DEV) return "http://localhost:8081";
  return undefined;
}

export async function fetchPortfolioPosts(): Promise<PortfolioPostViewModel[]> {
  const wordpressApiUrl = getWordPressApiUrl();

  if (!wordpressApiUrl) {
    return [];
  }

  try {
    return await fetchWordPressPortfolioPosts(wordpressApiUrl);
  } catch {
    return [];
  }
}

export async function fetchPortfolioPostBySlug(slug: string) {
  const wordpressApiUrl = getWordPressApiUrl();

  if (!wordpressApiUrl) {
    return null;
  }

  try {
    const posts = await fetchWordPressPortfolioPosts(wordpressApiUrl, slug);
    return posts[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchWordPressPortfolioPosts(
  wordpressApiUrl: string,
  slug?: string,
): Promise<PortfolioPostViewModel[]> {
  const apiBase = wordpressApiUrl.replace(/\/$/, "");
  const categoriesResponse = await fetch(
    `${apiBase}/wp-json/wp/v2/categories?per_page=100`,
  );

  if (!categoriesResponse.ok) {
    throw new Error("WordPress portfolio request failed");
  }

  const wordpressCategories =
    (await categoriesResponse.json()) as WordPressCategory[];
  const categoryById = new Map(
    wordpressCategories.map((category) => [category.id, category.name]),
  );
  const portfolioCategoryIds = wordpressCategories
    .filter((category) => isPortfolioCategory(category.name))
    .map((category) => category.id);
  const postsResponse = await fetch(
    `${apiBase}/wp-json/wp/v2/posts?per_page=100&_embed=1&orderby=id&order=asc${
      portfolioCategoryIds.length > 0
        ? `&categories=${portfolioCategoryIds.join(",")}`
        : ""
    }${slug ? `&slug=${encodeURIComponent(slug)}` : ""}`,
  );

  if (!postsResponse.ok) {
    throw new Error("WordPress portfolio request failed");
  }

  const wordpressPosts = (await postsResponse.json()) as WordPressPost[];

  return wordpressPosts.map((post, index) => {
    const acf = post.acf ?? {};
    const category =
      getWordPressPostCategory(post, categoryById) ??
      fallbackCategories[index % fallbackCategories.length];

    return {
      id: post.id,
      title: stripRenderedText(post.title?.rendered) || `Projekt ${post.id}`,
      venue: getString(acf.project_venue),
      place: getString(acf.project_place),
      year: getString(acf.project_year),
      credits: parseStringList(acf.project_credits),
      image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "",
      gallery: parseStringList(acf.project_gallery),
      category,
      content: post.content?.rendered ?? "",
      externalUrl: getString(acf.project_external_url) || undefined,
      slug: post.slug,
    };
  });
}

function getWordPressPostCategory(
  post: WordPressPost,
  categoryById: Map<number, string>,
): PortfolioCategory | null {
  for (const categoryId of post.categories ?? []) {
    const category = categoryById.get(categoryId);
    if (isPortfolioCategory(category)) return category;
  }
  return null;
}

function isPortfolioCategory(value: unknown): value is PortfolioCategory {
  return (
    value === "Teatr" || value === "Sztuka" || value === "Warsztaty"
  );
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function stripRenderedText(html?: string) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}
