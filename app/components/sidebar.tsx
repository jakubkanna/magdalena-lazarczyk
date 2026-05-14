import { useEffect, useRef, useState } from "react";

type SidebarVariant = "default" | "minimized";

type SidebarProps = {
  variant: SidebarVariant;
  activeCategory: string | null;
  hoveredCategory: string | null;
  categories: readonly string[];
  categoryColors: Record<string, string>;
  showSpinner: boolean;
  onHomeClick: () => void;
  onCategoryHover: (category: string | null) => void;
  onCategorySelect: (category: string) => void;
  onCollapse: () => void;
  onExpand: () => void;
};

const LOGO_LETTERS = "MAGDALENAŁAZARCZYK".split("");
const LOGO_LETTER_INTERVAL_MS = 250;

function SidebarLogo({
  onClick,
  textClass,
  hoverClass,
}: {
  onClick: () => void;
  textClass: string;
  hoverClass: string;
}) {
  return (
    <h1 className="m-0 w-full">
      <button
        type="button"
        className={`mx-auto block w-full max-w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-center text-xl leading-none transition-colors duration-200 max-md:text-[clamp(1.5rem,9vw,3rem)] ${textClass} ${hoverClass} font-["Helvetica"]`}
        onClick={onClick}
        aria-label="Magdalena Łazarczyk"
      >
        <span>· Magdalena Łazarczyk ·</span>
      </button>
    </h1>
  );
}

