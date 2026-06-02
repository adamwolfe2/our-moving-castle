"use client";

// Room section. Mood board. Slider hero + dense inspiration grid below.

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { RoomSlider } from "./RoomSlider";
import type { Room } from "@/lib/rooms";

type Props = { room: Room; index: number };

export function RoomSection({ room, index }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const gridY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  // Pure inspiration pool — dream (vision) + matched references
  const pool = [...room.dream, ...room.inspo];

  return (
    <section
      ref={ref}
      id={room.id}
      className="relative w-full py-20 md:py-48 overflow-hidden"
      style={{ backgroundColor: room.palette.bg, color: room.palette.ink }}
    >
      <div className="max-w-[1700px] mx-auto px-4 md:px-12">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-baseline justify-between mb-8 md:mb-12"
        >
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50 tabular-nums">
            {room.index}
          </div>
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-40 tabular-nums flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
            {pool.length} references
          </div>
        </motion.div>

        {/* Big word heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30, letterSpacing: "0.05em" }}
          whileInView={{ opacity: 1, y: 0, letterSpacing: "-0.02em" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-[clamp(3.5rem,11vw,12rem)] leading-[0.88] font-light tracking-tight mb-8 md:mb-16"
        >
          {room.name.replace(".", "")}
          <em className="italic" style={{ color: room.palette.accent }}>
            .
          </em>
        </motion.h2>

        {/* SLIDER */}
        <div className="mb-16 md:mb-28">
          <RoomSlider images={pool} kind="inspiration" label={room.name} />
        </div>

        {/* Dense reference grid below the slider */}
        {pool.length > 4 && (
          <motion.div style={{ y: gridY }}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {pool.slice(0, 18).map((src, i) => (
                <motion.figure
                  key={src + i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.7,
                    delay: (i % 6) * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`relative w-full overflow-hidden rounded-[14px] group ${
                    i % 5 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.05]"
                  />
                </motion.figure>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
