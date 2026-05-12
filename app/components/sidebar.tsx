import type { ReactNode } from "react";

type SidebarVariant = "default" | "minimized";

type SidebarProps = {
  variant: SidebarVariant;
  activeCategory: string | null;
  hoveredCategory: string | null;
  categories: readonly string[];
  bioOpen: boolean;
  showSpinner: boolean;
  onHomeClick: () => void;
  onBioClick: () => void;
  onCategoryHover: (category: string | null) => void;
  onCategorySelect: (category: string) => void;
  onExpand: () => void;
};

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
          ? "relative z-[6] mt-2 flex flex-1 flex-col items-center justify-around py-2"
          : "relative z-[6] mt-auto flex min-h-[52%] flex-col items-end justify-around px-1 py-3.5 max-md:mt-4 max-md:min-h-0 max-md:flex-row max-md:justify-between"
      }
      aria-label="Sekcje"
    >
      {categories.map((section) => (
        <button
          key={section}
          type="button"
          onClick={() => onCategorySelect(section)}
          className={`relative cursor-pointer transition-transform duration-200  ${compact ? "self-center text-[11px]" : "self-end text-sm"} appearance-none border-0 bg-transparent p-0 leading-none text-[#1f1f1f] [writing-mode:vertical-rl] [transform:rotate(180deg)] ${compact ? "" : "max-md:[writing-mode:horizontal-tb] max-md:[transform:none]"} ${
            hoveredCategory === section ? "translate-x-[10px]" : "translate-x-0"
          } ${activeCategory === section ? "font-semibold" : "font-normal"}`}
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
  showSpinner,
  onHomeClick,
  onBioClick,
  onCategoryHover,
  onCategorySelect,
  onExpand,
}: SidebarProps) {
  return (
    <aside
      className={`relative z-[5] h-full shrink-0 overflow-x-hidden overflow-y-auto bg-[#e8dfd0] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:min-h-[170px] max-md:w-full ${
        variant === "minimized" ? "w-14" : "w-[calc(100vw/12)]"
      }`}
      aria-label="Nawigacja"
    >
      {variant === "minimized" ? (
        <div className="flex h-full flex-col p-2.5">
          <div className="flex h-5 w-5 items-center justify-center">
            {showSpinner ? (
              <span
                className="block size-4 animate-spin rounded-full border-2 border-[#202020]/25 border-t-[#202020]"
                aria-label="Ładowanie"
              />
            ) : (
              <button
                type="button"
                className="cursor-pointer appearance-none border-0 bg-transparent p-0 text-lg leading-none text-[#202020]"
                onClick={onExpand}
                aria-label="Rozwiń sidebar"
              >
                →
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
        <div className="flex h-full flex-col p-2.5">
          <h1 className="m-0 mb-24">
            <button
              type="button"
              className="cursor-pointer appearance-none border-0 bg-transparent p-0 text-left font-sans text-lg leading-[0.9] font-normal text-[#202020]"
              onClick={onHomeClick}
            >
              Magdalena Łazarczyk
            </button>
          </h1>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className={`cursor-pointer rounded-full px-2 py-1 text-base leading-none text-[#212121] shadow-[0_2px_8px_rgba(0,0,0,0.2)] ${
                bioOpen ? "bg-[#dfd5c6]" : "bg-[#eee4d5]"
              }`}
              onClick={onBioClick}
            >
              Bio
            </button>
            <a
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#eee4d5] p-1 text-base leading-none text-[#212121] shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
              href="tel:+48600000000"
              aria-label="Kontakt"
            >
              <img
                className="block size-4"
                src={`${import.meta.env.BASE_URL}frontpage/call-outline.svg`}
                alt=""
                aria-hidden="true"
              />
            </a>
          </div>
          <CategoryList
            categories={categories}
            activeCategory={activeCategory}
            hoveredCategory={hoveredCategory}
            onCategoryHover={onCategoryHover}
            onCategorySelect={onCategorySelect}
          />
        </div>
      )}
    </aside>
  );
}
