import type { Route } from "./+types/home";
import { useAnimate } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CategoryGrid } from "../components/category-grid";
import { Sidebar } from "../components/sidebar";
import { bioExhibitionColumns, bioParagraphs } from "../data/bio";
import {
  fetchPortfolioPosts,
  loadPortfolioImageSrc,
  type PortfolioCategory,
  type PortfolioPostViewModel,
} from "../data/portfolio-api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Magdalena Łazarczyk" },
    {
      name: "description",
      content:
        "Portfolio Magdaleny Łazarczyk - scenografia, kostiumy, teatr, sztuka i warsztaty.",
    },
  ];
}

const sections = ["Warsztaty", "Teatr", "Sztuka"] as const;
const categoryColors: Record<(typeof sections)[number], string> = {
  Warsztaty: "#F2621C",
  Sztuka: "#D4FC85",
  Teatr: "#0011FF",
};
const categoryToSlug: Record<(typeof sections)[number], string> = {
  Warsztaty: "warsztaty",
  Teatr: "teatr",
  Sztuka: "sztuka",
};
const slugToCategory: Record<string, (typeof sections)[number]> = {
  warsztaty: "Warsztaty",
  teatr: "Teatr",
  sztuka: "Sztuka",
};
const SIDEBAR_VARIANT_STORAGE_KEY = "ml.sidebar.variant";

const getCategoryFromSlug = (slug?: string) =>
  slug ? (slugToCategory[slug.toLowerCase()] ?? null) : null;

const cornerCards = [
  {
    src: `${import.meta.env.BASE_URL}frontpage/3.jpg`,
    alt: "Kolaż portretowy 1",
    category: "Warsztaty",
  },
  {
    src: `${import.meta.env.BASE_URL}frontpage/blu insta new.jpg`,
    alt: "Kolaż portretowy 2",
    category: "Teatr",
  },
  {
    src: `${import.meta.env.BASE_URL}frontpage/ig29.jpgmm.jpg`,
    alt: "Kolaż portretowy 3",
    category: "Sztuka",
  },
] as const;

