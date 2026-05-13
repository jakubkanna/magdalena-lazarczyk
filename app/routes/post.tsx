import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { Sidebar } from "../components/sidebar";
import {
  fetchPortfolioPostBySlug,
  loadPortfolioImageSrc,
  type PortfolioPostViewModel,
} from "../data/portfolio-api";

const sections = ["Warsztaty", "Teatr", "Sztuka"] as const;
const categoryToSlug: Record<(typeof sections)[number], string> = {
  Warsztaty: "warsztaty",
  Teatr: "teatr",
  Sztuka: "sztuka",
};

type MockBlock =
  | { type: "paragraph"; content: string }
  | { type: "quote"; content: string }
  | { type: "image"; alt: string; src: string }
  | { type: "gallery"; images: { alt: string; src: string }[] }
  | { type: "grid"; items: string[] };

function createMockBlocks(post: PortfolioPostViewModel, imageSrc: string): MockBlock[] {
  return [
    {
      type: "paragraph",
      content:
        post.content ??
        `${post.title} to projekt zrealizowany w obszarze ${post.category.toLowerCase()}, w którym obraz, przestrzeń i materia pracują jako równorzędne elementy narracji.`,
    },
    {
      type: "paragraph",
      content:
        "Układ scenograficzny traktowany jest tu jak żywy system: porządkuje ruch, buduje napięcia i zostawia miejsce dla nieoczywistych relacji między ciałem, obiektem oraz światłem.",
    },
    {
      type: "quote",
      content:
        "Przedmiot nie jest dekoracją. Jest nośnikiem pamięci, gestu i zmiany.",
    },
    {
      type: "grid",
      items: [
        post.venue,
        post.place,
        post.year,
        ...post.credits,
      ],
    },
    {
      type: "gallery",
      images: [
        { src: imageSrc, alt: `${post.title} - zdjęcie 1` },
        { src: imageSrc, alt: `${post.title} - zdjęcie 2` },
      ],
    },
    {
      type: "paragraph",
      content:
        "Mock WordPress blocks are rendered as a front-end contract for the future CMS integration: paragraphs, media, quotes and structured grids can be replaced by real block data without changing the page layout.",
    },
  ];
}

function PostBlocks({ blocks }: { blocks: MockBlock[] }) {
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-8 pb-16 text-black/90">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={`${block.type}-${index}`}
              className="col-span-7 m-0 text-[clamp(18px,2vw,30px)] leading-[1.12] max-lg:col-span-10 max-md:col-span-12"
            >
              {block.content}
            </p>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={`${block.type}-${index}`}
              className="col-span-5 col-start-8 m-0 pl-4 text-right text-[clamp(22px,3vw,46px)] leading-none italic max-lg:col-span-10 max-lg:col-start-1 max-md:col-span-12"
            >
              {block.content}
            </blockquote>
          );
        }

        if (block.type === "grid") {
          return (
            <dl
              key={`${block.type}-${index}`}
              className="col-span-12 m-0 grid grid-cols-4 gap-2 py-4 text-sm leading-tight max-md:grid-cols-2"
            >
              {block.items.map((item) => (
                <div key={item} className="min-h-16 bg-black/[0.035] p-3">
                  <dt className="sr-only">Informacja</dt>
                  <dd className="m-0">{item}</dd>
                </div>
              ))}
            </dl>
          );
        }

        if (block.type === "gallery") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="col-span-12 grid max-w-[1080px] grid-cols-2 gap-2 max-md:grid-cols-1"
            >
              {block.images.map((image) => (
                <img
                  key={image.alt}
                  className="block h-auto w-full"
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          );
        }

        return (
          <figure
            key={`${block.type}-${index}`}
            className="col-span-12 m-0 max-w-[1080px]"
          >
            <img
              className="block h-auto w-full"
              src={block.src}
              alt={block.alt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        );
      })}
    </div>
  );
}

