import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { MenuButton } from "./menu-button";
import { SiteMenu } from "./site-menu";
import { focusHoverColorClass, hoverColorClass } from "./styles";

type ScrollDirection = "up" | "down";

export function PageHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection | null>(null);
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

  return (
    <>
      <motion.header
        className="fixed left-3 right-8 top-3 z-500 box-border flex items-center justify-between text-[#111]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Link
          id="logo"
          className={`font-normal leading-none text-inherit no-underline transition-[font-size] duration-200 ${scrollDirection === "down" ? "text-[20px]" : "text-[clamp(28px,4vw,44px)]"} ${hoverColorClass} ${focusHoverColorClass}`}
          to="/"
        >
          Magdalena Łazarczyk
        </Link>
        <MenuButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(true)} />
      </motion.header>
      <SiteMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
