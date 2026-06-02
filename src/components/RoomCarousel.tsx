"use client";

// 2x2 room cards. No copy. Just the word and the photo.

import { motion } from "framer-motion";
import Image from "next/image";
import { ROOMS } from "@/lib/rooms";

export function RoomCarousel() {
  const cards = ROOMS;

  return (
    <section className="relative w-full bg-cream py-32 md:py-48 px-6 md:px-10">
      <div className="max-w-[1500px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-walnut text-[clamp(3rem,9vw,8rem)] leading-[0.9] font-light tracking-tight text-center mb-16 md:mb-20"
        >
          Rooms<em className="italic text-terracotta">.</em>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {cards.map((room, i) => (
            <motion.a
              key={room.id}
              href={`#${room.id}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.9,
                delay: (i % 4) * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group block rounded-[24px] bg-white/55 backdrop-blur-sm border border-walnut/[0.06] overflow-hidden p-3 hover:shadow-[0_30px_60px_-20px_rgba(43,36,28,0.18)] transition-all duration-700 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/5] w-full rounded-[16px] overflow-hidden">
                <Image
                  src={room.dream[0]}
                  alt={room.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.05]"
                />
              </div>
              <div className="px-2 md:px-3 py-5 flex items-center justify-between gap-2">
                <h3 className="font-serif text-walnut text-2xl md:text-3xl font-light">
                  {room.name.replace(".", "")}
                  <em className="italic text-terracotta">.</em>
                </h3>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-walnut/45 tabular-nums">
                  {room.index}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