function CategoryList({
  categories,
  activeCategory,
  hoveredCategory,
  onCategoryHover,
  onCategorySelect,
  categoryColors,
  inactiveTextClass,
  inactiveHoverClass,
  compact = false,
}: {
  categories: readonly string[];
  activeCategory: string | null;
  hoveredCategory: string | null;
  onCategoryHover: (category: string | null) => void;
  onCategorySelect: (category: string) => void;
  categoryColors: Record<string, string>;
  inactiveTextClass: string;
  inactiveHoverClass: string;
  compact?: boolean;
}) {
  return (
    <nav
      className={
        compact
          ? "relative z-[6] mt-2 flex w-full flex-1 flex-col items-center justify-around py-2 max-md:hidden"
          : "relative z-[6] flex h-full w-full flex-col items-stretch max-md:flex-row max-md:items-center max-md:justify-between max-md:gap-2"
      }
      aria-label="Sekcje"
    >
      {categories.map((section) => {
        const isActive = activeCategory === section;
        const isHovered = hoveredCategory === section;

        return (
          <div
            key={section}
            className={
              compact
                ? "flex w-full items-center justify-center"
                : "flex min-h-0 w-full flex-1 items-center justify-center"
            }
          >
            <button
              type="button"
              onClick={() => onCategorySelect(section)}
              className={`relative cursor-pointer border transition-colors duration-200 ${compact ? "bg-transparent px-2 text-sm [writing-mode:vertical-rl] [transform:rotate(180deg)]" : "h-full w-full bg-[#eee4d5] px-3 py-4 text-center text-base shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:bg-[#e0d6c7]"} appearance-none font-normal leading-none ${inactiveHoverClass} ${compact ? "" : "max-md:h-auto max-md:min-h-11 max-md:rounded-full max-md:bg-transparent max-md:px-2 max-md:py-3 max-md:text-sm max-md:shadow-none max-md:[writing-mode:horizontal-tb] max-md:[transform:none]"} ${
                isActive
                  ? compact
                    ? "rounded-full border-current px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                    : "border-transparent shadow-[0_4px_16px_rgba(0,0,0,0.24)]"
                  : `border-transparent ${inactiveTextClass}`
              } ${
                isHovered && !isActive
                  ? "underline decoration-1 underline-offset-2"
                  : "no-underline"
              }`}
              style={
                isActive
                  ? compact
                    ? { color: categoryColors[section] }
                    : {
                        backgroundColor: categoryColors[section],
                        color: "#000",
                      }
                  : undefined
              }
            >
              <span className="button-text-shake">{section}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  variant,
  activeCategory,
  hoveredCategory,
  categories,
  categoryColors,
  showSpinner,
  onHomeClick,
  onCategoryHover,
  onCategorySelect,
  onCollapse,
  onExpand,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [showCredit, setShowCredit] = useState(false);
  const [logoLetterIndex, setLogoLetterIndex] = useState(0);
  const [logoAnimating, setLogoAnimating] = useState(false);
  const currentYear = new Date().getFullYear();
  const sidebarTextClass = "text-black/75";
  const sidebarHoverClass = "hover:text-black";

  useEffect(() => {
    if (!logoAnimating) {
      setLogoLetterIndex(0);
      return;
    }

    setLogoLetterIndex(1);
    const timer = window.setInterval(() => {
      setLogoLetterIndex((index) => (index + 1) % LOGO_LETTERS.length);
    }, LOGO_LETTER_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [logoAnimating]);

  useEffect(() => {
    if (showCredit) return;
    const timer = window.setTimeout(() => setShowCredit(true), 5000);
    return () => window.clearTimeout(timer);
  }, [showCredit]);

  useEffect(() => {
    if (variant !== "default") return;

    const onPointerDown = (event: PointerEvent) => {
      const sidebarElement = sidebarRef.current;
      if (!sidebarElement || !(event.target instanceof Node)) return;
      if (sidebarElement.contains(event.target)) return;
      onCollapse();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onCollapse, variant]);

  return (
    <aside
      ref={sidebarRef}
      className={`relative z-[5] h-full shrink-0 overflow-x-hidden overflow-y-auto bg-[#e8dfd0] transition-[width,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:w-full max-md:overflow-hidden ${
        variant === "minimized" ? "w-14" : "w-[calc(100vw/6)]"
      } ${variant === "minimized" ? "max-md:h-14" : "max-md:h-svh"}`}
      aria-label="Nawigacja"
    >
      {variant === "minimized" ? (
        <div className="flex h-full flex-col items-center justify-around p-2.5 max-md:h-14 max-md:flex-row max-md:justify-between max-md:px-2 max-md:py-1.5">
          <div className="flex w-full flex-col items-center gap-2 max-md:flex-row max-md:justify-between">
            <button
              type="button"
              className={`sidebar-mini-logo flex size-7 cursor-pointer appearance-none items-center justify-center rounded-full bg-transparent p-0 text-center text-xl font-normal leading-none transition-[background-color,color,box-shadow,transform] duration-500 max-md:size-11 ${sidebarTextClass} ${sidebarHoverClass}`}
              onClick={onHomeClick}
              onMouseEnter={() => setLogoAnimating(true)}
              onMouseLeave={() => setLogoAnimating(false)}
              onFocus={() => setLogoAnimating(true)}
              onBlur={() => setLogoAnimating(false)}
              aria-label="Strona główna"
            >
              <span>{LOGO_LETTERS[logoLetterIndex]}</span>
            </button>
            {showSpinner ? (
              <span
                className="flex size-7 items-center justify-center max-md:size-11"
                aria-label="Ładowanie"
              >
                <span className="block size-4 animate-spin rounded-full border-2 border-[#202020]/25 border-t-[#202020]" />
              </span>
            ) : (
              <button
                type="button"
                className="group flex size-7 cursor-pointer appearance-none items-center justify-center rounded-full bg-transparent p-0 max-md:size-11"
                onClick={onExpand}
                aria-label="Rozwiń sidebar"
              >
                <img
                  className="button-text-shake block size-7 max-md:size-5"
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
            categoryColors={categoryColors}
            inactiveTextClass={sidebarTextClass}
            inactiveHoverClass={sidebarHoverClass}
            compact
          />
        </div>
      ) : (
        <div className="flex h-full flex-col max-md:min-h-svh">
          <div className="relative z-10 flex w-full shrink-0 items-start justify-center p-2.5 shadow-[0_12px_18px_rgba(0,0,0,0.16)]">
            <SidebarLogo
              onClick={onHomeClick}
              textClass={sidebarTextClass}
              hoverClass={sidebarHoverClass}
            />
            <button
              type="button"
              className="absolute right-2.5 top-2.5 hidden size-6 shrink-0 cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 max-md:flex max-md:size-11"
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
          <div className="relative z-0 min-h-0 w-full flex-1">
            <div className="flex h-full w-full items-center justify-end">
              <CategoryList
                categories={categories}
                activeCategory={activeCategory}
                hoveredCategory={hoveredCategory}
                onCategoryHover={onCategoryHover}
                onCategorySelect={onCategorySelect}
                categoryColors={categoryColors}
                inactiveTextClass={sidebarTextClass}
                inactiveHoverClass={sidebarHoverClass}
              />
            </div>
          </div>
          <div className="relative z-10 flex w-full shrink-0 items-center justify-center p-2.5 shadow-[0_-12px_18px_rgba(0,0,0,0.16)]">
            <div
              className={`sidebar-credit-container w-full text-center text-xs leading-none ${sidebarTextClass}`}
            >
              {showCredit ? (
                <a
                  className={`sidebar-credit-fade sidebar-credit-marquee block no-underline transition-colors duration-200 ${sidebarTextClass} ${sidebarHoverClass}`}
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
                  className={`sidebar-credit-fade block no-underline transition-colors duration-200 ${sidebarTextClass} ${sidebarHoverClass}`}
                  href="https://jakubkanna.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  © {currentYear}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
