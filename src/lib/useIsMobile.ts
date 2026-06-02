"use client";

// Detect mobile / touch device. Used to gate heavy effects + cursor.
// Returns initial guess from window matchMedia, then re-evaluates on resize.

import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const small = window.innerWidth < breakpoint;
      const touch =
        "ontouchstart" in window ||
        (window.matchMedia && window.matchMedia("(hover: none)").matches);
      setIsMobile(small || touch);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
