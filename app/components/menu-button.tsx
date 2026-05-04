import { focusHoverColorClass, hoverColorClass } from "./styles";

type MenuButtonProps = {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
};

export function MenuButton({ isOpen, onClick, className }: MenuButtonProps) {
  return (
    <button
      className={`flex h-10 w-10 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-inherit ${hoverColorClass} ${focusHoverColorClass}${
        className ? ` ${className}` : ""
      }`}
      type="button"
      aria-label="Open menu"
      aria-expanded={isOpen}
      onClick={onClick}
    >
      <svg
        aria-hidden="true"
        className="h-9 w-9"
        fill="none"
        viewBox="0 0 512 512"
      >
        <path
          d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 0 0-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 0 0 0-17.47C428.89 172.28 347.8 112 255.66 112z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="32"
        />
        <circle
          cx="256"
          cy="256"
          r="80"
          stroke="currentColor"
          strokeMiterlimit="10"
          strokeWidth="32"
        />
      </svg>
    </button>
  );
}
