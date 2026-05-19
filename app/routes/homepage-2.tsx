import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/homepage-2";
import { BioContactPanel } from "../components/bio-contact-panel";
import { Sidebar } from "../components/sidebar";
import { defaultSiteContent, fetchSiteContent } from "../data/site-content";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Homepage 2 | Magdalena Łazarczyk" },
    {
      name: "description",
      content: "Testowa strona główna Magdalena Łazarczyk.",
    },
  ];
}

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

export default function Homepage2() {
  const navigate = useNavigate();
  const videoLoadFallbackRef = useRef<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [copiedContact, setCopiedContact] = useState<"email" | "phone" | null>(
    null,
  );
  const [siteContent, setSiteContent] = useState(defaultSiteContent);
  const [sidebarVariant, setSidebarVariant] = useState<"default" | "minimized">(
    () => (isMobileViewport() ? "minimized" : "default"),
  );

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
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://player.vimeo.com") return;

      let data: { event?: string; player_id?: string } | null = null;
      if (typeof event.data === "string") {
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
      } else if (typeof event.data === "object" && event.data !== null) {
        data = event.data;
      }

      if (
        data?.player_id === "homepage-2-video" &&
        (data.event === "play" || data.event === "timeupdate")
      ) {
        setVideoLoaded(true);
      }
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      if (videoLoadFallbackRef.current !== null) {
        window.clearTimeout(videoLoadFallbackRef.current);
      }
    };
  }, []);

  const markVideoReadySoon = () => {
    if (videoLoadFallbackRef.current !== null) {
      window.clearTimeout(videoLoadFallbackRef.current);
    }

    videoLoadFallbackRef.current = window.setTimeout(() => {
      setVideoLoaded(true);
    }, 1800);
  };

  const closeBio = () => {
    setBioOpen(false);
  };

  const closeContact = () => {
    setContactOpen(false);
    setCopiedContact(null);
  };

  const closeInfoPanels = () => {
    closeBio();
    closeContact();
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
      aria-label="Magdalena Łazarczyk homepage 2"
    >
      <div className="flex h-full min-h-0 w-screen max-md:flex-col">
        <Sidebar
          variant={sidebarVariant}
          activeCategory={null}
          hoveredCategory={hoveredCategory}
          categories={sections}
          categoryColors={categoryColors}
          showSpinner={false}
          bioOpen={bioOpen}
          contactOpen={contactOpen}
          onHomeClick={() => navigate("/")}
          onCategoryHover={setHoveredCategory}
          onCategorySelect={(category) =>
            navigate(`/${categoryToSlug[category as (typeof sections)[number]]}`)
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

        <div className="relative z-[6] h-full min-h-0 min-w-0 flex flex-1 flex-col bg-[#85BBEB] shadow-[-12px_0_18px_rgba(0,0,0,0.22)]">
          <BioContactPanel
            bioOpen={bioOpen}
            contactOpen={contactOpen}
            copiedContact={copiedContact}
            siteContent={siteContent}
            onClose={closeInfoPanels}
            onCopyContact={(value, key) => void copyContactValue(value, key)}
          />

          <section className="relative z-10 min-h-0 flex-1 overflow-hidden bg-black shadow-[0_-12px_18px_rgba(0,0,0,0.18)]">
            <iframe
              id="homepage-2-video"
              className="pointer-events-none absolute top-1/2 left-1/2 block h-[max(100%,56.25vw)] w-[max(100%,177.7778vh)] -translate-x-1/2 -translate-y-1/2 border-0"
              src="https://player.vimeo.com/video/460882026?background=1&autoplay=1&loop=1&muted=1&controls=0&autopause=0&playsinline=1&api=1&player_id=homepage-2-video"
              title="Homepage 2 video"
              allow="autoplay; fullscreen; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={markVideoReadySoon}
              aria-hidden="true"
              tabIndex={-1}
            />
            <div
              className={`pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[#e8dfd0] transition-opacity duration-500 ${
                videoLoaded ? "opacity-0" : "opacity-100"
              }`}
              role="status"
              aria-live="polite"
            >
              <img
                className="block size-10 animate-spin"
                src={`${import.meta.env.BASE_URL}1455.png`}
                alt=""
                aria-hidden="true"
              />
              <span className="sr-only">Ładowanie</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