export default function Home() {
  const params = useParams();
  const routeCategory = getCategoryFromSlug(params.category);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [paperScope, animatePaper] = useAnimate();
  const contentPanelRef = useRef<HTMLDivElement | null>(null);
  const pendingPanelRef = useRef<HTMLDivElement | null>(null);

  const [activeCategory, setActiveCategory] = useState<
    (typeof sections)[number] | null
  >(() => routeCategory);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [sidebarVariant, setSidebarVariant] = useState<"default" | "minimized">(
    () => {
      if (typeof window === "undefined") return "default";
      const stored = window.localStorage.getItem(SIDEBAR_VARIANT_STORAGE_KEY);
      if (stored === "default" || stored === "minimized") return stored;

      const slug =
        window.location.pathname.split("/").at(-1)?.toLowerCase() ?? "";
      return slugToCategory[slug] ? "minimized" : "default";
    },
  );
  const [bioOpen, setBioOpen] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [copiedContact, setCopiedContact] = useState<"email" | "phone" | null>(
    null,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<
    (typeof sections)[number] | null | undefined
  >(undefined);

  const [posts, setPosts] = useState<PortfolioPostViewModel[]>([]);
  const [imageSrcByPostId, setImageSrcByPostId] = useState<
    Record<number, string>
  >({});

  const navigate = useNavigate();

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setOrigin({ x: window.innerWidth, y: window.innerHeight });
      if (window.location.hash === "#bio") {
        setBioOpen(true);
      }
      if (window.location.hash === "#contact") {
        setContactOpen(true);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useLayoutEffect(() => {
    if (isTransitioning) return;
    const categoryFromRoute = getCategoryFromSlug(params.category);
    if (categoryFromRoute) {
      setActiveCategory(categoryFromRoute);
      setPendingCategory(undefined);
      return;
    }
    setActiveCategory(null);
    setPendingCategory(undefined);
  }, [isTransitioning, params.category]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_VARIANT_STORAGE_KEY, sidebarVariant);
  }, [sidebarVariant]);

  useEffect(() => {
    if (!origin) return;
    if (activeCategory !== null) return;
    const paperRoot = paperScope.current as HTMLElement | null;
    if (!paperRoot) return;

    const cards = Array.from(paperRoot.querySelectorAll("[data-fly-card]"));
    cards.forEach((card, index) => {
      card.getAnimations().forEach((animation) => animation.cancel());
      animatePaper(
        card,
        {
          x: [origin.x, 0],
          y: [origin.y, 0],
          opacity: [0, 1],
          scale: [0.94, 1],
        },
        { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.5 },
      );
    });
  }, [activeCategory, animatePaper, origin, paperScope]);

  useLayoutEffect(() => {
    contentPanelRef.current?.scrollTo({ top: 0, left: 0 });
  }, [activeCategory]);

  useEffect(() => {
    let mounted = true;
    fetchPortfolioPosts().then(async (portfolioPosts) => {
      if (!mounted) return;
      setPosts(portfolioPosts);
      const images = await Promise.all(
        portfolioPosts.map(
          async (post) =>
            [post.id, await loadPortfolioImageSrc(post.image)] as const,
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
    const { pathname, search } = window.location;
    const hash = bioOpen ? "#bio" : contactOpen ? "#contact" : "";
    window.history.replaceState(null, "", `${pathname}${search}${hash}`);
  }, [bioOpen, contactOpen]);

  const closeBio = () => {
    setBioOpen(false);
    setBioExpanded(false);
  };

  const closeContact = () => {
    setContactOpen(false);
    setCopiedContact(null);
  };

  const closeInfoPanels = () => {
    closeBio();
    closeContact();
  };

  const waitFrames = (count: number) =>
    new Promise<void>((resolve) => {
      let remaining = count;
      const step = () => {
        remaining -= 1;
        if (remaining <= 0) {
          resolve();
          return;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

  const animatePanelY = (
    element: HTMLElement,
    from: string,
    to: string,
    duration: number,
    easing: string,
  ) =>
    new Promise<void>((resolve) => {
      const animation = element.animate(
        [
          { transform: `translateY(${from})` },
          { transform: `translateY(${to})` },
        ],
        { duration, easing, fill: "forwards" },
      );
      animation.onfinish = () => resolve();
      animation.oncancel = () => resolve();
    });

  const runContentTransition = async (
    category: (typeof sections)[number] | null,
    path: string,
  ) => {
    if (isTransitioning || activeCategory === category) return;
    setIsTransitioning(true);
    closeInfoPanels();
    setHoveredCategory(null);
    setPendingCategory(category);
    await waitFrames(2);

    const pendingPanel = pendingPanelRef.current;
    if (pendingPanel) {
      pendingPanel.style.transform = "translateY(112%)";
      pendingPanel.getBoundingClientRect();
      await animatePanelY(
        pendingPanel,
        "112%",
        "0%",
        520,
        "cubic-bezier(0.22, 1, 0.36, 1)",
      );
    }

    navigate(path);
    setActiveCategory(category);
    await waitFrames(2);
    await new Promise<void>((resolve) => setTimeout(resolve, 40));
    setPendingCategory(undefined);
    setIsTransitioning(false);
  };

  const goHome = async () => {
    await runContentTransition(null, "/");
  };

  const selectCategory = async (category: (typeof sections)[number]) => {
    setSidebarVariant("minimized");
    await runContentTransition(category, `/${categoryToSlug[category]}`);
  };

  const getCategoryPosts = (category: (typeof sections)[number]) =>
    posts.filter((post) => post.category === (category as PortfolioCategory));

  const getContainerColor = (category: (typeof sections)[number] | null) =>
    category ? categoryColors[category] : "#7eaed8";

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

  const renderMainContent = (
    category: (typeof sections)[number] | null,
    overlay = false,
  ) => {
    if (!category) {
      if (overlay) {
        return null;
      }
      return (
        <div
          ref={paperScope}
          className="absolute right-2.5 bottom-2.5 flex items-end gap-2.5"
        >
          {(origin ? cornerCards : []).map((card) => (
            <div
              key={`base-${card.src}`}
              data-fly-card
              className="h-[min(42svh,560px)] w-[calc(100vw/12*2)] cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.24)] transition-transform duration-200 hover:scale-[1.05] max-md:h-[min(34svh,380px)] max-md:w-[min(38vw,240px)]"
              style={
                origin
                  ? {
                      transform: `translate(${origin.x}px, ${origin.y}px) scale(0.94)`,
                      opacity: 0,
                    }
                  : undefined
              }
              onMouseEnter={() => setHoveredCategory(card.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => void selectCategory(card.category)}
            >
              <img
                className="block h-full w-full object-cover"
                src={card.src}
                alt={card.alt}
                loading={overlay ? "lazy" : "eager"}
                decoding="async"
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <CategoryGrid
        posts={getCategoryPosts(category)}
        imageSrcByPostId={imageSrcByPostId}
      />
    );
  };

  return (
    <main
      className="relative isolate h-svh min-h-svh w-screen overflow-hidden bg-[#e8dfd0]"
      aria-label="Magdalena Łazarczyk"
    >
      <div className="flex h-full min-h-0 w-screen max-md:block">
        <Sidebar
          variant={sidebarVariant}
          activeCategory={activeCategory}
          hoveredCategory={hoveredCategory}
          categories={sections}
          bioOpen={bioOpen}
          contactOpen={contactOpen}
          showSpinner={isTransitioning}
          onHomeClick={() => void goHome()}
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
          onCategoryHover={setHoveredCategory}
          onCategorySelect={(category) =>
            void selectCategory(category as (typeof sections)[number])
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
                      {" "}
                      <h2 className="mb-2 mt-0 text-[13px] font-bold uppercase text-black/90">
                        Bio
                      </h2>
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
                  <div className="mt-5 grid grid-cols-3 gap-5 border-t border-[#2a2a2a]/20 pt-4 max-md:grid-cols-1">
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

          <section className="relative min-h-0 flex-1 overflow-hidden">
            <div
              ref={contentPanelRef}
              className={`absolute inset-0 overflow-x-hidden ${
                activeCategory ? "overflow-y-auto" : "overflow-y-hidden"
              }`}
              style={{ backgroundColor: getContainerColor(activeCategory) }}
              aria-hidden="true"
            >
              {renderMainContent(activeCategory)}
            </div>
            {pendingCategory !== undefined ? (
              <div
                ref={pendingPanelRef}
                className={`absolute inset-0 z-10 overflow-x-hidden ${
                  pendingCategory ? "overflow-y-auto" : "overflow-y-hidden"
                }`}
                style={{
                  backgroundColor: getContainerColor(pendingCategory),
                  transform: "translateY(112%)",
                }}
                aria-hidden="true"
              >
                {renderMainContent(pendingCategory, true)}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
