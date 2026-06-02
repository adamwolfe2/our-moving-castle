// Rooms data model — one word + period per room. No copy. No quotes.
// Photo distribution: every real + every dream + room-matched inspo.

import { inspoMatching } from "./manifest";

export type RoomId =
  | "exterior"
  | "foyer"
  | "living"
  | "kitchen"
  | "dining"
  | "bedroom"
  | "study"
  | "outdoor";

export type Room = {
  id: RoomId;
  index: string;
  name: string;
  real: string[];
  dream: string[];
  inspo: string[];
  palette: { bg: string; ink: string; accent: string };
};

const cream = "#F5F1EB";
const creamDeep = "#ECE5DA";
const linen = "#EDE6D8";
const walnut = "#2B241C";
const terracotta = "#C26B4A";
const moss = "#6B7A5A";
const dust = "#A89685";

// Distribute the 13 real photos across rooms (placeholders until labeled)
// Real photos disabled — pure mood board mode.
// To re-enable, uncomment ALL_REAL import and use realFor below.
const realFor = (_idxs: number[]): string[] => [];

export const ROOMS: Room[] = [
  {
    id: "foyer",
    index: "01",
    name: "Foyer.",
    real: realFor([0, 1]),
    dream: [
      "/dream/dream-09-elegant_foyer_with_cozy_boho_charm.png",
    ],
    inspo: inspoMatching(["foyer", "entry", "hallway"]),
    palette: { bg: cream, ink: walnut, accent: terracotta },
  },
  {
    id: "living",
    index: "02",
    name: "Living.",
    real: realFor([2, 3, 4]),
    dream: [
      "/dream/dream-08-cozy_vintage_boho_living_room_ambiance.png",
      "/dream/dream-10-sunlit_bohemian_living_room_oasis.png",
    ],
    inspo: inspoMatching(["living_room", "living-room", "livingroom"]),
    palette: { bg: linen, ink: walnut, accent: terracotta },
  },
  {
    id: "kitchen",
    index: "03",
    name: "Kitchen.",
    real: realFor([5, 6]),
    dream: [
      "/dream/dream-07-cozy_plant_filled_kitchen_with_natural_light.png",
    ],
    inspo: inspoMatching(["kitchen"]),
    palette: { bg: creamDeep, ink: walnut, accent: moss },
  },
  {
    id: "dining",
    index: "04",
    name: "Dining.",
    real: realFor([7]),
    dream: [
      "/dream/dream-02-cozy_bohemian_dining_room_with_plants.png",
    ],
    inspo: inspoMatching(["dining"]),
    palette: { bg: cream, ink: walnut, accent: terracotta },
  },
  {
    id: "bedroom",
    index: "05",
    name: "Bedroom.",
    real: realFor([8, 9]),
    dream: [
      "/dream/dream-05-cozy_boho_bedroom_with_lush_plants.png",
    ],
    inspo: inspoMatching(["bedroom"]),
    palette: { bg: linen, ink: walnut, accent: dust },
  },
  {
    id: "study",
    index: "06",
    name: "Study.",
    real: realFor([10]),
    dream: [
      "/dream/dream-04-cozy_bohemian_study_with_warm_glow.png",
    ],
    inspo: inspoMatching(["study", "office"]),
    palette: { bg: creamDeep, ink: walnut, accent: moss },
  },
  {
    id: "outdoor",
    index: "07",
    name: "Outside.",
    real: realFor([11, 12]),
    dream: [
      "/dream/dream-01-cozy_bohemian_deck_at_sunset.png",
      "/dream/dream-03-cozy_bohemian_rooftop_terrace_at_dusk.png",
    ],
    inspo: inspoMatching([
      "deck",
      "patio",
      "terrace",
      "outdoor",
      "garden",
      "backyard",
    ]),
    palette: { bg: linen, ink: walnut, accent: terracotta },
  },
];

export const EXTERIOR = {
  index: "00",
  name: "House.",
  real: "",
  dream: "/inspo/inspo-42-modern_hillside_home_with_expansive_glass_facade.png",
  inspo: inspoMatching([
    "hillside",
    "facade",
    "twilight_view",
    "modern_woodland",
  ]),
};

export const TOKENS = {
  cream,
  creamDeep,
  linen,
  walnut,
  terracotta,
  moss,
  dust,
};
