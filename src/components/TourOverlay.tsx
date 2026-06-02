"use client";

// "You're in {Room}." floating indicator. No hotspot dots — just the pill.
// Hidden on the entry portal, fades in once you've scrolled past it.

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { ROOMS } from "@/lib/rooms";

export function TourOverlay() {
  const { scrollYProgress } = useScroll();
  const [activeRoom, setActiveRoom] = useState<string>("top");

  useMotionValueEvent(scrollYProgress, "change", () => {
    const sections = [
      "top",
      "exterior",
      ...ROOMS.map((r) => r.id),
      "gallery-3d",
      "inspiration",
      "story",
    ];
    let current = "top";
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.5) {
        current = sections[i];
        break;
      }
    }
    setActiveRoom(current);
  });

  const label =
    activeRoom === "top"
      ? "Entry."
      : activeRoom === "exterior"
        ? "House."
        : activeRoom === "gallery-3d"
          ? "Tour."
          : activeRoom === "inspiration"
            ? "Reference."
            : activeRoom === "story"
              ? "Home."
              : ROOMS.find((r) => r.id === activeRoom)?.name ?? activeRoom;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{
        opacity: activeRoom === "top" ? 0 : 1,
        x: activeRoom === "top" ? -16 : 0,
      }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-5 left-5 md:bottom-6 md:left-6 z-40 pointer-events-none"
    >
      <div className="flex items-center gap-3 px-3.5 py-2 md:px-4 md:py-2.5 rounded-full bg-cream/95 backdrop-blur-md border border-walnut/[0.08] shadow-[0_15px_40px_-12px_rgba(43,36,28,0.2)]">
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-walnut/45">
          You're in
        </span>
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-serif text-walnut text-sm md:text-base"
        >
          {label}
        </motion.span>
      </div>
    </motion.div>
  );
}
