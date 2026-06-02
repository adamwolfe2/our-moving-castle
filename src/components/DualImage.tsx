"use client";

// Cross-dissolves between real photo and dream photo based on global mode.
// Used inside every room section so a single toggle morphs the whole site.

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMode } from "@/store/mode";
import clsx from "clsx";

type Props = {
  real: string;
  dream: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export function DualImage({
  real,
  dream,
  alt,
  priority = false,
  className,
  sizes = "100vw",
}: Props) {
  const { mode } = useMode();
  const src = mode === "real" ? real : dream;

  return (
    <div className={clsx("relative w-full h-full overflow-hidden", className)}>
      <AnimatePresence mode="sync">
        <motion.div
          key={src}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0"
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
