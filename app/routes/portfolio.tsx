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
const postBatchSize = 10;
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
  const src = await loadPortfolioImageSrc(post.image);
  await preloadPortfolioImage(src);
  return [post.id, src] as const;
}

function PortfolioPostCard({
  post,
  imageSrc,
}: {
  post: PortfolioPostViewModel;
  imageSrc: string;
}) {
  return (
    <article className="group">
      <div className="relative overflow-hidden">
        <img
          className="block h-auto w-full"
          src={imageSrc}
          alt={post.title}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 md:p-5">
          <div className="w-[min(76%,760px)] translate-y-3 rounded-3xl bg-white px-5 py-5 text-[#222] transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0 md:rounded-[28px] md:px-7 md:py-6">
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

      const loadedImages = await Promise.all(
        unloadedPosts.map(resolvePortfolioImage),
      );

      setImageSrcByPostId((currentImages) => ({
        ...currentImages,
        ...Object.fromEntries(loadedImages),
      }));
    },
    [imageSrcByPostId],
  );

  useEffect(() => {
    let isMounted = true;

    fetchPortfolioPosts().then(async (portfolioPosts) => {
      const initialPosts = portfolioPosts.slice(0, postBatchSize);
      const loadedImages = await Promise.all(
        initialPosts.map(resolvePortfolioImage),
      );

      if (isMounted) {
        setPosts(portfolioPosts);
        setImageSrcByPostId(Object.fromEntries(loadedImages));
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

  return (
    <>
      {!isPortfolioReady ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white">
          <LoadingSpinner />
        </div>
      ) : null}
      <main
        ref={scrollRootRef}
        className={`h-svh overflow-y-auto bg-white px-4 pb-7 pt-28 text-[#111] transition-opacity duration-200 md:px-6 md:pb-8 xl:px-7 ${
          isPortfolioReady ? "opacity-100" : "opacity-0"
        }`}
        onScroll={handlePortfolioScroll}
        aria-hidden={!isPortfolioReady}
      >
        <section
          className="grid grid-cols-1 gap-3 pb-28 md:grid-cols-2 md:gap-4 md:pb-32 2xl:grid-cols-3 2xl:gap-5"
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
        className="fixed bottom-3 left-3 right-8 z-50 flex flex-wrap items-center gap-2"
        aria-label="Portfolio categories"
      >
        <button
          className={`font-display hidden border-0 bg-transparent p-0 font-normal leading-none text-[#050505] transition-[font-size] duration-200 hover:text-[var(--site-hover-color)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111] md:block ${
            scrollDirection === "down"
              ? "text-[clamp(24px,2.5vw,36px)]"
              : "text-[20px]"
          }`}
          type="button"
          aria-pressed={activeCategory === null}
          onClick={() => setActiveCategory(null)}
        >
          Portfolio
        </button>
        <div className="ml-auto flex flex-1 flex-wrap justify-between gap-2 md:flex-none md:justify-end md:gap-3">
          {portfolioCategories.map((category) => (
            <button
              className={`font-display rounded-full bg-[#fff7f7] leading-none text-[#050505] shadow-[8px_10px_20px_rgb(0_0_0_/_0.24)] transition-[font-size,font-weight,padding,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111] ${
                activeCategory === category
                  ? "font-bold uppercase"
                  : "font-normal"
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
