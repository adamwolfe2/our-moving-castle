"use client";

// Entry. Clean cream. Big serif. Soft warm bloom. No particles, no dots.

import { motion } from "framer-motion";

export function EntryPortal() {
  return (
    <section
      id="top"
      className="relative h-screen w-full bg-cream overflow-hidden flex items-center justify-center"
    >
      {/* Single soft warm radial — no points, no particles */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, rgba(200, 169, 110, 0.22), transparent 70%)",
        }}
      />

      <div className="relative z-10 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "-0.02em" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="font-serif text-walnut text-[clamp(4rem,18vw,12rem)] leading-[0.9] font-light"
        >
          Castle<em className="italic text-terracotta">.</em>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-10 md:mt-12 font-mono text-[10px] tracking-[0.32em] uppercase text-walnut/45"
        >
          Scroll
        </motion.div>

        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mx-auto mt-5 h-10 w-px bg-walnut/25 origin-top"
        />
      </div>

      <div className="absolute bottom-6 left-6 font-mono text-[9px] tracking-[0.3em] uppercase text-walnut/35">
        Our Moving Castle
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[9px] tracking-[0.3em] uppercase text-walnut/35">
        2026
      </div>
    </section>
  );
}
