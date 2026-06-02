"use client";

// Full-bleed photo of the front of the house. Clean architectural hero.
// Cetfar / Mariven pattern: parallax zoom, warm gradient bleed, big serif title.
// No shaders. No WebGL distortion. Just the photo.

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { EXTERIOR } from "@/lib/rooms";

export function ExteriorHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Photo subtly zooms + drifts down as you scroll past
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      id="exterior"
      className="relative h-[130vh] w-full bg-cream overflow-hidden"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div
          style={{ y: photoY, scale: photoScale }}
          className="absolute inset-0"
        >
          <Image
            src={EXTERIOR.dream}
            alt="The front of the house"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          {/* Soft warm gradient at the bottom for the title to sit on */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(43, 36, 28, 0.0) 0%, rgba(43, 36, 28, 0.0) 45%, rgba(43, 36, 28, 0.55) 100%)",
            }}
          />
        </motion.div>

        {/* Big editorial title bottom-left */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="absolute inset-0 flex flex-col justify-end items-start px-6 md:px-16 pb-16 md:pb-24 pointer-events-none"
        >
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-cream/75 mb-3 md:mb-4">
            00
          </div>
          <h2 className="font-serif text-cream text-[clamp(4rem,14vw,12rem)] leading-[0.88] font-light tracking-tight">
            House<em className="italic text-terracotta">.</em>
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
