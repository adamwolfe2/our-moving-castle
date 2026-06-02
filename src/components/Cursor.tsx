"use client";

// Custom cursor: small ring that scales on hover targets, lags slightly behind.
// Mariven + Hello-Archi both use a custom cursor. Adds craft.

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.5 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive =
        target.closest("a, button, [role='button']") != null;
      setHovering(interactive);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed top-0 left-0 z-[100] hidden md:block"
    >
      <motion.div
        animate={{
          scale: hovering ? 1.8 : 1,
          opacity: hovering ? 0.4 : 0.9,
        }}
        transition={{ duration: 0.25 }}
        className="-translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-terracotta mix-blend-difference"
      />
    </motion.div>
  );
}
