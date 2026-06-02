"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ALL_INSPO } from "@/lib/manifest";

const ratios = [
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[1/1]",
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[1/1]",
  "aspect-[2/3]",
];

// Every inspiration image. Masonry. Every 5th gets an INSPIRATION chip.
export function InspirationBoard() {
  return (
    <section
      id="inspiration"
      className="relative w-full bg-linen text-walnut py-32 md:py-48 overflow-hidden"
    >
      <div className="max-w-[1700px] mx-auto px-6 md:px-12">
        <div className="flex items-baseline justify-between mb-12 md:mb-20">
          <h2 className="font-serif text-[clamp(3rem,9vw,8rem)] leading-[0.88] font-light tracking-tight">
            Reference<em className="italic text-terracotta">.</em>
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream border border-walnut/10 font-mono text-[10px] tracking-[0.25em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            {ALL_INSPO.length} inspiration
          </div>
        </div>

        <div className="columns-2 md:columns-3 lg:columns-5 gap-3 md:gap-4 [column-fill:_balance]">
          {ALL_INSPO.map((src, i) => (
            <motion.figure
              key={src}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: (i % 5) * 0.04,
              }}
              className={`relative ${ratios[i % ratios.length]} w-full mb-3 md:mb-4 overflow-hidden break-inside-avoid group rounded-[14px]`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.05]"
              />
              {i % 5 === 0 && (
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cream/90 backdrop-blur-md text-walnut font-mono text-[8px] tracking-[0.22em] uppercase">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  Inspiration
                </div>
              )}
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
