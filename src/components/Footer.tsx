"use client";

// Footer. Cream-on-cream, giant wordmark with warm bloom.

import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative w-full bg-cream text-walnut pt-32 pb-12 overflow-hidden">
      <div className="max-w-[1700px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 mb-32 md:mb-48 font-mono text-[11px] tracking-[0.2em] uppercase opacity-60">
          <span>Our Moving Castle</span>
          <span className="md:text-center">02 · 06 · 2026</span>
          <span className="md:text-right">↑ Top</span>
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 blur-3xl opacity-50 pointer-events-none"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 60%, rgba(194, 107, 74, 0.45), transparent 70%)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative font-serif text-walnut text-[clamp(2.5rem,13vw,13rem)] leading-[0.85] font-light tracking-tight text-center"
          >
            our<br />
            <em className="italic">moving</em><br />
            castle<span className="text-terracotta">.</span>
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-12 font-mono text-[10px] tracking-[0.25em] uppercase opacity-50">
          <span>© The Wolfes</span>
          <span>↑</span>
        </div>
      </div>
    </footer>
  );
}
