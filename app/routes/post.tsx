import type { Route } from "./+types/post";
import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { AnimatedPageContainer } from "../components/animated-page-container";
import { BioContactPanel } from "../components/bio-contact-panel";
import { CategoryGrid } from "../components/category-grid";
import { Sidebar } from "../components/sidebar";
import {
  fetchPortfolioPosts,
  fetchPortfolioPostBySlug,
  getPortfolioPostBySlug,
  loadPortfolioImageSrc,
  type PortfolioCategory,
  type PortfolioPostViewModel,
} from "../data/portfolio-api";
import { defaultSiteContent, fetchSiteContent } from "../data/site-content";
import { sanitizeContentHtml } from "../utils/html-content";

const sections = ["Teatr", "Sztuka", "Warsztaty"] as const;
const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";
const categoryToSlug: Record<(typeof sections)[number], string> = {
  Warsztaty: "warsztaty",
  Teatr: "teatr",
  Sztuka: "sztuka",
};
const categoryColors: Record<(typeof sections)[number], string> = {
  Warsztaty: "#F2621C",
  Sztuka: "#D4FC85",
  Teatr: "#0011FF",
};

const isMobileViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;

export function meta({ params }: Route.MetaArgs) {
  const post = params.slug ? getPortfolioPostBySlug(params.slug) : null;
  const title = post
    ? `${post.title} | Magdalena Łazarczyk`
    : "Projekt | Magdalena Łazarczyk";
  const description = post
    ? `${post.title} - ${post.venue}, ${post.place}, ${post.year}.`
    : "Projekt z portfolio Magdaleny Łazarczyk.";

  return [
    { title },
    {
      name: "description",
      content: description,
    },
  ];
}

function hexToRgba(hex: string, alpha: number) {
  const normalizedHex = hex.replace("#", "");
  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);

  return `rgb(${red} ${green} ${blue} / ${alpha})`;
}

type PreviewImage = {
  alt: string;
  description?: string;
  src: string;
};

function getAttributeValue(source: string, attributeName: string) {
  const match = source.match(
    new RegExp(`${attributeName}=["']([^"']+)["']`, "i"),
  );
  return match?.[1] ?? "";
}

function getPreviewImagesFromHtml(html: string): PreviewImage[] {
  if (!html) return [];

  if (typeof document !== "undefined") {
    const template = document.createElement("template");
    template.innerHTML = html;

    return Array.from(template.content.querySelectorAll("img"))
      .map((image, index) => {
        const figure = image.closest("figure");
        const caption =
          figure?.querySelector("figcaption")?.textContent?.trim() ?? "";

        return {
          alt: image.getAttribute("alt") || `Zdjęcie ${index + 1}`,
          description: caption || undefined,
          src: image.getAttribute("src") ?? "",
        };
      })
      .filter((image) => image.src);
  }

  return Array.from(html.matchAll(/<img\b[^>]*>/gi))
    .map((match, index) => ({
      alt: getAttributeValue(match[0], "alt") || `Zdjęcie ${index + 1}`,
      src: getAttributeValue(match[0], "src"),
    }))
    .filter((image) => image.src);
}

