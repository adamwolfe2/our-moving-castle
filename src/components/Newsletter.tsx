"use client";

// Full-bleed photo with single-word + period overlay (Mivar pattern, light treatment).

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";

export function Newsletter() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      ref={ref}
      className="relative w-full h-[85vh] min-h-[600px] overflow-hidden"
    >
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-[1.15]">
        <Image
          src="/dream/dream-03-cozy_bohemian_rooftop_terrace_at_dusk.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Soft cream wash — no walnut overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(245,241,235,0.0) 0%, rgba(245,241,235,0.0) 30%, rgba(245,241,235,0.55) 100%)",
          }}
        />
      </motion.div>

      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-cream text-[clamp(3rem,12vw,12rem)] leading-[0.9] font-light tracking-tight"
          style={{
            textShadow: "0 4px 30px rgba(43, 36, 28, 0.45)",
          }}
        >
          Stay<em className="italic text-terracotta">.</em>
        </motion.h2>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.3 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (email.includes("@")) setSubmitted(true);
          }}
          className="mt-12 w-full max-w-[440px] flex items-center bg-cream rounded-full p-1.5 shadow-[0_20px_60px_-15px_rgba(43,36,28,0.45)]"
        >
          <input
            type="email"
            placeholder="you@home"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitted}
            className="flex-1 bg-transparent text-walnut placeholder:text-walnut/35 px-5 py-3 outline-none text-[15px]"
          />
          <button
            type="submit"
            disabled={submitted}
            className="px-6 py-3 rounded-full bg-terracotta text-cream text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            {submitted ? "✓" : "Subscribe."}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
