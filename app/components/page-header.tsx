import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { MenuButton } from "./menu-button";
import { SiteMenu } from "./site-menu";
import { focusHoverColorClass, hoverColorClass } from "./styles";

export function PageHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        className="fixed left-0 top-0 z-[500] box-border flex min-h-[72px] w-full items-center justify-between bg-white/[0.92] px-8 py-6 text-[#111] backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Link
          className={`text-[clamp(18px,3vw,26px)] font-medium leading-none text-inherit no-underline ${hoverColorClass} ${focusHoverColorClass}`}
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
