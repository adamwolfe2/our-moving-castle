"use client";

// Section 1: full-bleed WebGL hero. Three.js shader plane with cursor displacement.
// Single word + period only. No descriptors. No taglines.

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";

const WebGLHero = dynamic(
  () => import("./WebGLHero").then((m) => m.WebGLHero),
  { ssr: false }
);

export function ExteriorHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const overlay = useTransform(scrollYProgress, [0, 1], [0.18, 0.55]);

  return (
    <section
      ref={ref}
      id="exterior"
      className="relative h-[140vh] w-full bg-cream overflow-hidden"
    >
      <div className="sticky top-0 h-screen w-full">
        <WebGLHero />
      </div>

      <motion.div
        style={{ opacity: overlay }}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream/80 pointer-events-none"
      />

      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="absolute inset-0 flex flex-col justify-end items-start px-8 md:px-16 pb-32 pointer-events-none"
      >
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-cream/70 mb-4">
          00
        </div>
        <h2 className="font-serif text-cream text-[clamp(3rem,11vw,11rem)] leading-[0.9] font-light tracking-tight">
          House<em className="italic text-terracotta">.</em>
        </h2>
      </motion.div>
    </section>
  );
}
