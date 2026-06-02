"use client";

// Bottom-right floating room navigator. Hides on the entry portal section.
// Aqon-inspired thumbnail strip + Royal's "where am I" indicator.

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { ROOMS } from "@/lib/rooms";
import clsx from "clsx";

export function RoomStrip() {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string>("exterior");

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setVisible(v > 0.08 && v < 0.94);

    // Determine active section by viewport center
    const sections = ["exterior", ...ROOMS.map((r) => r.id)];
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5) {
        setActive(sections[i]);
        break;
      }
    }
  });

  return (
    <motion.aside
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        x: visible ? 0 : 30,
        pointerEvents: visible ? "auto" : "none",
      }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-2"
    >
      {[
        { id: "exterior", name: "Exterior" },
        ...ROOMS.map((r) => ({ id: r.id, name: r.name })),
        { id: "inspiration", name: "Mood" },
        { id: "story", name: "Story" },
      ].map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="group flex items-center justify-end gap-3 py-1"
        >
          <span
            className={clsx(
              "font-mono text-[10px] tracking-[0.2em] uppercase transition-opacity",
              active === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-60"
            )}
            style={{ color: "var(--ink-on-bg, currentColor)" }}
          >
            {item.name}
          </span>
          <span
            className={clsx(
              "block h-px transition-all duration-500",
              active === item.id
                ? "w-10 bg-terracotta"
                : "w-5 bg-walnut/40 group-hover:w-8"
            )}
          />
        </a>
      ))}
    </motion.aside>
  );
}
