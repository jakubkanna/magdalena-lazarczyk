import { hoverColorClass } from "./styles";

const currentYear = new Date().getFullYear();

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      className={`flex w-full items-center justify-between gap-4 text-[10px] font-medium leading-[1.2] tracking-normal text-[#111]${
        className ? ` ${className}` : ""
      }`}
    >
      <span>&copy; {currentYear}</span>
      <span className="text-right">
        Designed &amp; Developed by{" "}
        <a
          className={`text-inherit underline underline-offset-2 ${hoverColorClass}`}
          href="https://studio.jakubkanna.com"
          target="_blank"
          rel="noreferrer"
        >
          STUDIO JKN
        </a>
      </span>
    </footer>
  );
}
