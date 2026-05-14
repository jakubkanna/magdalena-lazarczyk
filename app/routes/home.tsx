import type { Route } from "./+types/home";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { AnimatedPageContainer } from "../components/animated-page-container";
import { BioContactPanel } from "../components/bio-contact-panel";
import { CategoryGrid } from "../components/category-grid";
import { FixedInfoButtons } from "../components/fixed-info-buttons";
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

export default function Home() {
  const params = useParams();
  const location = useLocation();
  const routeCategory = getCategoryFromSlug(params.category);
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
    category ? categoryColors[category] : "#e8dfd0";

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
  ) => {
    if (!category) {
      return null;
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
          categoryColors={categoryColors}
          showSpinner={isTransitioning}
          onHomeClick={() => void goHome()}
          onCategoryHover={setHoveredCategory}
          onCategorySelect={(category) =>
            void selectCategory(category as (typeof sections)[number])
          }
          onCollapse={() => setSidebarVariant("minimized")}
          onExpand={() => setSidebarVariant("default")}
        />

        <FixedInfoButtons
          bioOpen={bioOpen}
          contactOpen={contactOpen}
          onBioClick={() => {
            if (bioOpen) {
              closeBio();
            } else {
              setContactOpen(false);
              setCopiedContact(null);
              setBioOpen(true);
              setBioExpanded(false);
            }
          }}
          onContactClick={() => {
            if (contactOpen) {
              closeContact();
            } else {
              setBioOpen(false);
              setBioExpanded(false);
              setContactOpen(true);
            }
          }}
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

          <section className="relative z-10 min-h-0 flex-1 overflow-hidden shadow-[0_-12px_18px_rgba(0,0,0,0.18)]">
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
                {renderMainContent(pendingCategory)}
              </AnimatedPageContainer>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
