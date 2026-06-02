"use client";

// Tour overlay: floats over the WebGL hero with clickable hotspots that
// scroll-jump to each room. Also shows a "you are here" pin once you've entered.

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { ROOMS } from "@/lib/rooms";

// Coordinate hotspots roughly mapped onto the exterior photo.
// Tweak these once you have a real exterior shot.
const HOTSPOTS: { id: string; name: string; x: number; y: number }[] = [
  { id: "foyer", name: "Foyer.", x: 50, y: 62 },
  { id: "living", name: "Living.", x: 32, y: 55 },
  { id: "kitchen", name: "Kitchen.", x: 70, y: 50 },
  { id: "dining", name: "Dining.", x: 60, y: 62 },
  { id: "bedroom", name: "Bedroom.", x: 22, y: 38 },
  { id: "study", name: "Study.", x: 78, y: 35 },
  { id: "outdoor", name: "Outside.", x: 88, y: 70 },
];

export function TourOverlay() {
  const { scrollYProgress } = useScroll();
  const [activeRoom, setActiveRoom] = useState<string>("top");
  const [heroVisible, setHeroVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", () => {
    // Decide active section by which is centered in viewport
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

    const heroEl = document.getElementById("exterior");
    if (heroEl) {
      const r = heroEl.getBoundingClientRect();
      setHeroVisible(r.bottom > window.innerHeight * 0.4 && r.top < window.innerHeight * 0.5);
    }
  });

  const currentLabel =
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
    <>
      {/* Floating room hotspots over the WebGL exterior hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: heroVisible ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-30 pointer-events-none"
        style={{ display: heroVisible ? "block" : "none" }}
      >
        {HOTSPOTS.map((h, i) => (
          <motion.a
            key={h.id}
            href={`#${h.id}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.4 + i * 0.08, type: "spring", stiffness: 220, damping: 18 }}
            className="absolute pointer-events-auto group -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            aria-label={`Jump to ${h.name}`}
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute w-10 h-10 rounded-full bg-terracotta/30 animate-ping" />
              <span className="relative w-4 h-4 rounded-full bg-terracotta border-2 border-cream shadow-lg" />
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap font-mono text-[10px] tracking-[0.22em] uppercase text-cream bg-walnut/85 backdrop-blur-md px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              {h.name}
            </span>
          </motion.a>
        ))}
      </motion.div>

      {/* "You are in" pinned indicator — bottom-left, always visible after scrolling past entry */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: activeRoom === "top" ? 0 : 1,
          x: activeRoom === "top" ? -20 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 left-6 z-40 pointer-events-none"
      >
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-cream/95 backdrop-blur-md border border-walnut/[0.08] shadow-[0_15px_40px_-12px_rgba(43,36,28,0.2)]">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-walnut/45">
            You're in
          </span>
          <motion.span
            key={currentLabel}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-serif text-walnut text-base"
          >
            {currentLabel}
          </motion.span>
        </div>
      </motion.div>
    </>
  );
}
