import posts from "./portfolio-posts.json";

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

const imageModules = import.meta.glob("../../mock/assets/*", {
  query: "?url",
  import: "default",
}) as Record<string, () => Promise<string>>;

const imageByFileName = Object.fromEntries(
  Object.entries(imageModules).map(([path, loadSrc]) => {
    const fileName = path.split("/").at(-1);
    return [fileName, loadSrc];
  }),
);

export type PortfolioPostViewModel = PortfolioPost & {
  category: PortfolioCategory;
  slug: string;
};

export function createPortfolioPostSlug(post: Pick<PortfolioPost, "id" | "title">) {
  const titleSlug = post.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${titleSlug}-${post.id}`;
}

export async function loadPortfolioImageSrc(image: string) {
  return imageByFileName[image]?.() ?? "";
}

export function getPortfolioPosts(): PortfolioPostViewModel[] {
  const wordpressPosts = posts as PortfolioPost[];

  return wordpressPosts.map((post) => ({
    ...post,
    slug: createPortfolioPostSlug(post),
    category:
      post.category ?? fallbackCategories[(post.id - 1) % fallbackCategories.length],
  }));
}

export function getPortfolioPostBySlug(slug: string) {
  return getPortfolioPosts().find((post) => post.slug === slug) ?? null;
}

export async function fetchPortfolioPosts(): Promise<PortfolioPostViewModel[]> {
  return getPortfolioPosts();
}

export async function fetchPortfolioPostBySlug(slug: string) {
  return getPortfolioPostBySlug(slug);
}
