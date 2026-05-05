import posts from "./portfolio-posts.json";

export type PortfolioPost = {
  id: number;
  title: string;
  venue: string;
  place: string;
  year: string;
  credits: string[];
  image: string;
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
};

export async function loadPortfolioImageSrc(image: string) {
  return imageByFileName[image]?.() ?? "";
}

export async function fetchPortfolioPosts(): Promise<PortfolioPostViewModel[]> {
  const wordpressPosts = posts as PortfolioPost[];

  return wordpressPosts.map((post) => ({
    ...post,
    category:
      post.category ?? fallbackCategories[(post.id - 1) % fallbackCategories.length],
  }));
}
