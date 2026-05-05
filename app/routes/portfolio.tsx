import type { Route } from "./+types/portfolio";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchPortfolioPosts,
  loadPortfolioImageSrc,
  type PortfolioCategory,
  type PortfolioPostViewModel,
} from "../data/portfolio-api";

const portfolioCategories: PortfolioCategory[] = [
  "Teatr",
  "Sztuka",
  "Warsztaty",
];
const portfolioBackgroundClassByCategory: Record<
  PortfolioCategory | "all",
  string
> = {
  all: "bg-sky-400",
  Teatr: "bg-[#171717]",
  Sztuka: "bg-white",
  Warsztaty: "bg-pink-300",
};
const postBatchSize = 10;
const portfolioImageSrcCache = new Map<number, string>();
const portfolioImageLoadPromiseCache = new Map<
  number,
  Promise<readonly [number, string]>
>();
type ScrollDirection = "up" | "down";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Portfolio | Magdalena Łazarczyk" },
    {
      name: "description",
      content:
        "Portfolio Magdaleny Łazarczyk: teatr, sztuka, warsztaty, scenografia i kostiumy.",
    },
    { property: "og:title", content: "Portfolio | Magdalena Łazarczyk" },
    {
      property: "og:description",
      content:
        "Teatr, sztuka, warsztaty, scenografia i kostiumy Magdaleny Łazarczyk.",
    },
  ];
}

