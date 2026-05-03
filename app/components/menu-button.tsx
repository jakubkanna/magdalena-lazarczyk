import { focusHoverColorClass, hoverColorClass } from "./styles";

type MenuButtonProps = {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
};

export function MenuButton({ isOpen, onClick, className }: MenuButtonProps) {
  return (
    <button
      className={`cursor-pointer border-0 bg-transparent p-0 text-sm font-bold leading-none text-inherit ${hoverColorClass} ${focusHoverColorClass}${
        className ? ` ${className}` : ""
      }`}
      type="button"
      aria-label="Open menu"
      aria-expanded={isOpen}
      onClick={onClick}
    >
      Menu
    </button>
  );
}
