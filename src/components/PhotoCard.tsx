"use client";

// Single labeled photo card. Always shows its kind: REAL or INSPIRATION.
// Real = warm Polaroid frame, slight rotation, slight desaturation.
// Inspiration = clean editorial, full bleed, no frame, cooler.

import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";

export type PhotoKind = "real" | "inspiration";

type Props = {
  src: string;
  kind: PhotoKind;
  alt?: string;
  className?: string;
  index?: number; // for staggered rotation
  showLabel?: boolean;
  sizes?: string;
  aspect?: string; // tailwind aspect-* utility
  rounded?: string; // tailwind rounded-* utility
  priority?: boolean;
};

export function PhotoCard({
  src,
  kind,
  alt = "",
  className,
  index = 0,
  showLabel = true,
  sizes = "(max-width:768px) 50vw, 25vw",
  aspect = "aspect-[4/5]",
  rounded,
  priority = false,
}: Props) {
  const isReal = kind === "real";
  // Polaroid-style rotation pattern for real photos
  const rotateDeg = isReal ? ((index % 5) - 2) * 1.4 : 0;

  return (
    <motion.figure
      initial={{ opacity: 0, y: 24, rotate: rotateDeg + (isReal ? 4 : 0) }}
      whileInView={{ opacity: 1, y: 0, rotate: rotateDeg }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.8,
        delay: (index % 6) * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={isReal ? { rotate: 0, scale: 1.03 } : { scale: 1.02 }}
      className={clsx(
        "relative group",
        isReal
          ? "p-2.5 pb-10 bg-cream shadow-[0_18px_40px_-15px_rgba(43,36,28,0.32)]"
          : "",
        rounded
          ? rounded
          : isReal
            ? "rounded-[6px]"
            : "rounded-[18px] overflow-hidden",
        className
      )}
      style={{
        transformOrigin: "center",
      }}
    >
      <div
        className={clsx(
          "relative w-full overflow-hidden",
          aspect,
          isReal ? "" : ""
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={clsx(
            "object-cover",
            isReal
              ? "saturate-[0.92] contrast-[0.95]"
              : "transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          )}
        />
        {/* Inspiration label */}
        {!isReal && showLabel && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream/85 backdrop-blur-md text-walnut font-mono text-[9px] tracking-[0.2em] uppercase border border-walnut/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
            Inspiration
          </div>
        )}
      </div>
      {/* Polaroid caption for real */}
      {isReal && showLabel && (
        <figcaption className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5 font-mono text-[9px] tracking-[0.25em] uppercase text-walnut/60">
          <span className="w-1 h-1 rounded-full bg-terracotta" />
          Real
        </figcaption>
      )}
    </motion.figure>
  );
}
