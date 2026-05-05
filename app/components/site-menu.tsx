import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router";
import { SiteFooter } from "./site-footer";
import { focusHoverColorClass, hoverColorClass } from "./styles";

type SiteMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuLinks = [
  { label: "Start", to: "/" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Bio", to: "/bio", disabled: true },
  { label: "Warsztaty", to: "/contact", disabled: true },
];

const socialLinks = [
  { label: "Phone", value: "+48 504 439 128" },
  { label: "Email", value: "magdalena.lazarczyk@gmail.com" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/magdalena_lazarczyk/",
  },
];

function MenuLinkLabel({ label }: { label: string }) {
  if (label === "Portfolio") {
    return <>Portfolio</>;
  }

  return label;
}

const showUnavailableAlert = () => {
  window.alert("Coming soon.");
};

export function SiteMenu({ isOpen, onClose }: SiteMenuProps) {
  const [activeSocialTooltip, setActiveSocialTooltip] = useState<string | null>(
    null,
  );
  const [copiedSocialTooltip, setCopiedSocialTooltip] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      setActiveSocialTooltip(null);
      setCopiedSocialTooltip(null);
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

  const copySocialValue = async (label: string, value?: string) => {
    if (!value) {
      setActiveSocialTooltip(null);
      setCopiedSocialTooltip(null);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setActiveSocialTooltip(label);
      setCopiedSocialTooltip(label);
      window.setTimeout(() => {
        setActiveSocialTooltip(null);
        setCopiedSocialTooltip(null);
      }, 1600);
    } catch {
      setActiveSocialTooltip(label);
      setCopiedSocialTooltip(null);
    }
  };

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
            className="fixed inset-y-0 right-0 z-[1201] box-border flex min-h-svh w-fit max-w-full flex-col justify-between bg-[#8f8f8f] py-11 pl-6 pr-[22px] text-left text-[#222] shadow-[-28px_0_48px_rgb(0_0_0_/_0.2)] sm:pl-9"
            aria-label="Nawigacja główna"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.52, ease: [0.76, 0, 0.24, 1] }}
          >
            <button
              className={`font-display absolute right-4 top-4 border-0 bg-transparent p-0 text-4xl leading-none text-[#222] md:h-px md:w-px md:overflow-hidden md:[clip:rect(0_0_0_0)] md:whitespace-nowrap ${hoverColorClass} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current`}
              type="button"
              aria-label="Close menu"
              onClick={onClose}
            >
              x
            </button>
            <div className="flex flex-col gap-6">
              {menuLinks.map((link) =>
                link.disabled ? (
                  <button
                    className="font-display max-w-full cursor-pointer border-0 bg-transparent p-0 text-left whitespace-nowrap text-[clamp(54px,18vw,78px)] font-normal leading-[0.9] text-[#222]/35"
                    key={link.to}
                    aria-disabled="true"
                    type="button"
                    onClick={showUnavailableAlert}
                  >
                    <MenuLinkLabel label={link.label} />
                  </button>
                ) : (
                  <Link
                    className={`font-display max-w-full whitespace-nowrap text-[clamp(54px,18vw,78px)] font-normal leading-[0.9] text-inherit no-underline ${hoverColorClass} ${focusHoverColorClass} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current`}
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                  >
                    <MenuLinkLabel label={link.label} />
                  </Link>
                ),
              )}
            </div>
            <div
              className="flex flex-col items-start gap-14"
              aria-label="Social links"
            >
              <div className="flex w-full justify-between text-lg leading-none">
                {socialLinks.map((link) =>
                  link.href ? (
                    <a
                      className={`text-[#111] no-underline ${hoverColorClass} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current`}
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      className={`group relative border-0 bg-transparent p-0 text-[#111] ${hoverColorClass} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current`}
                      key={link.label}
                      type="button"
                      aria-expanded={
                        link.value
                          ? activeSocialTooltip === link.label
                          : undefined
                      }
                      onBlur={() => {
                        setActiveSocialTooltip(null);
                        setCopiedSocialTooltip(null);
                      }}
                      onClick={() => copySocialValue(link.label, link.value)}
                    >
                      {link.label}
                      {link.value ? (
                        <span
                          className={`pointer-events-none absolute bottom-full left-1/2 mb-2 max-w-[calc(100vw-48px)] -translate-x-1/2 rounded-full bg-[#111] px-3 py-1.5 text-sm leading-none text-white shadow-[0_8px_22px_rgb(0_0_0_/_0.18)] transition-opacity duration-150 ${
                            copiedSocialTooltip === link.label
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        >
                          Skopiowano
                        </span>
                      ) : null}
                    </button>
                  ),
                )}
              </div>
              <SiteFooter />
            </div>
          </motion.nav>
        </>
      ) : null}
    </AnimatePresence>
  );
}
