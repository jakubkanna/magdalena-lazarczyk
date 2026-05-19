import type { Route } from "./+types/post";
import { useEffect, useState, type CSSProperties } from "react";
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

type MockBlock =
  | { type: "paragraph"; content: string }
  | { type: "columns"; columns: string[] }
  | { type: "quote"; content: string }
  | { type: "image"; alt: string; description?: string; src: string }
  | { type: "gallery"; images: PreviewImage[] }
  | { type: "grid"; items: string[] };

type PreviewImage = {
  alt: string;
  description?: string;
  src: string;
};

function createMockBlocks(
  post: PortfolioPostViewModel,
  imageSrc: string,
  galleryImageSrcs: string[],
): MockBlock[] {
  const galleryImages = [imageSrc, ...galleryImageSrcs].map((src, index) => ({
    src,
    alt: `${post.title} - zdjęcie ${index + 1}`,
    description:
      index === 0
        ? "Opis zdjęcia z bloku galerii WordPress."
        : "Opis zdjęcia przekazany z danych WordPress.",
  }));

  return [
    {
      type: "paragraph",
      content:
        post.content ??
        `${post.title} to projekt zrealizowany w obszarze ${post.category.toLowerCase()}, w którym obraz, przestrzeń i materia pracują jako równorzędne elementy narracji. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer materia, nibh sed cursus consequat, ligula nunc pretium lorem, vitae fermentum massa justo non arcu. Sed przestrzeń działa tu jak zapis procesu: odsłania kolejne warstwy pracy, testów i decyzji formalnych. Aliquam erat volutpat. Phasellus dictum turpis id metus volutpat, a luctus elit cursus. Mauris non dolor sed lorem tristique mattis.
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eget luctus elit. Cras faucibus nunc non diam laoreet faucibus. Ut consequat eget sem ut venenatis. Suspendisse et viverra arcu. Morbi tristique pretium mi non condimentum. Nullam eget sollicitudin sem. Proin non aliquet eros. Morbi fringilla, felis sed fermentum volutpat, ipsum ligula feugiat diam, vitae finibus nibh nulla in urna. Praesent efficitur tincidunt dolor, eget egestas diam placerat et.

In risus mauris, ultrices aliquam pharetra vel, venenatis in nunc. Donec laoreet est at leo elementum, vel malesuada sapien facilisis. Quisque consequat velit non orci viverra, pretium faucibus nisl vehicula. Etiam nec ornare libero. Fusce ac pharetra dolor. Cras vitae felis mattis, placerat tellus non, dapibus nisi. In sed facilisis ex, vel ullamcorper libero. Proin sit amet euismod eros, et cursus ante. Curabitur facilisis justo ac vestibulum tempor. Etiam rhoncus turpis et libero consequat, sit amet congue diam pharetra. Vivamus sed ligula at nisl mattis aliquet.

Nunc sed mauris eget nibh gravida dictum eu sed mauris. Vestibulum semper pretium turpis, quis aliquam elit pulvinar ut. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque feugiat, neque eget facilisis bibendum, felis nibh ullamcorper nisi, vel sagittis lacus libero ut turpis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aliquam hendrerit vulputate ornare. Fusce pulvinar, urna et efficitur vulputate, sem elit sollicitudin ante, quis commodo magna est in felis.

Nunc suscipit at justo quis consectetur. Praesent facilisis magna sit amet enim laoreet, vel imperdiet est molestie. Quisque in tellus sodales, vulputate mi ac, luctus lacus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Mauris posuere ut risus sed dapibus. Integer pellentesque purus non arcu iaculis, at vulputate mauris tincidunt. Aliquam volutpat, tellus id elementum eleifend, sapien nisi scelerisque mauris, at tempus tellus nibh ut erat. Fusce massa dui, mollis et velit sagittis, consectetur ullamcorper leo. In eget erat dapibus, pulvinar augue id, varius eros. Phasellus a metus in purus vestibulum ullamcorper a et nisi. Nam justo nibh, dignissim fringilla lorem quis, tristique molestie est. Proin nec arcu enim. Donec ac volutpat nunc. Etiam a tincidunt nisi. Aliquam ac ultrices enim, eget dictum ipsum.

Sed condimentum diam id quam feugiat lacinia. Sed ante velit, congue gravida nulla pellentesque, facilisis suscipit tellus. Nullam sollicitudin, eros id mollis mattis, nibh sapien vehicula elit, vitae efficitur eros elit nec purus. In semper lorem at sem accumsan, eu tincidunt leo lacinia. Duis ac venenatis nibh. Cras quis nisi non dolor ullamcorper sodales ut quis purus. Mauris ac sem ipsum. Vestibulum eu interdum nibh. Nullam laoreet, velit at malesuada lacinia, tellus turpis varius elit, ut dapibus nulla odio eu nisl. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque ut malesuada neque.`,
    },
    {
      type: "columns",
      columns: [
        "Układ scenograficzny traktowany jest tu jak żywy system: porządkuje ruch, buduje napięcia i zostawia miejsce dla nieoczywistych relacji między ciałem, obiektem oraz światłem. Suspendisse potenti. Donec luctus, arcu non porttitor luctus, neque erat gravida nibh, vitae tincidunt lorem neque id mi. W tej części opisu można umieścić dłuższy komentarz kuratorski, notatki z procesu albo fragment tekstu programowego.",
        "Warstwa wizualna powstaje z pracy na materiale, skali i relacji przedmiotów z przestrzenią. Dzięki temu projekt może funkcjonować jak samodzielny obraz oraz jako narzędzie dramaturgiczne. Curabitur vel sem sit amet massa suscipit posuere. Praesent vel orci sed justo gravida pulvinar. Tekst pełni funkcję roboczego wypełnienia dla przyszłych bloków WordPress i pozwala sprawdzić rytm scrollowania na dłuższych stronach.",
      ],
    },
    {
      type: "quote",
      content:
        "Przedmiot nie jest dekoracją. Jest nośnikiem pamięci, gestu i zmiany.",
    },
    {
      type: "grid",
      items: [post.venue, post.place, post.year, ...post.credits],
    },
    {
      type: "gallery",
      images: galleryImages,
    },
    {
      type: "paragraph",
      content:
        "Mock WordPress blocks are rendered as a front-end contract for the future CMS integration: paragraphs, media, quotes and structured grids can be replaced by real block data without changing the page layout. Vivamus vulputate, lorem in tincidunt malesuada, nulla ipsum hendrerit orci, non sagittis enim lorem sed erat. Aenean facilisis może zostać zastąpiona opisem technicznym, listą materiałów albo informacją o współpracy. Nam at orci id risus pretium faucibus. Etiam ac nibh non sem blandit tristique. Ten dłuższy tekst pozwala sprawdzić, jak zachowują się przyciski, podgląd zdjęć oraz powrót przy większej ilości treści.",
    },
  ];
}

