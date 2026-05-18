import { useEffect, useRef, useState } from "react";

type SidebarVariant = "default" | "minimized";

type SidebarProps = {
  variant: SidebarVariant;
  activeCategory: string | null;
  hoveredCategory: string | null;
  categories: readonly string[];
  categoryColors: Record<string, string>;
  showSpinner: boolean;
  bioOpen?: boolean;
  contactOpen?: boolean;
  onHomeClick: () => void;
  onCategoryHover: (category: string | null) => void;
  onCategorySelect: (category: string) => void;
  onCollapse: () => void;
  onExpand: () => void;
  onBioClick?: () => void;
  onContactClick?: () => void;
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
        className={`mx-auto block w-full max-w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-center text-xl leading-none transition-colors duration-200 max-md:mx-0 max-md:text-left max-md:text-[clamp(1.25rem,6vw,2rem)] ${textClass} ${hoverClass} font-["Helvetica"]`}
        onClick={onClick}
        aria-label="Magdalena Łazarczyk"
      >
        <span>Magdalena Łazarczyk</span>
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
          ? "relative z-[6] mt-2 flex w-full flex-1 flex-col items-center justify-around py-2 max-md:mt-0 max-md:hidden"
          : "relative z-[6] flex h-full w-full flex-col items-stretch"
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
              className={`relative cursor-pointer border transition-colors duration-200 ${compact ? "bg-transparent px-2 text-sm [writing-mode:vertical-rl] [transform:rotate(180deg)]" : "flex h-full w-full items-center justify-end bg-[#eee4d5] px-3 py-4 text-right text-base shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:bg-[#e0d6c7] max-md:justify-center max-md:text-center"} appearance-none font-normal leading-none ${inactiveHoverClass} ${compact ? "" : "max-md:text-xl max-md:[writing-mode:horizontal-tb] max-md:[transform:none]"} ${
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
              {compact ? (
                <span className="button-text-shake">{section}</span>
              ) : (
                <span className="block whitespace-nowrap md:-rotate-90">
                  <span className="button-text-shake">{section}</span>
                </span>
              )}
            </button>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarInfoButtons({
  bioOpen,
  contactOpen,
  onBioClick,
  onContactClick,
  compact = false,
}: {
  bioOpen: boolean;
  contactOpen: boolean;
  onBioClick: () => void;
  onContactClick: () => void;
  compact?: boolean;
}) {
  return (
    <div
      data-info-buttons
      style={
        compact
          ? undefined
          : {
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
            }
      }
      className={
        compact
          ? "relative z-[7] flex w-full flex-col items-center gap-2 px-1 pb-1 max-md:hidden"
          : "relative z-[7] w-full items-center gap-2 bg-[#eee4d5] px-4 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
      }
    >
      <button
        type="button"
        className={`inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center rounded-full px-2 py-1 text-base leading-none text-black/75 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[background-color,color] duration-200 hover:text-black ${
          compact ? "min-h-7 min-w-7 text-sm" : "min-h-0"
        } ${
          bioOpen
            ? "bg-[#dfd5c6] hover:bg-[#d2c7b8]"
            : "bg-[#eee4d5] hover:bg-[#e0d6c7]"
        }`}
        onClick={onBioClick}
      >
        <span className="button-text-shake">Bio</span>
      </button>
      <button
        type="button"
        className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#eee4d5] p-1 text-base leading-none text-black/75 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[background-color,color] duration-200 hover:bg-[#e0d6c7] hover:text-black ${
          compact
            ? "size-7 max-md:size-8"
            : "size-7 justify-self-end"
        } ${contactOpen ? "bg-[#dfd5c6] hover:bg-[#d2c7b8]" : ""}`}
        onClick={onContactClick}
        aria-label="Kontakt"
      >
        <img
          className="button-text-shake block size-4"
          src={`${import.meta.env.BASE_URL}frontpage/call-outline.svg`}
          alt=""
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export function Sidebar({
  variant,
  activeCategory,
  hoveredCategory,
  categories,
  categoryColors,
  showSpinner,
  bioOpen = false,
  contactOpen = false,
  onHomeClick,
  onCategoryHover,
  onCategorySelect,
  onCollapse,
  onExpand,
  onBioClick,
  onContactClick,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const [showCredit, setShowCredit] = useState(false);
  const [logoLetterIndex, setLogoLetterIndex] = useState(0);
  const [logoAnimating, setLogoAnimating] = useState(false);
  const currentYear = new Date().getFullYear();
  const sidebarTextClass = "text-black/75";
  const sidebarHoverClass = "hover:text-black";
  const hasInfoButtons = Boolean(onBioClick && onContactClick);

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
        variant === "minimized" ? "w-20" : "w-[calc(100vw/6)]"
      } ${variant === "minimized" ? "max-md:h-auto" : "max-md:h-svh"}`}
      aria-label="Nawigacja"
    >
      {variant === "minimized" ? (
        <div className="flex h-full flex-col items-center justify-between pl-2 pr-4 py-5 max-md:h-auto max-md:w-full max-md:flex-row max-md:flex-nowrap max-md:px-1.5 max-md:py-1">
          <div className="flex w-full flex-col items-center gap-2 max-md:w-auto max-md:min-w-0 max-md:flex-row max-md:flex-nowrap max-md:justify-between">
            <button
              type="button"
              className={`sidebar-mini-logo flex size-7 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-full bg-transparent p-0 text-center text-xl font-normal leading-none transition-[background-color,color,box-shadow,transform] duration-500 max-md:size-8 max-md:text-3xl ${sidebarTextClass} ${sidebarHoverClass}`}
              onClick={onHomeClick}
              onMouseEnter={() => setLogoAnimating(true)}
              onMouseLeave={() => setLogoAnimating(false)}
              onFocus={() => setLogoAnimating(true)}
              onBlur={() => setLogoAnimating(false)}
              aria-label="Strona główna"
            >
              <span>{LOGO_LETTERS[logoLetterIndex]}</span>
            </button>
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
          {hasInfoButtons ? (
            <SidebarInfoButtons
              bioOpen={bioOpen}
              contactOpen={contactOpen}
              onBioClick={onBioClick!}
              onContactClick={onContactClick!}
              compact
            />
          ) : null}
          {showSpinner ? (
            <span
              className="mt-14 flex size-7 shrink-0 items-center justify-center max-md:mt-0 max-md:size-8"
              aria-label="Ładowanie"
            >
              <span className="block size-4 animate-spin rounded-full border-2 border-[#202020]/25 border-t-[#202020]" />
            </span>
          ) : (
            <button
              type="button"
              className="group mt-14 flex size-7 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-full bg-transparent p-0 max-md:mt-0 max-md:size-8"
              onClick={onExpand}
              aria-label="Rozwiń sidebar"
            >
              <img
                className="button-text-shake block size-7 max-md:size-7"
                src={`${import.meta.env.BASE_URL}menu.svg`}
                alt=""
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col max-md:min-h-svh ">
          <div className="relative z-10 flex w-full shrink-0 items-start justify-center p-2.5 shadow-[0_12px_18px_rgba(0,0,0,0.16)] max-md:items-center max-md:justify-start max-md:pr-16">
            <SidebarLogo
              onClick={onHomeClick}
              textClass={sidebarTextClass}
              hoverClass={sidebarHoverClass}
            />
            <button
              type="button"
              className="absolute right-1.5 top-1/2 hidden size-8 -translate-y-1/2 shrink-0 cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 max-md:flex"
              onClick={onCollapse}
              aria-label="Zwiń sidebar"
            >
              <img
                className="button-text-shake block size-7"
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
          {hasInfoButtons ? (
            <SidebarInfoButtons
              bioOpen={bioOpen}
              contactOpen={contactOpen}
              onBioClick={onBioClick!}
              onContactClick={onContactClick!}
            />
          ) : null}
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
