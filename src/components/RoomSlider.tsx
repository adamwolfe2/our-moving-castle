"use client";

// Cetfar-style 3-card slider: center image at full size, prev/next peeking
// from the sides. Auto-advances. Click side previews to step. Dot indicators
// below. Swipe / arrow-key navigation. Cursor-tilt 3D on the center card.

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

type Props = {
  images: string[];
  kind: "real" | "inspiration";
  label: string; // e.g., "Dining."
  autoplayMs?: number;
};

export function RoomSlider({
  images,
  kind,
  label,
  autoplayMs = 6000,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const count = images.length;
  const prev = (index - 1 + count) % count;
  const next = (index + 1) % count;

  // 3D cursor tilt on the active center card
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rxs = useSpring(rx, { stiffness: 120, damping: 18 });
  const rys = useSpring(ry, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      rx.set(-y * 4);
      ry.set(x * 4);
    };
    const onLeave = () => {
      rx.set(0);
      ry.set(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [rx, ry]);

  // Autoplay
  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, autoplayMs);
    return () => clearInterval(t);
  }, [count, paused, autoplayMs]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      if (r.top > window.innerHeight || r.bottom < 0) return;
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  if (count === 0) return null;

  const accent = kind === "real" ? "#C26B4A" : "#C8A96E";

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Stage */}
      <div className="relative w-full h-[clamp(420px,68vh,820px)] flex items-center justify-center [perspective:1400px]">
        {/* Previous (left peek) */}
        {count > 1 && (
          <button
            key={`prev-${prev}`}
            onClick={() => setIndex(prev)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block group"
            style={{ width: "16%" }}
            aria-label="Previous"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-full aspect-[3/4] rounded-[20px] overflow-hidden opacity-50 hover:opacity-75 transition-opacity"
              style={{
                transform: "translateX(-12%) scale(0.78)",
                transformOrigin: "right center",
              }}
            >
              <Image
                src={images[prev]}
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </motion.div>
          </button>
        )}

        {/* Center (active) */}
        <motion.div
          style={{
            rotateX: rxs,
            rotateY: rys,
            transformStyle: "preserve-3d",
          }}
          className="relative w-[78%] md:w-[68%] aspect-[16/10] z-20"
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={images[index]}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-[26px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(43,36,28,0.35)]"
            >
              <Image
                src={images[index]}
                alt={label}
                fill
                sizes="(max-width:768px) 90vw, 70vw"
                priority={index === 0}
                className="object-cover"
              />

              {/* Kind chip top-left */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream/90 backdrop-blur-md text-walnut font-mono text-[10px] tracking-[0.22em] uppercase">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: accent }}
                />
                Inspiration
              </div>

              {/* Room label bottom-right */}
              <div className="absolute bottom-4 right-4 z-10 font-mono text-[10px] tracking-[0.22em] uppercase text-cream/85 bg-walnut/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {label}
              </div>

              {/* Slide counter bottom-left */}
              <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] tracking-[0.22em] uppercase text-cream/85 bg-walnut/40 backdrop-blur-sm px-3 py-1.5 rounded-full tabular-nums">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Next (right peek) */}
        {count > 1 && (
          <button
            key={`next-${next}`}
            onClick={() => setIndex(next)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block group"
            style={{ width: "16%" }}
            aria-label="Next"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-full aspect-[3/4] rounded-[20px] overflow-hidden opacity-50 hover:opacity-75 transition-opacity"
              style={{
                transform: "translateX(12%) scale(0.78)",
                transformOrigin: "left center",
              }}
            >
              <Image
                src={images[next]}
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </motion.div>
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={clsx(
                "h-1.5 rounded-full transition-all duration-500",
                i === index
                  ? "w-8 bg-walnut"
                  : "w-1.5 bg-walnut/25 hover:bg-walnut/45"
              )}
            />
          ))}
        </div>
      )}

      {/* Mobile prev/next arrows */}
      {count > 1 && (
        <div className="mt-5 flex md:hidden items-center justify-center gap-6 font-mono text-[10px] tracking-[0.25em] uppercase text-walnut/55">
          <button
            onClick={() => setIndex(prev)}
            className="hover:text-terracotta transition-colors"
          >
            ← Prev
          </button>
          <span className="opacity-30">·</span>
          <button
            onClick={() => setIndex(next)}
            className="hover:text-terracotta transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
