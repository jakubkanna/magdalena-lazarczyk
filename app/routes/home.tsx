import type { Route } from "./+types/home";
import { useAnimate } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { AnimatedPageContainer } from "../components/animated-page-container";
import { BioContactPanel } from "../components/bio-contact-panel";
import { CategoryGrid } from "../components/category-grid";
import { Sidebar } from "../components/sidebar";
import {
  fetchPortfolioPosts,
  loadPortfolioImageSrc,
  type PortfolioCategory,
  type PortfolioPostViewModel,
} from "../data/portfolio-api";
import { defaultSiteContent, fetchSiteContent } from "../data/site-content";

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
const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";

const getCategoryFromSlug = (slug?: string) =>
  slug ? (slugToCategory[slug.toLowerCase()] ?? null) : null;

const isMobileViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;

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
  const location = useLocation();
  const routeCategory = getCategoryFromSlug(params.category);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [paperScope, animatePaper] = useAnimate();
  const contentPanelRef = useRef<HTMLDivElement | null>(null);

  const [activeCategory, setActiveCategory] = useState<
    (typeof sections)[number] | null
  >(() => routeCategory);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [sidebarVariant, setSidebarVariant] = useState<"default" | "minimized">(
    () => {
      if (typeof window === "undefined") return "default";
      if (isMobileViewport()) return "minimized";
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
  const [siteContent, setSiteContent] = useState(defaultSiteContent);

  const navigate = useNavigate();
  const shouldAnimateContainerFromPost =
    (location.state as { animateContainerFromPost?: boolean } | null)
      ?.animateContainerFromPost === true;

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
    let mounted = true;
    fetchSiteContent().then((content) => {
      if (mounted) setSiteContent(content);
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
    await new Promise<void>((resolve) => setTimeout(resolve, 520));

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
          className="absolute right-2.5 bottom-2.5 flex items-end gap-2.5 max-md:left-2.5 max-md:flex-col max-md:items-stretch"
        >
          {(origin ? cornerCards : []).map((card) => (
            <div
              key={`base-${card.src}`}
              data-fly-card
              className="group h-[min(42svh,560px)] w-[calc(100vw/12*2)] cursor-pointer overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.24)] max-md:h-[22svh] max-md:w-full"
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
                className="block h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.05] max-md:transition-none max-md:group-hover:scale-100"
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
      <div className="flex h-full min-h-0 w-screen max-md:flex-col">
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
          onCollapse={() => setSidebarVariant("minimized")}
          onExpand={() => setSidebarVariant("default")}
        />

        <div className="relative z-[6] h-full min-h-0 min-w-0 flex flex-1 flex-col bg-[#e8dfd0] shadow-[-12px_0_18px_rgba(0,0,0,0.22)]">
          <BioContactPanel
            bioOpen={bioOpen}
            bioExpanded={bioExpanded}
            contactOpen={contactOpen}
            copiedContact={copiedContact}
            siteContent={siteContent}
            onBioExpand={() => setBioExpanded(true)}
            onClose={closeInfoPanels}
            onCopyContact={(value, key) => void copyContactValue(value, key)}
          />

          <section className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatedPageContainer
              animationKey={`home-${location.key}`}
              animate={shouldAnimateContainerFromPost}
              containerRef={contentPanelRef}
              className={`absolute inset-0 overflow-x-hidden ${
                activeCategory ? "overflow-y-auto" : "overflow-y-hidden"
              }`}
              style={{ backgroundColor: getContainerColor(activeCategory) }}
              onEntered={() => navigate(".", { replace: true, state: null })}
            >
              {renderMainContent(activeCategory)}
            </AnimatedPageContainer>
            {pendingCategory !== undefined ? (
              <AnimatedPageContainer
                animationKey={`pending-${pendingCategory ?? "home"}`}
                animate
                ready
                className={`absolute inset-0 z-10 overflow-x-hidden ${
                  pendingCategory ? "overflow-y-auto" : "overflow-y-hidden"
                }`}
                style={{
                  backgroundColor: getContainerColor(pendingCategory),
                }}
              >
                {renderMainContent(pendingCategory, true)}
              </AnimatedPageContainer>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
