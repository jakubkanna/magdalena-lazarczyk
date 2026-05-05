import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { MenuButton } from "./menu-button";
import { SiteMenu } from "./site-menu";
import { focusHoverColorClass, hoverColorClass } from "./styles";

type ScrollDirection = "up" | "down";
const logoLetters = Array.from("MagdalenaŁazarczyk");
const logoSpellInterval = 1000;

export function PageHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection | null>(null);
  const [logoLetterIndex, setLogoLetterIndex] = useState(0);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const handleScroll = (event?: Event) => {
      const target = event?.target;
      const scrollTop =
        target instanceof Element ? target.scrollTop : window.scrollY;

      if (Math.abs(scrollTop - lastScrollTop.current) < 2) {
        return;
      }

      setScrollDirection(scrollTop < lastScrollTop.current ? "up" : "down");
      lastScrollTop.current = Math.max(scrollTop, 0);
    };

    const handlePortfolioScrollDirection = (event: Event) => {
      const direction = (event as CustomEvent<ScrollDirection>).detail;

      if (direction === "up" || direction === "down") {
        setScrollDirection(direction);
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener(
      "portfolio-scroll-direction",
      handlePortfolioScrollDirection,
    );

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener(
        "portfolio-scroll-direction",
        handlePortfolioScrollDirection,
      );
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLogoLetterIndex((currentIndex) =>
        currentIndex === logoLetters.length - 1 ? 0 : currentIndex + 1,
      );
    }, logoSpellInterval);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <motion.header
        className="fixed left-4 right-4 top-3 z-500 box-border flex items-center justify-between text-[var(--site-chrome-color,#111)] transition-colors duration-500 ease-in-out"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Link
          id="logo"
          aria-label="Magdalena Łazarczyk"
          className={`header-logo font-normal leading-none text-inherit no-underline transition-[font-size] duration-200 ${scrollDirection === "down" ? "text-[24px]" : "text-[clamp(44px,6.5vw,72px)]"} ${hoverColorClass} ${focusHoverColorClass}`}
          to="/"
        >
          <span className="header-logo__crop" aria-hidden="true">
            {logoLetters[logoLetterIndex] === " "
              ? "\u00a0"
              : logoLetters[logoLetterIndex]}
          </span>
        </Link>
        <MenuButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(true)} />
      </motion.header>
      <SiteMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
