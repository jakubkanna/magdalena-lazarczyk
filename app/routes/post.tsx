import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { Sidebar } from "../components/sidebar";
import { bioExhibitionColumns, bioParagraphs } from "../data/bio";
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
  | { type: "columns"; columns: string[] }
  | { type: "quote"; content: string }
  | { type: "image"; alt: string; src: string }
  | { type: "gallery"; images: { alt: string; src: string }[] }
  | { type: "grid"; items: string[] };

function createMockBlocks(
  post: PortfolioPostViewModel,
  imageSrc: string,
): MockBlock[] {
  return [
    {
      type: "paragraph",
      content:
        post.content ??
        `${post.title} to projekt zrealizowany w obszarze ${post.category.toLowerCase()}, w którym obraz, przestrzeń i materia pracują jako równorzędne elementy narracji.`,
    },
    {
      type: "columns",
      columns: [
        "Układ scenograficzny traktowany jest tu jak żywy system: porządkuje ruch, buduje napięcia i zostawia miejsce dla nieoczywistych relacji między ciałem, obiektem oraz światłem.",
        "Warstwa wizualna powstaje z pracy na materiale, skali i relacji przedmiotów z przestrzenią. Dzięki temu projekt może funkcjonować jak samodzielny obraz oraz jako narzędzie dramaturgiczne.",
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
    <div className="grid grid-cols-12 gap-x-2 gap-y-12 text-black/90">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={`${block.type}-${index}`}
              className="col-span-8 m-0 text-[clamp(18px,2vw,30px)] leading-[1.12] max-lg:col-span-10 max-md:col-span-12"
            >
              {block.content}
            </p>
          );
        }

        if (block.type === "columns") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="col-span-12 columns-2 gap-4 text-[clamp(18px,2vw,30px)] leading-[1.12] max-md:columns-1"
            >
              {block.columns.map((column) => (
                <p
                  key={column.slice(0, 32)}
                  className="mb-4 mt-0 break-inside-avoid"
                >
                  {column}
                </p>
              ))}
            </div>
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
            <div
              key={`${block.type}-${index}`}
              className="col-span-12 m-0 grid grid-cols-4 gap-2 py-4 text-sm leading-tight max-md:grid-cols-2"
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
              className="col-span-9 grid grid-cols-2 gap-2 max-lg:col-span-10 max-md:col-span-12 max-md:grid-cols-1"
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
            className="col-span-9 m-0 max-lg:col-span-10 max-md:col-span-12"
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
  const [isLoading, setIsLoading] = useState(!initialPost || !initialImageSrc);
  const [isFeaturedImageReady, setIsFeaturedImageReady] =
    useState(!initialImageSrc);
  const [hasAnimatedArticle, setHasAnimatedArticle] = useState(false);
  const [sidebarVariant, setSidebarVariant] = useState<"default" | "minimized">(
    "minimized",
  );
  const [bioOpen, setBioOpen] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [copiedContact, setCopiedContact] = useState<"email" | "phone" | null>(
    null,
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
      image
        .decode()
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
      [{ transform: "translateY(112%)" }, { transform: "translateY(0%)" }],
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

  const closeBio = () => {
    setBioOpen(false);
    setBioExpanded(false);
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
      <div className="flex h-full min-h-0 w-screen max-md:block">
        <Sidebar
          variant={sidebarVariant}
          activeCategory={activeCategory}
          hoveredCategory={null}
          categories={sections}
          bioOpen={bioOpen}
          contactOpen={contactOpen}
          showSpinner={isLoading}
          onHomeClick={() => navigate("/")}
          onBioClick={() => {
            if (bioOpen) {
              closeBio();
            } else {
              closeContact();
              setBioOpen(true);
              setBioExpanded(false);
            }
          }}
          onContactClick={() => {
            if (contactOpen) {
              closeContact();
            } else {
              closeBio();
              setContactOpen(true);
            }
          }}
          onCategoryHover={() => undefined}
          onCategorySelect={(category) =>
            navigate(
              `/${categoryToSlug[category as (typeof sections)[number]]}`,
            )
          }
          onExpand={() => setSidebarVariant("default")}
        />

        <div className="relative z-[6] h-full min-h-0 min-w-0 flex flex-1 flex-col bg-[#e8dfd0] shadow-[-12px_0_18px_rgba(0,0,0,0.22)]">
          <section
            className={`overflow-hidden bg-[#e8dfd0] px-2.5 transition-all duration-500 ease-out ${
              bioOpen || contactOpen
                ? bioExpanded
                  ? "h-[50svh] py-2.5"
                  : "h-29.5 py-2.5"
                : "h-0 py-0"
            }`}
          >
            <div className="flex h-full flex-col p-4">
              {bioOpen && !bioExpanded ? (
                <div
                  key="bio-preview"
                  className="info-panel-fade flex h-full flex-col"
                >
                  <p className="m-0 text-[15px] leading-tight text-black/90">
                    {bioParagraphs[0]}
                  </p>
                  <button
                    type="button"
                    className="mb-0 ml-auto mt-auto cursor-pointer text-base leading-none text-black/90 underline transition-colors duration-200 hover:text-black"
                    onClick={() => setBioExpanded(true)}
                  >
                    czytaj dalej
                  </button>
                </div>
              ) : null}
              {bioExpanded ? (
                <div
                  key="bio-expanded"
                  className="info-panel-fade bio-scroll-fade mt-2 overflow-y-auto pb-12 pr-2 text-[15px] leading-[1.3] text-black/90 [scrollbar-color:#9a9a9a_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#e8dfd0] [&::-webkit-scrollbar-thumb]:bg-[#9a9a9a] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2.5"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_calc(100vw/12)] gap-5 max-md:grid-cols-1">
                    <div className="columns-2 gap-5 max-lg:columns-1">
                      {bioParagraphs.map((paragraph) => (
                        <p
                          key={paragraph.slice(0, 20)}
                          className="mb-3 mt-0 break-inside-avoid"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <img
                      className="block h-auto w-full self-start object-cover"
                      src={`${import.meta.env.BASE_URL}image 1.png`}
                      alt="Magdalena Łazarczyk"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-5 pt-4 max-md:grid-cols-1">
                    {bioExhibitionColumns.map((column) => (
                      <section key={column.title}>
                        <h2 className="mb-2 mt-0 text-[13px] font-bold uppercase text-black/90">
                          {column.title}
                        </h2>
                        <ul className="m-0 list-none p-0">
                          {column.items.map((item) => (
                            <li key={item} className="mb-2">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </div>
              ) : null}
              {contactOpen ? (
                <div
                  key="contact"
                  className="info-panel-fade flex h-full flex-col items-end justify-center gap-1 text-right text-[15px] leading-tight text-black/90"
                >
                  <h2 className="mb-2 mt-0 text-[13px] font-bold uppercase text-black/90">
                    Kontakt
                  </h2>
                  <button
                    type="button"
                    className="relative w-fit cursor-pointer appearance-none border-0 bg-transparent p-0 text-right text-black/90 underline transition-colors duration-200 hover:text-black"
                    onClick={() =>
                      void copyContactValue(
                        "magdalena.lazarczyk@gmail.com",
                        "email",
                      )
                    }
                  >
                    magdalena.lazarczyk@gmail.com
                    {copiedContact === "email" ? (
                      <span className="absolute right-0 top-full z-[9999] mt-1 rounded-full bg-[#eee4d5] px-2 py-1 text-[11px] leading-none text-black/90 shadow-[0_2px_8px_rgba(0,0,0,0.16)]">
                        skopiowano
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    className="relative w-fit cursor-pointer appearance-none border-0 bg-transparent p-0 text-right text-black/90 underline transition-colors duration-200 hover:text-black"
                    onClick={() =>
                      void copyContactValue("+48 504439128", "phone")
                    }
                  >
                    +48 504439128
                    {copiedContact === "phone" ? (
                      <span className="absolute right-0 top-full z-[9999] mt-1 rounded-full bg-[#eee4d5] px-2 py-1 text-[11px] leading-none text-black/90 shadow-[0_2px_8px_rgba(0,0,0,0.16)]">
                        skopiowano
                      </span>
                    ) : null}
                  </button>
                  <a
                    className="w-fit text-black/90 underline transition-colors duration-200 hover:text-black"
                    href="https://www.instagram.com/magdalena_lazarczyk/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    instagram
                  </a>
                </div>
              ) : null}
            </div>
          </section>

          <article
            ref={articleRef}
            className="relative min-h-0 flex-1 overflow-y-auto bg-white p-2 text-black/90"
            style={
              !hasAnimatedArticle
                ? { transform: "translateY(112%)" }
                : undefined
            }
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
                  <div className="mb-8 grid grid-cols-12 gap-2">
                    <img
                      ref={featuredImageRef}
                      className="col-span-9 block h-auto w-full max-lg:col-span-10 max-md:col-span-12"
                      src={imageSrc}
                      alt={post.title}
                      loading="eager"
                      decoding="async"
                      onLoad={(event) => {
                        const image = event.currentTarget;
                        if (image.decode) {
                          image
                            .decode()
                            .then(() => setIsFeaturedImageReady(true))
                            .catch(() => setIsFeaturedImageReady(true));
                          return;
                        }
                        setIsFeaturedImageReady(true);
                      }}
                      onError={() => setIsFeaturedImageReady(true)}
                    />
                  </div>
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
      </div>
    </main>
  );
}