function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`} role="status">
      <span className="portfolio-spinner" aria-hidden="true" />
      <span className="sr-only">Ładowanie</span>
    </div>
  );
}

function preloadPortfolioImage(src: string) {
  return new Promise<void>((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const image = new Image();
    const finish = () => resolve();

    image.decoding = "async";
    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode().then(finish).catch(finish);
        return;
      }

      finish();
    };
    image.onerror = finish;
    image.src = src;
  });
}

async function resolvePortfolioImage(post: PortfolioPostViewModel) {
  const cachedSrc = portfolioImageSrcCache.get(post.id);

  if (cachedSrc) {
    return [post.id, cachedSrc] as const;
  }

  const cachedPromise = portfolioImageLoadPromiseCache.get(post.id);

  if (cachedPromise) {
    return cachedPromise;
  }

  const loadPromise = loadPortfolioImageSrc(post.image).then(async (src) => {
    await preloadPortfolioImage(src);

    if (src) {
      portfolioImageSrcCache.set(post.id, src);
    }

    portfolioImageLoadPromiseCache.delete(post.id);
    return [post.id, src] as const;
  });

  portfolioImageLoadPromiseCache.set(post.id, loadPromise);
  return loadPromise;
}

async function resolvePortfolioImages(posts: PortfolioPostViewModel[]) {
  if (!posts.length) {
    return {};
  }

  const loadedImages = await Promise.all(posts.map(resolvePortfolioImage));
  return Object.fromEntries(loadedImages);
}

function LinkOutlineIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 512 512"
    >
      <path
        d="M200.66 352H144a96 96 0 0 1 0-192h55.41"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
      />
      <path
        d="M312.59 160H368a96 96 0 0 1 0 192h-56.66"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
      />
      <path
        d="M169.07 256h175.86"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
      />
    </svg>
  );
}

function PortfolioPostCard({
  post,
  imageSrc,
}: {
  post: PortfolioPostViewModel;
  imageSrc?: string;
}) {
  return (
    <article className="group">
      <div className="relative overflow-hidden">
        {imageSrc ? (
          <img
            className="block h-auto w-full"
            src={imageSrc}
            alt={post.title}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <div
            className="portfolio-post-skeleton aspect-[4/3] w-full"
            aria-hidden="true"
          />
        )}
        {imageSrc && post.externalUrl ? (
          <a
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center text-[#111] opacity-0 transition-[color,opacity] duration-150 hover:text-[var(--site-hover-color)] group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:text-[var(--site-hover-color)] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111]"
            href={post.externalUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${post.title} in a new tab`}
          >
            <LinkOutlineIcon />
          </a>
        ) : null}
        {imageSrc ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 md:p-5">
            <div className="w-[min(76%,760px)] translate-y-3 rounded-3xl bg-white px-5 py-5 text-[#222] shadow-[10px_14px_34px_rgb(0_0_0_/_0.24)] transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0 md:rounded-[28px] md:px-7 md:py-6">
              <h2 className="font-display text-lg uppercase leading-tight italic">
                {post.title}
              </h2>
              <div className="font-display mt-6 font-normal leading-[1.16]">
                <p>
                  {post.venue}, {post.place}, {post.year}
                </p>
                {post.credits.map((credit) => (
                  <p key={credit}>{credit}</p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function Portfolio() {
  const [posts, setPosts] = useState<PortfolioPostViewModel[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<PortfolioCategory | null>(null);
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection | null>(null);
  const [renderedPostCount, setRenderedPostCount] = useState(postBatchSize);
  const [imageSrcByPostId, setImageSrcByPostId] = useState<
    Record<number, string>
  >({});
  const [isInitialRenderReady, setIsInitialRenderReady] = useState(false);
  const [hasShownPortfolioContent, setHasShownPortfolioContent] =
    useState(false);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollRootRef = useRef<HTMLElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMoreRef = useRef(false);

  const loadPostImages = useCallback(
    async (postsToLoad: PortfolioPostViewModel[]) => {
      const unloadedPosts = postsToLoad.filter(
        (post) => !imageSrcByPostId[post.id],
      );

      if (!unloadedPosts.length) {
        return;
      }

      const loadedImages = await resolvePortfolioImages(unloadedPosts);

      setImageSrcByPostId((currentImages) => ({
        ...currentImages,
        ...loadedImages,
      }));
    },
    [imageSrcByPostId],
  );

  useEffect(() => {
    let isMounted = true;

    fetchPortfolioPosts().then(async (portfolioPosts) => {
      const initialPosts = portfolioPosts.slice(0, postBatchSize);
      const loadedImages = await resolvePortfolioImages(initialPosts);

      if (isMounted) {
        setPosts(portfolioPosts);
        setImageSrcByPostId(loadedImages);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (isMounted) {
              setIsInitialRenderReady(true);
            }
          });
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePortfolioScroll = (
    event: React.UIEvent<HTMLElement, UIEvent>,
  ) => {
    const scrollTop = event.currentTarget.scrollTop;

    if (Math.abs(scrollTop - lastScrollTop.current) < 2) {
      return;
    }

    const nextScrollDirection: ScrollDirection =
      scrollTop < lastScrollTop.current ? "up" : "down";

    setScrollDirection(nextScrollDirection);
    window.dispatchEvent(
      new CustomEvent<ScrollDirection>("portfolio-scroll-direction", {
        detail: nextScrollDirection,
      }),
    );
    lastScrollTop.current = Math.max(scrollTop, 0);
  };

  const handlePortfolioClick = () => {
    setActiveCategory(null);
    scrollRootRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    lastScrollTop.current = 0;
  };

  const visiblePosts = useMemo(
    () =>
      activeCategory
        ? posts.filter((post) => post.category === activeCategory)
        : posts,
    [activeCategory, posts],
  );
  const renderedPosts = useMemo(
    () => visiblePosts.slice(0, renderedPostCount),
    [renderedPostCount, visiblePosts],
  );
  const hasMorePosts = renderedPostCount < visiblePosts.length;

  useEffect(() => {
    setRenderedPostCount(postBatchSize);
    scrollRootRef.current?.scrollTo({ top: 0 });
    lastScrollTop.current = 0;
  }, [activeCategory, posts.length]);

  useEffect(() => {
    loadPostImages(visiblePosts.slice(0, renderedPostCount));
  }, [loadPostImages, renderedPostCount, visiblePosts]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    const scrollRoot = scrollRootRef.current;

    if (!loadMoreElement || !scrollRoot || !hasMorePosts) {
      return;
    }

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry?.isIntersecting && !isLoadingMoreRef.current) {
          const nextRenderedPostCount = Math.min(
            renderedPostCount + postBatchSize,
            visiblePosts.length,
          );
          const nextPosts = visiblePosts.slice(
            renderedPostCount,
            nextRenderedPostCount,
          );

          isLoadingMoreRef.current = true;
          setIsLoadingMorePosts(true);
          await loadPostImages(nextPosts);
          setRenderedPostCount(nextRenderedPostCount);
          setIsLoadingMorePosts(false);
          isLoadingMoreRef.current = false;
        }
      },
      {
        root: scrollRoot,
        rootMargin: "600px 0px",
      },
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [hasMorePosts, loadPostImages, renderedPostCount, visiblePosts]);

  const isPortfolioReady =
    isInitialRenderReady &&
    renderedPosts.every((post) => imageSrcByPostId[post.id]);
  const shouldShowPortfolioContent = hasShownPortfolioContent || isPortfolioReady;
  const portfolioBackgroundClass =
    portfolioBackgroundClassByCategory[activeCategory ?? "all"];
  const portfolioTextClass =
    activeCategory === "Teatr" ? "text-white" : "text-[#111]";
  const portfolioChromeColor = activeCategory === "Teatr" ? "#fff" : "#111";

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--site-chrome-color",
      portfolioChromeColor,
    );

    return () => {
      document.documentElement.style.removeProperty("--site-chrome-color");
    };
  }, [portfolioChromeColor]);

  useEffect(() => {
    if (isPortfolioReady) {
      setHasShownPortfolioContent(true);
    }
  }, [isPortfolioReady]);

  return (
    <>
      {!shouldShowPortfolioContent ? (
        <div
          className={`fixed inset-0 z-60 flex items-center justify-center transition-[background-color,color] duration-500 ease-in-out ${portfolioBackgroundClass} ${portfolioTextClass}`}
        >
          <LoadingSpinner />
        </div>
      ) : null}
      <main
        ref={scrollRootRef}
        className={`h-svh overflow-y-auto px-4 pb-7 pt-28 transition-[background-color,color,opacity] duration-500 ease-in-out md:pb-8 ${portfolioBackgroundClass} ${portfolioTextClass} ${
          shouldShowPortfolioContent ? "opacity-100" : "opacity-0"
        }`}
        onScroll={handlePortfolioScroll}
        aria-hidden={!shouldShowPortfolioContent}
      >
        <section
          className="grid grid-cols-1 gap-1.5 pb-24 md:grid-cols-2 md:gap-4 md:pb-28 2xl:grid-cols-3 2xl:gap-4"
          aria-label="Portfolio posts"
        >
          {renderedPosts.map((post) => (
            <PortfolioPostCard
              key={post.id}
              post={post}
              imageSrc={imageSrcByPostId[post.id]}
            />
          ))}
          {hasMorePosts ? (
            <div
              ref={loadMoreRef}
              className="col-span-full flex h-16 items-end justify-center"
            >
              {isLoadingMorePosts ? <LoadingSpinner /> : null}
            </div>
          ) : null}
        </section>
      </main>
      <footer
        className="fixed bottom-3 left-4 right-4 z-50 flex flex-wrap items-center gap-2"
        aria-label="Portfolio categories"
      >
        <button
          className={`font-display hidden border-0 bg-transparent p-0 font-normal leading-none transition-[color,font-size] duration-500 ease-in-out hover:text-[var(--site-hover-color)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current md:block ${portfolioTextClass} ${
            scrollDirection === "down"
              ? "text-[clamp(24px,2.5vw,36px)]"
              : "text-[20px]"
          }`}
          type="button"
          aria-pressed={activeCategory === null}
          onClick={handlePortfolioClick}
        >
          Portfolio
        </button>
        <div className="flex flex-1 flex-wrap justify-between gap-2 md:ml-auto md:flex-none md:justify-end md:gap-3">
          {portfolioCategories.map((category) => (
            <button
              className={`font-display rounded-full leading-none text-[#050505] shadow-[8px_10px_20px_rgb(0_0_0_/_0.24)] transition-[background-color,font-size,padding,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111] ${
                activeCategory === category
                  ? "bg-[var(--site-hover-color)] font-normal text-white"
                  : "bg-[#fff7f7] font-normal"
              } ${
                scrollDirection === "down"
                  ? "px-3.5 py-1.5 text-[clamp(24px,2.5vw,36px)] md:px-4 md:py-2"
                  : "px-3 py-1 text-[20px] md:px-3 md:py-1.5"
              }`}
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              onClick={() =>
                setActiveCategory((currentCategory) =>
                  currentCategory === category ? null : category,
                )
              }
            >
              {category}
            </button>
          ))}
        </div>
      </footer>
    </>
  );
}