export default function Post() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRouteState = location.state as {
    post?: PortfolioPostViewModel;
    imageSrc?: string;
  } | null;
  const initialPost: PortfolioPostViewModel | null =
    initialRouteState?.post && initialRouteState.post.slug === params.slug
      ? initialRouteState.post
      : null;
  const initialImageSrc = initialPost
    ? (initialRouteState?.imageSrc ?? "")
    : "";
  const [post, setPost] = useState<PortfolioPostViewModel | null>(initialPost);
  const [imageSrc, setImageSrc] = useState(initialImageSrc);
  const [galleryImageSrcs, setGalleryImageSrcs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(!initialPost || !initialImageSrc);
  const [sidebarVariant, setSidebarVariant] = useState<"default" | "minimized">(
    "minimized",
  );
  const [bioOpen, setBioOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [copiedContact, setCopiedContact] = useState<"email" | "phone" | null>(
    null,
  );
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [pendingCategory, setPendingCategory] = useState<
    (typeof sections)[number] | null
  >(null);
  const [isCategoryTransitioning, setIsCategoryTransitioning] = useState(false);
  const [portfolioPosts, setPortfolioPosts] = useState<
    PortfolioPostViewModel[]
  >([]);
  const [imageSrcByPostId, setImageSrcByPostId] = useState<
    Record<number, string>
  >({});
  const [siteContent, setSiteContent] = useState(defaultSiteContent);
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
      const nextGalleryImageSrcs = nextPost?.gallery
        ? (
            await Promise.all(
              nextPost.gallery.map((image) => loadPortfolioImageSrc(image)),
            )
          ).filter(Boolean)
        : [];

      if (!mounted) return;
      setPost(nextPost);
      setImageSrc(nextImageSrc);
      setGalleryImageSrcs(nextGalleryImageSrcs);
      setIsLoading(false);
    }

    void loadPost();
    return () => {
      mounted = false;
    };
  }, [params.slug]);

  useEffect(() => {
    let mounted = true;

    fetchPortfolioPosts().then(async (nextPosts) => {
      if (!mounted) return;
      setPortfolioPosts(nextPosts);
      const images = await Promise.all(
        nextPosts.map(
          async (nextPost) =>
            [nextPost.id, await loadPortfolioImageSrc(nextPost.image)] as const,
        ),
      );
      if (!mounted) return;
      setImageSrcByPostId(Object.fromEntries(images));
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchSiteContent().then((content) => {
      if (mounted) setSiteContent(content);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const previewImages: PreviewImage[] = [
    ...(post && imageSrc
      ? [
          {
            alt: post.title,
            src: imageSrc,
            description: `${post.venue}, ${post.place}, ${post.year}`,
          },
        ]
      : []),
    ...(post
      ? galleryImageSrcs.map((src, index) => ({
          alt: `${post.title} - zdjęcie ${index + 2}`,
          src,
        }))
      : []),
    ...(post ? getPreviewImagesFromHtml(post.content ?? "") : []),
  ];
  const activePreview =
    previewIndex !== null ? previewImages[previewIndex] : undefined;
  const previewBackdropColor =
    activeCategory === "Warsztaty" ||
    activeCategory === "Teatr" ||
    activeCategory === "Sztuka"
      ? categoryColors[activeCategory]
      : "#7eaed8";

  const openImagePreview = (image: PreviewImage) => {
    const nextIndex = previewImages.findIndex(
      (previewImage) =>
        previewImage.src === image.src ||
        (previewImage.alt === image.alt && previewImage.src === image.src),
    );
    setPreviewIndex(nextIndex >= 0 ? nextIndex : 0);
  };

  const openPostContentImagePreview = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const image = target.closest("img");
    if (!(image instanceof HTMLImageElement)) return;

    const src = image.getAttribute("src") ?? image.currentSrc;
    if (!src) return;

    const figure = image.closest("figure");
    const caption =
      figure?.querySelector("figcaption")?.textContent?.trim() ?? "";

    openImagePreview({
      alt: image.getAttribute("alt") || post?.title || "Zdjęcie",
      description: caption || undefined,
      src,
    });
  };

  const showPreviousPreviewImage = () => {
    setPreviewIndex((current) => {
      if (current === null || previewImages.length === 0) return current;
      return (current - 1 + previewImages.length) % previewImages.length;
    });
  };

  const showNextPreviewImage = () => {
    setPreviewIndex((current) => {
      if (current === null || previewImages.length === 0) return current;
      return (current + 1) % previewImages.length;
    });
  };

  useEffect(() => {
    if (previewIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewIndex(null);
        return;
      }
      if (event.key === "ArrowLeft") {
        showPreviousPreviewImage();
      }
      if (event.key === "ArrowRight") {
        showNextPreviewImage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewIndex, previewImages.length]);

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

    navigate("/", { state: { animateContainerFromPost: true } });
  };

  const selectCategory = (category: (typeof sections)[number]) => {
    if (isCategoryTransitioning) return;
    setSidebarVariant("minimized");
    setBioOpen(false);
    setContactOpen(false);
    setPendingCategory(category);
    setIsCategoryTransitioning(true);
  };

  const finishCategoryTransition = () => {
    if (!pendingCategory) return;
    navigate(`/${categoryToSlug[pendingCategory]}`);
  };

  const getCategoryPosts = (category: (typeof sections)[number]) =>
    portfolioPosts.filter(
      (portfolioPost) =>
        portfolioPost.category === (category as PortfolioCategory),
    );

  const closeBio = () => {
    setBioOpen(false);
  };

  const closeContact = () => {
    setContactOpen(false);
    setCopiedContact(null);
  };

  const copyContactValue = async (value: string, key: "email" | "phone") => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedContact(key);
    window.setTimeout(() => {
      setCopiedContact((current) => (current === key ? null : current));
    }, 1400);
  };

  return (
    <main
      className="relative isolate h-svh min-h-svh w-screen overflow-hidden bg-[#e8dfd0]"
      aria-label={post?.title ?? "Projekt"}
    >
      <div className="flex h-full min-h-0 w-screen max-md:flex-col">
        <Sidebar
          variant={sidebarVariant}
          activeCategory={activeCategory}
          hoveredCategory={null}
          categories={sections}
          categoryColors={categoryColors}
          showSpinner={isLoading || isCategoryTransitioning}
          bioOpen={bioOpen}
          contactOpen={contactOpen}
          onHomeClick={() => {
            if (isMobileViewport()) setSidebarVariant("minimized");
            navigate("/", { state: { animateContainerFromPost: true } });
          }}
          onCategoryHover={() => undefined}
          onCategorySelect={(category) =>
            selectCategory(category as (typeof sections)[number])
          }
          onCollapse={() => setSidebarVariant("minimized")}
          onExpand={() => setSidebarVariant("default")}
          onBioClick={() => {
            if (bioOpen) {
              closeBio();
            } else {
              setContactOpen(false);
              setCopiedContact(null);
              setBioOpen(true);
            }
            if (isMobileViewport()) setSidebarVariant("minimized");
          }}
          onContactClick={() => {
            if (contactOpen) {
              closeContact();
            } else {
              setBioOpen(false);
              setContactOpen(true);
            }
            if (isMobileViewport()) setSidebarVariant("minimized");
          }}
        />

        <div className="relative z-[6] h-full min-h-0 min-w-0 flex flex-1 flex-col bg-[#e8dfd0] shadow-[-12px_0_18px_rgba(0,0,0,0.22)]">
          <BioContactPanel
            bioOpen={bioOpen}
            contactOpen={contactOpen}
            copiedContact={copiedContact}
            siteContent={siteContent}
            textColorClass="text-black/90"
            onClose={() => {
              closeBio();
              closeContact();
            }}
            onCopyContact={(value, key) => void copyContactValue(value, key)}
          />

          <section className="relative z-10 min-h-0 flex-1 overflow-hidden shadow-[0_-12px_18px_rgba(0,0,0,0.18)]">
            <AnimatedPageContainer
              animationKey={`post-${params.slug ?? "missing"}`}
              animate
              ready={!isLoading}
              className="post-scrollbar absolute inset-0 overflow-y-auto bg-white px-2 md:px-4 pb-4 pt-5 text-black/90"
            >
              {isLoading ? (
                <div className="grid h-full place-items-center" role="status">
                  <img
                    className="block size-8 animate-spin"
                    src={`${import.meta.env.BASE_URL}1455.png`}
                    alt=""
                    aria-hidden="true"
                  />
                  <span className="sr-only">Ładowanie</span>
                </div>
              ) : post ? (
                <>
                  <header className="grid grid-cols-12 gap-2 pb-2">
                    <h1 className="post-title col-span-12 m-0 text-5xl leading-[0.94] font-normal italic text-black/90">
                      {post.title}
                    </h1>
                    <div className="col-span-12 grid py-12 px-2 text-right text-xs leading-tight">
                      <span>{post.venue}</span>
                      <span>
                        {post.place}, {post.year}
                      </span>
                    </div>
                  </header>

                  {imageSrc ? (
                    <div className="mb-8 grid grid-cols-12 gap-2">
                      <button
                        type="button"
                        className="col-span-9 cursor-pointer appearance-none border-0 bg-transparent p-0 text-left max-lg:col-span-10 max-md:col-span-12"
                        onClick={() =>
                          openImagePreview({
                            alt: post.title,
                            src: imageSrc,
                            description: `${post.venue}, ${post.place}, ${post.year}`,
                          })
                        }
                      >
                        <img
                          className="block max-h-[calc(100svh-1rem)] w-full object-contain object-left-top"
                          src={imageSrc}
                          alt={post.title}
                          loading="eager"
                          decoding="async"
                        />
                      </button>
                    </div>
                  ) : null}

                  {post.content ? (
                    <div
                      className="wp-block-content wp-block-content-post"
                      onClick={openPostContentImagePreview}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeContentHtml(post.content),
                      }}
                    />
                  ) : null}
                  <button
                    type="button"
                    className="post-back-button sticky bottom-2 z-[999] ml-auto mr-2 flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#eee4d5] text-black/90 shadow-[0_4px_16px_rgba(0,0,0,0.24)] transition-[background-color,color,transform] duration-500 hover:rotate-[360deg] hover:scale-110 hover:text-black"
                    style={
                      {
                        "--post-back-button-hover-bg": activeCategory
                          ? categoryColors[
                              activeCategory as keyof typeof categoryColors
                            ]
                          : "#e0d6c7",
                      } as CSSProperties
                    }
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
                    <h1 className="m-0 text-8xl leading-none font-normal max-md:text-7xl">
                      404
                    </h1>
                    <p className="mt-3 text-lg">Nie znaleziono projektu.</p>
                    <button
                      type="button"
                      className="mt-6 cursor-pointer rounded-full bg-[#eee4d5] px-4 py-2 text-base leading-none text-black/90 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[background-color,color] duration-200 hover:bg-[#e0d6c7] hover:text-black"
                      onClick={() =>
                        navigate("/", {
                          state: { animateContainerFromPost: true },
                        })
                      }
                    >
                      Wróć na stronę główną
                    </button>
                  </div>
                </div>
              )}
            </AnimatedPageContainer>

            {pendingCategory ? (
              <AnimatedPageContainer
                animationKey={`post-category-${pendingCategory}`}
                animate
                ready
                className="absolute inset-0 z-20 overflow-y-auto overflow-x-hidden"
                style={{ backgroundColor: categoryColors[pendingCategory] }}
                onEntered={finishCategoryTransition}
              >
                <CategoryGrid
                  posts={getCategoryPosts(pendingCategory)}
                  imageSrcByPostId={imageSrcByPostId}
                />
              </AnimatedPageContainer>
            ) : null}
          </section>
        </div>
      </div>
      {activePreview ? (
        <div
          className="image-preview-fade fixed inset-0 z-[2000] grid place-items-center p-2"
          style={{ backgroundColor: hexToRgba(previewBackdropColor, 0.9) }}
          role="dialog"
          aria-modal="true"
          aria-label="Podgląd zdjęcia"
          onClick={() => setPreviewIndex(null)}
        >
          <button
            type="button"
            className="absolute right-2 top-2 z-[2001] flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#eee4d5] p-0 text-black/90 shadow-[0_4px_16px_rgba(0,0,0,0.24)] transition-[background-color,color,transform] duration-200 hover:scale-105 hover:bg-[#e0d6c7] hover:text-black"
            onClick={() => setPreviewIndex(null)}
            aria-label="Zamknij"
          >
            <span
              className="button-text-shake block size-5 bg-current"
              style={{
                WebkitMask: `url("${import.meta.env.BASE_URL}close.svg") center / contain no-repeat`,
                mask: `url("${import.meta.env.BASE_URL}close.svg") center / contain no-repeat`,
              }}
              aria-hidden="true"
            />
          </button>
          {previewImages.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-2 top-1/2 z-[2001] flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#eee4d5] text-black/90 shadow-[0_4px_16px_rgba(0,0,0,0.24)] transition-[background-color,color,transform] duration-200 hover:scale-105 hover:bg-[#e0d6c7] hover:text-black"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousPreviewImage();
                }}
                aria-label="Poprzednie zdjęcie"
              >
                <img
                  className="block size-5 rotate-180"
                  src={`${import.meta.env.BASE_URL}arrow-forward-outline.svg`}
                  alt=""
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 z-[2001] flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#eee4d5] text-black/90 shadow-[0_4px_16px_rgba(0,0,0,0.24)] transition-[background-color,color,transform] duration-200 hover:scale-105 hover:bg-[#e0d6c7] hover:text-black"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextPreviewImage();
                }}
                aria-label="Następne zdjęcie"
              >
                <img
                  className="block size-5"
                  src={`${import.meta.env.BASE_URL}arrow-forward-outline.svg`}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </>
          ) : null}
          <figure
            className="m-0 flex max-h-[calc(100svh-40px)] max-w-[calc(100vw-40px)] flex-col items-center gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              className="image-preview-media min-h-0 max-h-[calc(100svh-84px)] max-w-full object-contain"
              src={activePreview.src}
              alt={activePreview.alt}
            />
            {activePreview.description ? (
              <figcaption className="max-w-[min(720px,calc(100vw-40px))] text-center text-sm italic leading-tight text-black/90">
                {activePreview.description}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </main>
  );
}
