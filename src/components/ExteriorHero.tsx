"use client";

// Full-bleed front-of-house hero. Cetfar / Mariven pattern:
// title centered over the photo, white, big serif. Subtle scroll parallax.

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

  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
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
          {/* Soft warm gradient — darker at the bottom-center for the title to sit on */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(43, 36, 28, 0.10) 0%, rgba(43, 36, 28, 0.0) 35%, rgba(43, 36, 28, 0.45) 100%)",
            }}
          />
        </motion.div>

        {/* Big editorial title — centered, white, bottom-middle */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-end pb-20 md:pb-28 px-6 pointer-events-none text-center"
        >
          <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-cream/80 mb-4 md:mb-6">
            A Living Mood Board
          </div>
          <h2
            className="font-serif text-cream font-light tracking-tight leading-[0.92] text-[clamp(3rem,11vw,9rem)]"
            style={{ textShadow: "0 4px 30px rgba(0,0,0,0.45)" }}
          >
            our<br />
            <em className="italic">moving</em><br />
            castle<span className="text-terracotta">.</span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
