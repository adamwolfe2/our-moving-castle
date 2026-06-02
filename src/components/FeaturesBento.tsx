"use client";

// Room plan bento. Each card = one room, links into its section.
// Pure inspiration — no real/dream distinction.

import { motion } from "framer-motion";
import Image from "next/image";
import { ROOMS } from "@/lib/rooms";

const sizing = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
  "md:col-span-1",
  "md:col-span-1",
];

export function FeaturesBento() {
  return (
    <section className="relative w-full bg-cream py-32 md:py-48 px-6 md:px-10 overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-baseline justify-between mb-12 md:mb-20"
        >
          <h2 className="font-serif text-walnut text-[clamp(3rem,9vw,8rem)] leading-[0.88] font-light tracking-tight">
            Plan<em className="italic text-terracotta">.</em>
          </h2>
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-walnut/45">
            {ROOMS.length} rooms
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[240px] md:auto-rows-[260px] gap-3 md:gap-4">
          {ROOMS.map((room, i) => {
            const src = room.dream[0] ?? room.inspo[0];
            return (
              <motion.a
                key={room.id}
                href={`#${room.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`group relative rounded-[24px] overflow-hidden bg-cream-deep ${sizing[i] ?? ""}`}
              >
                <Image
                  src={src}
                  alt={room.name}
                  fill
                  sizes="(max-width:768px) 50vw, 35vw"
                  className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-walnut/55 via-transparent to-transparent" />

                <div className="absolute top-3 right-3 font-mono text-[10px] tracking-[0.22em] uppercase text-cream/85 tabular-nums">
                  {room.index}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <h3 className="font-serif text-cream text-3xl md:text-4xl font-light leading-none">
                    {room.name.replace(".", "")}
                    <em className="italic text-terracotta">.</em>
                  </h3>
                  <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-cream/75 tabular-nums text-right">
                    {room.dream.length + room.inspo.length}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
