"use client";

// Hidden "walk through the front door" portal into the app.
// An invisible hitbox sits over the wooden front door in the hero photo.
// Hover gives a faint warm glow (the door inviting you in). Click dives the
// camera into the door — the whole facade zooms toward the threshold and a
// warm dusk veil closes over it — then routes to /login.
//
// Door target is expressed in viewport %, and the SAME coordinates drive both
// the hitbox position and the zoom transform-origin, so the dive always
// originates exactly where you clicked, regardless of object-cover cropping.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// % of the viewport — the wooden door sits dead-center, just above the middle.
const DOOR = { x: 50, y: 47 };

export function FrontDoorEntry({ src }: { src: string }) {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  function enter() {
    if (entering) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      router.push("/login");
      return;
    }
    setEntering(true);
  }

  return (
    <>
      {/* Invisible front-door hitbox */}
      <button
        type="button"
        aria-label="Enter the house"
        onClick={enter}
        className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[45%] outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40"
        style={{
          left: `${DOOR.x}%`,
          top: `${DOOR.y}%`,
          width: "clamp(48px, 8vmin, 120px)",
          height: "clamp(96px, 16vmin, 240px)",
        }}
      >
        {/* Hover-only affordance — a soft warm bloom around the door */}
        <span
          aria-hidden
          className="door-hint pointer-events-none absolute -inset-6 rounded-[50%] opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{
            background:
              "radial-gradient(circle, rgba(200,169,110,0.30) 0%, rgba(200,169,110,0.10) 45%, transparent 72%)",
            boxShadow: "0 0 50px 14px rgba(200,169,110,0.22)",
          }}
        />
      </button>

      {/* Camera dive — zooms into the threshold, then navigates */}
      <AnimatePresence>
        {entering && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.05 }}
              animate={{ scale: 9 }}
              transition={{ duration: 1.15, ease: [0.6, 0.01, 0.55, 1] }}
              style={{ transformOrigin: `${DOOR.x}% ${DOOR.y}%` }}
              onAnimationComplete={() => router.push("/login")}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </motion.div>

            {/* Warm dusk veil closing over the doorway as you cross it */}
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeIn", delay: 0.25 }}
              style={{
                background: `radial-gradient(circle at ${DOOR.x}% ${DOOR.y}%, rgba(43,36,28,0) 0%, rgba(43,36,28,0.55) 42%, rgba(26,20,16,0.96) 78%, #1a1410 100%)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