export default function Post() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRouteState = location.state as
    | { post?: PortfolioPostViewModel; imageSrc?: string }
    | null;
  const initialPost: PortfolioPostViewModel | null =
    initialRouteState?.post && initialRouteState.post.slug === params.slug
      ? initialRouteState.post
      : null;
  const initialImageSrc = initialPost ? (initialRouteState?.imageSrc ?? "") : "";
  const [post, setPost] = useState<PortfolioPostViewModel | null>(initialPost);
  const [imageSrc, setImageSrc] = useState(initialImageSrc);
  const [isLoading, setIsLoading] = useState(!initialPost || !initialImageSrc);
  const [isFeaturedImageReady, setIsFeaturedImageReady] = useState(
    !initialImageSrc,
  );
  const [hasAnimatedArticle, setHasAnimatedArticle] = useState(false);
  const [sidebarVariant, setSidebarVariant] = useState<"default" | "minimized">(
    "minimized",
  );
  const articleRef = useRef<HTMLElement | null>(null);
  const featuredImageRef = useRef<HTMLImageElement | null>(null);
  const activeCategory = searchParams.get("from");

  useEffect(() => {
    let mounted = true;

    async function loadPost() {
      if (!params.slug) return;
      if (!post || post.slug !== params.slug || !imageSrc) {
        setIsLoading(true);
      }
      const nextPost = await fetchPortfolioPostBySlug(params.slug);
      const nextImageSrc = nextPost
        ? await loadPortfolioImageSrc(nextPost.image)
        : "";

      if (!mounted) return;
      setPost(nextPost);
      setIsFeaturedImageReady(!nextImageSrc);
      setImageSrc(nextImageSrc);
      setIsLoading(false);
    }

    void loadPost();
    return () => {
      mounted = false;
    };
  }, [params.slug]);

  const blocks = post && imageSrc ? createMockBlocks(post, imageSrc) : [];

  useLayoutEffect(() => {
    const image = featuredImageRef.current;
    if (!imageSrc || !image?.complete) return;

    if (image.decode) {
      image.decode()
        .then(() => setIsFeaturedImageReady(true))
        .catch(() => setIsFeaturedImageReady(true));
      return;
    }

    setIsFeaturedImageReady(true);
  }, [imageSrc]);

  const isArticleReady =
    !isLoading && (post === null || !imageSrc || isFeaturedImageReady);

  useLayoutEffect(() => {
    if (!isArticleReady || hasAnimatedArticle) return;
    const article = articleRef.current;
    if (!article) return;

    article.style.transform = "translateY(112%)";
    const animation = article.animate(
      [
        { transform: "translateY(112%)" },
        { transform: "translateY(0%)" },
      ],
      {
        duration: 520,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    );

    animation.onfinish = () => {
      article.style.transform = "";
      setHasAnimatedArticle(true);
    };
    animation.oncancel = () => {
      article.style.transform = "";
    };

    return () => animation.cancel();
  }, [hasAnimatedArticle, isArticleReady]);

  const goBack = () => {
    if (
      activeCategory === "Warsztaty" ||
      activeCategory === "Teatr" ||
      activeCategory === "Sztuka"
    ) {
      navigate(`/${categoryToSlug[activeCategory]}`, {
        state: { animateContainerFromPost: true },
      });
      return;
    }

    navigate("/");
  };

  return (
    <main
      className="relative isolate h-svh min-h-svh w-screen overflow-hidden bg-[#e8dfd0]"
      aria-label={post?.title ?? "Projekt"}
    >
      <div className="flex h-full min-h-0 w-screen max-md:block">
        <Sidebar
          variant={sidebarVariant}
          activeCategory={activeCategory}
          hoveredCategory={null}
          categories={sections}
          bioOpen={false}
          contactOpen={false}
          showSpinner={isLoading}
          onHomeClick={() => navigate("/")}
          onBioClick={() => navigate("/#bio")}
          onContactClick={() => navigate("/#contact")}
          onCategoryHover={() => undefined}
          onCategorySelect={(category) =>
            navigate(`/${categoryToSlug[category as (typeof sections)[number]]}`)
          }
          onExpand={() => setSidebarVariant("default")}
        />

        <article
          ref={articleRef}
          className="relative z-[6] h-full min-h-0 min-w-0 flex-1 overflow-y-auto bg-white p-2 text-black/90 shadow-[-12px_0_18px_rgba(0,0,0,0.22)]"
          style={!hasAnimatedArticle ? { transform: "translateY(112%)" } : undefined}
        >
          {isLoading ? (
            <div className="grid h-full place-items-center">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            </div>
          ) : post ? (
            <>
              <header className="grid grid-cols-12 gap-2 pb-2">
                <h1 className="col-span-9 m-0 text-[clamp(48px,11vw,180px)] leading-[0.82] font-normal text-black/90 max-md:col-span-12">
                  {post.title}
                </h1>
                <div className="col-span-3 self-end text-right text-sm leading-tight max-md:col-span-12 max-md:text-left">
                  <p className="m-0">{post.venue}</p>
                  <p className="m-0">
                    {post.place}, {post.year}
                  </p>
                </div>
              </header>

              {imageSrc ? (
                <img
                  ref={featuredImageRef}
                  className="mb-8 block h-auto w-full max-w-[1080px]"
                  src={imageSrc}
                  alt={post.title}
                  loading="eager"
                  decoding="async"
                  onLoad={(event) => {
                    const image = event.currentTarget;
                    if (image.decode) {
                      image.decode()
                        .then(() => setIsFeaturedImageReady(true))
                        .catch(() => setIsFeaturedImageReady(true));
                      return;
                    }
                    setIsFeaturedImageReady(true);
                  }}
                  onError={() => setIsFeaturedImageReady(true)}
                />
              ) : null}

              <PostBlocks blocks={blocks} />
              <button
                type="button"
                className="sticky bottom-2.5 z-[999] ml-auto mr-5 flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#eee4d5] text-black/90 shadow-[0_4px_16px_rgba(0,0,0,0.24)] transition-[background-color,color,transform] duration-200 hover:scale-105 hover:bg-[#e0d6c7] hover:text-black"
                onClick={goBack}
                aria-label="Wróć"
              >
                <img
                  className="block size-5 rotate-180"
                  src={`${import.meta.env.BASE_URL}arrow-forward-outline.svg`}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <h1 className="m-0 text-[clamp(54px,12vw,180px)] leading-none font-normal">
                  404
                </h1>
                <p className="mt-3 text-lg">Nie znaleziono projektu.</p>
                <button
                  type="button"
                  className="mt-6 cursor-pointer rounded-full bg-[#eee4d5] px-4 py-2 text-base leading-none text-black/90 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[background-color,color] duration-200 hover:bg-[#e0d6c7] hover:text-black"
                  onClick={() => navigate("/")}
                >
                  Wróć na stronę główną
                </button>
              </div>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
