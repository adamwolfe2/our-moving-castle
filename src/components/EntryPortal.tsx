"use client";

// Section 0: entry. Cream canvas, golden dust particles, single word + period.

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () => import("./ParticleField").then((m) => m.ParticleField),
  { ssr: false }
);

export function EntryPortal() {
  return (
    <section
      id="top"
      className="relative h-screen w-full bg-cream overflow-hidden flex items-center justify-center"
    >
      <div className="absolute inset-0">
        <ParticleField />
      </div>

      {/* Warm radial highlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, rgba(200, 169, 110, 0.25), transparent 70%)",
        }}
      />

      <div className="relative z-10 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "-0.02em" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="font-serif text-walnut text-[clamp(3rem,12vw,11rem)] leading-[0.95] font-light"
        >
          Castle<em className="italic text-terracotta">.</em>
        </motion.h1>
      </div>

      <div className="absolute bottom-8 left-8 font-mono text-[10px] tracking-[0.25em] uppercase text-walnut/40">
        02 · 06 · 2026
      </div>
      <div className="absolute bottom-8 right-8 font-mono text-[10px] tracking-[0.25em] uppercase text-walnut/40">
        Scroll.
      </div>
    </section>
  );
}
