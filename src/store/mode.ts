// Global REAL/DREAM mode store — Zustand.
// One toggle drives the entire site simultaneously.

import { create } from "zustand";

export type Mode = "real" | "dream";

type ModeState = {
  mode: Mode;
  toggle: () => void;
  set: (m: Mode) => void;
};

export const useMode = create<ModeState>((set) => ({
  mode: "dream", // dream-first since real photos are placeholders
  toggle: () => set((s) => ({ mode: s.mode === "real" ? "dream" : "real" })),
  set: (m) => set({ mode: m }),
}));
