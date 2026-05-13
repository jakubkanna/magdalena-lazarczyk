import { useEffect, useState } from "react";

type SidebarVariant = "default" | "minimized";

type SidebarProps = {
  variant: SidebarVariant;
  activeCategory: string | null;
  hoveredCategory: string | null;
  categories: readonly string[];
  bioOpen: boolean;
  contactOpen: boolean;
  showSpinner: boolean;
  onHomeClick: () => void;
  onBioClick: () => void;
  onContactClick: () => void;
  onCategoryHover: (category: string | null) => void;
  onCategorySelect: (category: string) => void;
  onCollapse: () => void;
  onExpand: () => void;
};

const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";

const isMobileViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;

function CategoryList({
  categories,
  activeCategory,
  hoveredCategory,
  onCategoryHover,
  onCategorySelect,
  compact = false,
}: {
  categories: readonly string[];
  activeCategory: string | null;
  hoveredCategory: string | null;
  onCategoryHover: (category: string | null) => void;
  onCategorySelect: (category: string) => void;
  compact?: boolean;
}) {
  return (
    <nav
      className={
        compact
          ? "relative z-[6] mt-2 flex flex-1 flex-col items-center justify-around py-2 max-md:hidden"
          : "relative z-[6] mt-auto flex min-h-[52%] flex-col items-end justify-around px-1 py-3.5 max-md:mt-auto max-md:min-h-0 max-md:w-full max-md:flex-row max-md:items-center max-md:justify-between max-md:gap-3"
      }
      aria-label="Sekcje"
    >
      {categories.map((section) => (
        <button
          key={section}
          type="button"
          onClick={() => onCategorySelect(section)}
          className={`relative cursor-pointer transition-colors duration-200  ${compact ? "self-center text-sm" : "self-end text-sm"} appearance-none border-0 bg-transparent p-0 font-normal leading-none text-black/75 hover:text-black [writing-mode:vertical-rl] [transform:rotate(180deg)] ${compact ? "" : "max-md:[writing-mode:horizontal-tb] max-md:[transform:none]"} ${
            hoveredCategory === section || activeCategory === section
              ? "underline decoration-1 underline-offset-2"
              : "no-underline"
          }`}
        >
          {section}
        </button>
      ))}
    </nav>
  );
}

export function Sidebar({
  variant,
  activeCategory,
  hoveredCategory,
  categories,
  bioOpen,
  contactOpen,
  showSpinner,
  onHomeClick,
  onBioClick,
  onContactClick,
  onCategoryHover,
  onCategorySelect,
  onCollapse,
  onExpand,
}: SidebarProps) {
  const [showCredit, setShowCredit] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (showCredit) return;
    const timer = window.setTimeout(() => setShowCredit(true), 5000);
    return () => window.clearTimeout(timer);
  }, [showCredit]);

  const handleInfoButtonClick = (callback: () => void) => {
    callback();
    if (isMobileViewport()) {
      onCollapse();
    }
  };

  return (
    <aside
      className={`relative z-[5] h-full shrink-0 overflow-x-hidden overflow-y-auto bg-[#e8dfd0] transition-[width,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:w-full max-md:overflow-hidden ${
        variant === "minimized" ? "w-14" : "w-[calc(100vw/12)]"
      } ${variant === "minimized" ? "max-md:h-14" : "max-md:h-svh"}`}
      aria-label="Nawigacja"
    >
      {variant === "minimized" ? (
        <div className="flex h-full flex-col p-2.5 max-md:h-14 max-md:flex-row max-md:items-center max-md:justify-between">
          <div className="flex w-5 flex-col items-center gap-2 max-md:w-full max-md:flex-row max-md:justify-between">
            <button
              type="button"
              className="flex size-5 cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 text-center font-['Helvetica_Neue',Helvetica,Arial,sans-serif] font-normal text-black/75 transition-colors duration-200 hover:text-black"
              onClick={onHomeClick}
              aria-label="Strona główna"
            >
              M
            </button>
            {showSpinner ? (
              <span
                className="block size-4 animate-spin rounded-full border-2 border-[#202020]/25 border-t-[#202020]"
                aria-label="Ładowanie"
              />
            ) : (
              <button
                type="button"
                className="flex size-5 cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0"
                onClick={onExpand}
                aria-label="Rozwiń sidebar"
              >
                <img
                  className="block size-5"
                  src={`${import.meta.env.BASE_URL}menu.svg`}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
          <CategoryList
            categories={categories}
            activeCategory={activeCategory}
            hoveredCategory={hoveredCategory}
            onCategoryHover={onCategoryHover}
            onCategorySelect={onCategorySelect}
            compact
          />
        </div>
      ) : (
        <div className="flex h-full flex-col p-2.5 max-md:min-h-svh">
          <div className="mb-24 flex w-full items-start justify-between gap-2 max-md:mb-8">
            <h1 className="m-0 w-full text-left">
              <button
                type="button"
                className="w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-left font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-lg font-normal leading-[1] text-black/75 transition-colors duration-200 hover:text-black"
                onClick={onHomeClick}
              >
                Magdalena Łazarczyk
              </button>
            </h1>
            <button
              type="button"
              className="hidden size-6 shrink-0 cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 max-md:flex"
              onClick={onCollapse}
              aria-label="Zwiń sidebar"
            >
              <img
                className="block size-5"
                src={`${import.meta.env.BASE_URL}menu.svg`}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
          <div className="mt-2 flex flex-col items-start gap-2 max-md:flex-row max-md:items-center">
            <button
              type="button"
              className={`cursor-pointer rounded-full px-2 py-1 text-base leading-none text-black/75 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[background-color,color] duration-200 hover:text-black ${
                bioOpen
                  ? "bg-[#dfd5c6] hover:bg-[#d2c7b8]"
                  : "bg-[#eee4d5] hover:bg-[#e0d6c7]"
              }`}
              onClick={() => handleInfoButtonClick(onBioClick)}
            >
              Bio
            </button>
            <button
              type="button"
              className={`inline-flex cursor-pointer items-center justify-center rounded-full p-1 text-base leading-none text-black/75 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[background-color,color] duration-200 hover:text-black ${
                contactOpen
                  ? "bg-[#dfd5c6] hover:bg-[#d2c7b8]"
                  : "bg-[#eee4d5] hover:bg-[#e0d6c7]"
              }`}
              onClick={() => handleInfoButtonClick(onContactClick)}
              aria-label="Kontakt"
            >
              <img
                className="block size-4"
                src={`${import.meta.env.BASE_URL}frontpage/call-outline.svg`}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
          <CategoryList
            categories={categories}
            activeCategory={activeCategory}
            hoveredCategory={hoveredCategory}
            onCategoryHover={onCategoryHover}
            onCategorySelect={onCategorySelect}
          />
          <div className="sidebar-credit-container mt-4 text-left text-xs leading-none text-black/75 max-md:mt-auto">
            {showCredit ? (
              <a
                className="sidebar-credit-fade sidebar-credit-marquee block text-black/75 no-underline transition-colors duration-200 hover:text-black"
                href="https://jakubkanna.com"
                target="_blank"
                rel="noreferrer"
              >
                <span
                  onAnimationEnd={(event) => {
                    if (event.animationName === "sidebar-credit-marquee") {
                      setShowCredit(false);
                    }
                  }}
                >
                  Designed &amp; Developed by Jakub Kanna
                </span>
              </a>
            ) : (
              <a
                className="sidebar-credit-fade block text-black/75 no-underline transition-colors duration-200 hover:text-black"
                href="https://jakubkanna.com"
                target="_blank"
                rel="noreferrer"
              >
                © {currentYear}
              </a>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
