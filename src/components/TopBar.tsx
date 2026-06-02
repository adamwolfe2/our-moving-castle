"use client";

// Top nav: wordmark · scroll % · index. Cream-on-cream, walnut ink.
// No mix-blend tricks. Just blends with the always-light page.

import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { ROOMS } from "@/lib/rooms";

export function TopBar() {
  const { scrollYProgress } = useScroll();
  const [percent, setPercent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setPercent(Math.round(v * 100));
    });
  }, [scrollYProgress]);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div className="flex items-center justify-between px-6 md:px-10 py-6">
          <a
            href="#top"
            className="font-serif text-[15px] tracking-[0.02em] text-walnut pointer-events-auto"
          >
            Castle<em className="italic text-terracotta">.</em>
          </a>
          <div className="font-mono text-[11px] tracking-[0.18em] tabular-nums text-walnut/70">
            {String(percent).padStart(2, "0")}
          </div>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="font-mono text-[11px] tracking-[0.18em] uppercase pointer-events-auto text-walnut hover:text-terracotta transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? "Close." : "Index."}
          </button>
        </div>
      </motion.nav>

      {/* Mode toggle removed — pure mood board, single state */}

      <motion.aside
        initial={false}
        animate={{ x: menuOpen ? 0 : "100%" }}
        transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1] }}
        className="fixed top-0 right-0 bottom-0 z-40 w-full md:w-[420px] bg-cream-deep text-walnut shadow-[-20px_0_60px_-20px_rgba(43,36,28,0.18)]"
      >
        <div className="h-full flex flex-col justify-between p-10">
          <div className="pt-20">
            <ul className="space-y-3">
              <MenuLink href="#top" onClick={() => setMenuOpen(false)}>
                Top.
              </MenuLink>
              <MenuLink href="#exterior" onClick={() => setMenuOpen(false)}>
                House.
              </MenuLink>
              {ROOMS.map((r) => (
                <MenuLink
                  key={r.id}
                  href={`#${r.id}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {r.name}
                </MenuLink>
              ))}
              <MenuLink href="#gallery-3d" onClick={() => setMenuOpen(false)}>
                Every.
              </MenuLink>
              <MenuLink href="#inspiration" onClick={() => setMenuOpen(false)}>
                Reference.
              </MenuLink>
              <MenuLink href="#story" onClick={() => setMenuOpen(false)}>
                Home.
              </MenuLink>
            </ul>
          </div>
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-50">
            02 · 06 · 2026
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        onClick={onClick}
        className="font-serif text-3xl md:text-4xl text-walnut hover:text-terracotta transition-colors"
      >
        {children}
      </a>
    </li>
  );
}