function getBlockPreviewImages(blocks: MockBlock[]) {
  return blocks.flatMap((block): PreviewImage[] => {
    if (block.type === "image") {
      return [
        { alt: block.alt, description: block.description, src: block.src },
      ];
    }

    if (block.type === "gallery") {
      return block.images;
    }

    return [];
  });
}

function PostBlocks({
  blocks,
  onImageOpen,
}: {
  blocks: MockBlock[];
  onImageOpen: (image: PreviewImage) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-x-2 gap-y-12 text-black/90">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="col-span-8 m-0 text-md leading-[1.2] max-lg:col-span-10 max-md:col-span-12"
              dangerouslySetInnerHTML={{
                __html: sanitizeContentHtml(block.content),
              }}
            />
          );
        }

        if (block.type === "columns") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="col-span-12 columns-2 gap-4 text-md leading-[1.2] max-md:columns-1"
            >
              {block.columns.map((column) => (
                <div
                  key={column.slice(0, 32)}
                  className="mb-4 mt-0 break-inside-avoid"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeContentHtml(column),
                  }}
                />
              ))}
            </div>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={`${block.type}-${index}`}
              className="col-span-5 col-start-8 m-0 pl-4 text-right text-2xl leading-none italic max-lg:col-span-10 max-lg:col-start-1 max-lg:text-4xl max-md:col-span-12 max-md:text-3xl"
            >
              {block.content}
            </blockquote>
          );
        }

        if (block.type === "grid") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="col-span-12 m-0 grid grid-cols-4 gap-2 py-4 text-sm leading-tight max-md:grid-cols-1"
            >
              {block.items.map((item) => (
                <div key={item} className="min-h-16 bg-black/[0.035] p-3">
                  {item}
                </div>
              ))}
            </div>
          );
        }

        if (block.type === "gallery") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="col-span-12 grid grid-cols-3 gap-2 max-lg:grid-cols-2 max-md:grid-cols-1"
            >
              {block.images.map((image) => (
                <button
                  key={image.alt}
                  type="button"
                  className="cursor-pointer appearance-none border-0 bg-transparent p-0 text-left"
                  onClick={() => onImageOpen(image)}
                >
                  <img
                    className="block aspect-square w-full object-cover"
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  {image.description ? (
                    <span className="mt-1 block text-left text-sm italic leading-tight text-black/75">
                      {image.description}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          );
        }

        return (
          <figure
            key={`${block.type}-${index}`}
            className="col-span-9 m-0 max-lg:col-span-10 max-md:col-span-12"
          >
            <button
              type="button"
              className="cursor-pointer appearance-none border-0 bg-transparent p-0 text-left"
              onClick={() => onImageOpen({ alt: block.alt, src: block.src })}
            >
              <img
                className="block h-auto w-full"
                src={block.src}
                alt={block.alt}
                loading="lazy"
                decoding="async"
              />
              {block.description ? (
                <span className="mt-1 block text-left text-sm italic leading-tight text-black/75">
                  {block.description}
                </span>
              ) : null}
            </button>
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

  const blocks =
    post && imageSrc ? createMockBlocks(post, imageSrc, galleryImageSrcs) : [];
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
    ...getBlockPreviewImages(blocks),
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
        previewImage.src === image.src && previewImage.alt === image.alt,
    );
    setPreviewIndex(nextIndex >= 0 ? nextIndex : 0);
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
                    <h1 className="post-title col-span-12 m-0 text-2xl leading-[0.94] font-normal italic text-black/90">
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

                  <PostBlocks blocks={blocks} onImageOpen={openImagePreview} />
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
