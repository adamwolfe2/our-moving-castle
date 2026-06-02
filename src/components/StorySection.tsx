"use client";

// Section break with a single word + period. Mariven floating side photos pattern.

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { ALL_DREAM } from "@/lib/manifest";

export function StorySection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const leftY = useTransform(scrollYProgress, [0, 1], ["-40%", "40%"]);
  const rightY = useTransform(scrollYProgress, [0, 1], ["40%", "-40%"]);
  const leftR = useTransform(scrollYProgress, [0, 1], [-6, 6]);
  const rightR = useTransform(scrollYProgress, [0, 1], [6, -6]);

  return (
    <section
      ref={ref}
      id="story"
      className="relative w-full bg-cream text-walnut py-40 md:py-64 overflow-hidden"
    >
      <motion.div
        style={{ y: leftY, rotate: leftR }}
        className="absolute top-32 left-4 md:left-12 w-32 md:w-64 aspect-[3/4] hidden sm:block rounded-[18px] overflow-hidden"
      >
        <Image
          src={ALL_DREAM[3]}
          alt=""
          fill
          sizes="20vw"
          className="object-cover"
        />
      </motion.div>
      <motion.div
        style={{ y: rightY, rotate: rightR }}
        className="absolute bottom-32 right-4 md:right-12 w-32 md:w-64 aspect-[3/4] hidden sm:block rounded-[18px] overflow-hidden"
      >
        <Image
          src={ALL_DREAM[1]}
          alt=""
          fill
          sizes="20vw"
          className="object-cover"
        />
      </motion.div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-serif text-[clamp(4rem,14vw,14rem)] leading-[0.9] font-light tracking-tight">
          Home<em className="italic text-terracotta">.</em>
        </h2>
      </div>
    </section>
  );
}
