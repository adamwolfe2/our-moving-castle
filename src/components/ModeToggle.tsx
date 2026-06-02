"use client";

// REAL ↔ DREAM physical toggle. Cream pill on cream bg with terracotta slider.

import { motion } from "framer-motion";
import { useMode } from "@/store/mode";
import clsx from "clsx";

export function ModeToggle() {
  const { mode, toggle } = useMode();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <button
        onClick={toggle}
        className="group relative flex items-center gap-1 rounded-full bg-cream-deep/95 backdrop-blur-md border border-walnut/[0.08] text-walnut p-1.5 shadow-[0_15px_40px_-12px_rgba(43,36,28,0.25)]"
        aria-label="Toggle Real / Dream"
      >
        <span
          className={clsx(
            "relative z-10 px-5 py-2 rounded-full font-mono text-[10px] tracking-[0.22em] uppercase transition-colors",
            mode === "real" ? "text-cream" : "text-walnut/55"
          )}
        >
          Real.
        </span>
        <span
          className={clsx(
            "relative z-10 px-5 py-2 rounded-full font-mono text-[10px] tracking-[0.22em] uppercase transition-colors",
            mode === "dream" ? "text-cream" : "text-walnut/55"
          )}
        >
          Dream.
        </span>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className={clsx(
            "absolute top-1.5 bottom-1.5 w-[88px] rounded-full",
            mode === "real" ? "left-1.5" : "left-[94px]"
          )}
          style={{
            background:
              mode === "dream"
                ? "linear-gradient(135deg, #C26B4A 0%, #C8A96E 100%)"
                : "#2B241C",
            boxShadow:
              mode === "dream"
                ? "0 0 24px 2px rgba(194, 107, 74, 0.45)"
                : "0 0 12px rgba(43, 36, 28, 0.25)",
          }}
        />
      </button>
    </motion.div>
  );
}
