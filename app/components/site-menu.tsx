import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router";
import { SiteFooter } from "./site-footer";
import {
  focusHoverColorClass,
  hoverColorClass,
} from "./styles";

type SiteMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuLinks = [
  { label: "Home", to: "/" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Bio", to: "/bio", disabled: true },
  { label: "Kontakt", to: "/contact", disabled: true },
];

const socialLinks = ["Facebook", "Twitter", "Instagram"];

export function SiteMenu({ isOpen, onClose }: SiteMenuProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            key="site-menu-backdrop"
            className="fixed inset-0 z-[1200] cursor-default border-0 bg-transparent"
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />
          <motion.nav
            key="site-menu-panel"
            className="fixed inset-y-0 right-0 z-[1201] box-border flex min-h-svh w-[min(390px,100vw)] flex-col justify-between bg-[#bfbfbf] py-11 pl-10 pr-[22px] text-left text-[#222] shadow-[-28px_0_48px_rgb(0_0_0_/_0.2)]"
            aria-label="Main navigation"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.52, ease: [0.76, 0, 0.24, 1] }}
          >
            <button
              className="absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(0_0_0_0)] whitespace-nowrap"
              type="button"
              aria-label="Close menu"
              onClick={onClose}
            >
              X
            </button>
            <div className="flex flex-col gap-6">
              {menuLinks.map((link) =>
                link.disabled ? (
                  <span
                    className="cursor-not-allowed text-[clamp(74px,21vw,88px)] font-normal leading-[0.98] text-[#222]/35"
                    key={link.to}
                    aria-disabled="true"
                  >
                    {link.label}
                  </span>
                ) : (
                  <Link
                    className={`text-[clamp(74px,21vw,88px)] font-normal leading-[0.98] text-inherit no-underline ${hoverColorClass} ${focusHoverColorClass} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current`}
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
            <div
              className="flex flex-col items-start gap-14"
              aria-label="Social links"
            >
              <div className="flex w-full justify-between text-lg leading-none">
                {socialLinks.map((label) => (
                  <a
                    className={`text-[#111] no-underline ${hoverColorClass} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current`}
                    key={label}
                    href="#"
                    onClick={(event) => event.preventDefault()}
                  >
                    {label}
                  </a>
                ))}
              </div>
              <SiteFooter />
            </div>
          </motion.nav>
        </>
      ) : null}
    </AnimatePresence>
  );
}
