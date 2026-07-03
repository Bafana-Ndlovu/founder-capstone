/* ============================================================
 * Mock data. Pretend this is the JSON a real API would return.
 * Notice the deliberately awkward reality in here:
 *  - some items have no photos
 *  - some have no price (free)
 *  - some owners have no rating yet (null)
 *  - some items are "paused" and must not be bookable
 *  - distanceKm is null for some (viewer hasn't shared location)
 * Your UI has to handle ALL of these gracefully. That is the point.
 *
 * You may reshape how you load/serve this (a fake async fetch, a
 * context, a hook) — that architectural choice is yours to make
 * and to defend in your Decision Log.
 *
 * -----------------------------------------------------------------
 * NOTE (added by candidate): the first 8 items below are the
 * provided fixtures, kept VERBATIM. The block marked "ADDITIONAL
 * DEMO LISTINGS" is extra sample content I authored in the exact
 * same contract shape, so the browse grid feels populated without
 * faking activity. It's labelled as demo data in the app footer.
 * Nothing here weakens the contract in ./types.ts.
 * ============================================================ */

import type { Item } from './types.ts';

export const ITEMS: Item[] = [
  {
    id: "itm_001",
    title: "Cordless Drill (18V)",
    category: "power-tools",
    description: "Solid drill, two batteries, works for most home jobs.",
    photoUrls: ["https://picsum.photos/seed/drill/600/400"],
    price: { amountCents: 5000, period: "day" },
    owner: { id: "usr_a", displayName: "Naledi", rating: 4.8, ratingCount: 24, joinedISO: "2025-02-11" },
    distanceKm: 1.2,
    status: "available",
    postedISO: "2026-06-20",
  },
  {
    id: "itm_002",
    title: "Extension Ladder (3m)",
    category: "outdoor",
    description: "Aluminium, light, fits in a hatchback.",
    photoUrls: [],
    price: { amountCents: 0, period: "day" },
    owner: { id: "usr_b", displayName: "Sipho", rating: null, ratingCount: 0, joinedISO: "2026-06-18" },
    distanceKm: null,
    status: "available",
    postedISO: "2026-06-25",
  },
  {
    id: "itm_003",
    title: "Pressure Washer",
    category: "outdoor",
    description: "Great for driveways and walls. Bring your own hose.",
    photoUrls: ["https://picsum.photos/seed/washer/600/400", "https://picsum.photos/seed/washer2/600/400"],
    price: { amountCents: 12000, period: "day" },
    owner: { id: "usr_c", displayName: "Fatima", rating: 4.2, ratingCount: 6, joinedISO: "2025-11-02" },
    distanceKm: 4.7,
    status: "paused",
    postedISO: "2026-05-30",
  },
  {
    id: "itm_004",
    title: "Stand Mixer",
    category: "kitchen",
    description: "For big baking days. Comes with whisk + dough hook.",
    photoUrls: ["https://picsum.photos/seed/mixer/600/400"],
    price: { amountCents: 8000, period: "day" },
    owner: { id: "usr_d", displayName: "Grace", rating: 5.0, ratingCount: 2, joinedISO: "2026-01-19" },
    distanceKm: 0.6,
    status: "available",
    postedISO: "2026-06-28",
  },
  {
    id: "itm_005",
    title: "Folding Tables (x4)",
    category: "party",
    description: "Set of four trestle tables. Good for events.",
    photoUrls: ["https://picsum.photos/seed/tables/600/400"],
    price: { amountCents: 15000, period: "day" },
    owner: { id: "usr_e", displayName: "Themba", rating: 3.9, ratingCount: 11, joinedISO: "2024-09-14" },
    distanceKm: 8.1,
    status: "available",
    postedISO: "2026-06-15",
  },
  {
    id: "itm_006",
    title: "Lawn Mower (petrol)",
    category: "garden",
    description: "Self-propelled. A bit loud but cuts fast.",
    photoUrls: [],
    price: null,
    owner: { id: "usr_f", displayName: "Anele", rating: 4.5, ratingCount: 18, joinedISO: "2025-07-07" },
    distanceKm: 2.9,
    status: "available",
    postedISO: "2026-06-22",
  },
  {
    id: "itm_007",
    title: "Tile Cutter",
    category: "hand-tools",
    description: "Manual tile cutter, up to 600mm.",
    photoUrls: ["https://picsum.photos/seed/tile/600/400"],
    price: { amountCents: 3000, period: "day" },
    owner: { id: "usr_c", displayName: "Fatima", rating: 4.2, ratingCount: 6, joinedISO: "2025-11-02" },
    distanceKm: 4.7,
    status: "available",
    postedISO: "2026-06-11",
  },
  {
    id: "itm_008",
    title: "Gazebo (3x3m)",
    category: "party",
    description: "Pop-up gazebo, white. One pole has tape on it, still fine.",
    photoUrls: ["https://picsum.photos/seed/gazebo/600/400"],
    price: { amountCents: 0, period: "day" },
    owner: { id: "usr_e", displayName: "Themba", rating: 3.9, ratingCount: 11, joinedISO: "2024-09-14" },
    distanceKm: null,
    status: "removed",
    postedISO: "2026-04-02",
  },

  /* ---------- ADDITIONAL DEMO LISTINGS (candidate-authored, same contract) ---------- */
  {
    id: "itm_009",
    title: "Angle Grinder (115mm)",
    category: "power-tools",
    description: "Cuts tile, brick and rebar. Spare discs and a face shield in the bag.",
    photoUrls: ["https://picsum.photos/seed/grinder/600/400"],
    price: { amountCents: 6000, period: "day" },
    owner: { id: "usr_a", displayName: "Naledi", rating: 4.8, ratingCount: 24, joinedISO: "2025-02-11" },
    distanceKm: 1.2,
    status: "available",
    postedISO: "2026-06-29",
  },
  {
    id: "itm_010",
    title: "Wheelbarrow",
    category: "garden",
    description: "Solid puncture-proof wheel. Moves soil, rubble and compost.",
    photoUrls: [],
    price: null,
    owner: { id: "usr_g", displayName: "Kagiso", rating: null, ratingCount: 0, joinedISO: "2026-06-30" },
    distanceKm: 0.9,
    status: "available",
    postedISO: "2026-06-30",
  },
  {
    id: "itm_011",
    title: "PA Speaker + Wireless Mic",
    category: "party",
    description: "Battery-powered, Bluetooth, loud enough for a street party. Priced by the week for events.",
    photoUrls: ["https://picsum.photos/seed/pa-speaker/600/400"],
    price: { amountCents: 40000, period: "week" },
    owner: { id: "usr_h", displayName: "Lerato", rating: 4.6, ratingCount: 9, joinedISO: "2025-05-21" },
    distanceKm: 3.5,
    status: "available",
    postedISO: "2026-06-24",
  },
  {
    id: "itm_012",
    title: "Projector + 100\" Screen",
    category: "party",
    description: "Backyard movie nights and match screenings. All cables included.",
    photoUrls: ["https://picsum.photos/seed/projector/600/400"],
    price: { amountCents: 9000, period: "day" },
    owner: { id: "usr_d", displayName: "Grace", rating: 5.0, ratingCount: 2, joinedISO: "2026-01-19" },
    distanceKm: 0.6,
    status: "available",
    postedISO: "2026-06-27",
  },
  {
    id: "itm_013",
    title: "Camp Chairs (x2) + Cooler Box",
    category: "outdoor",
    description: "The full sideline-parent kit. 25L cooler keeps things cold all day.",
    photoUrls: [],
    price: { amountCents: 0, period: "day" },
    owner: { id: "usr_b", displayName: "Sipho", rating: null, ratingCount: 0, joinedISO: "2026-06-18" },
    distanceKm: null,
    status: "available",
    postedISO: "2026-06-19",
  },
  {
    id: "itm_014",
    title: "Socket & Spanner Set",
    category: "hand-tools",
    description: "94-piece metric set in a case. Everything from the car to flat-pack furniture.",
    photoUrls: ["https://picsum.photos/seed/spanners/600/400"],
    price: { amountCents: 2500, period: "day" },
    owner: { id: "usr_f", displayName: "Anele", rating: 4.5, ratingCount: 18, joinedISO: "2025-07-07" },
    distanceKm: 2.9,
    status: "available",
    postedISO: "2026-06-16",
  },
  {
    id: "itm_015",
    title: "Potjie Pot No. 3 + Stand",
    category: "kitchen",
    description: "Seasoned cast iron, feeds about eight. Tripod stand and lid lifter included.",
    photoUrls: ["https://picsum.photos/seed/potjie/600/400"],
    price: { amountCents: 0, period: "day" },
    owner: { id: "usr_h", displayName: "Lerato", rating: 4.6, ratingCount: 9, joinedISO: "2025-05-21" },
    distanceKm: 3.5,
    status: "available",
    postedISO: "2026-06-12",
  },
  {
    id: "itm_016",
    title: "Electric Hedge Trimmer",
    category: "garden",
    description: "Light and sharp. Owner has paused this one while a blade is replaced.",
    photoUrls: ["https://picsum.photos/seed/hedge/600/400"],
    price: { amountCents: 4000, period: "day" },
    owner: { id: "usr_g", displayName: "Kagiso", rating: null, ratingCount: 0, joinedISO: "2026-06-30" },
    distanceKm: 0.9,
    status: "paused",
    postedISO: "2026-06-10",
  },
];

/**
 * A fake async loader so you can practise typing data you don't
 * control yet. Use it or replace it — your call, but justify it.
 *
 * (Candidate note: superseded by src/api/index.ts, which wraps this same
 * ITEMS array with query/sort/booking behaviour behind the Api interface.
 * Kept here so the provided entrypoint still resolves.)
 */
export function fetchItems(): Promise<Item[]> {
  return new Promise((resolve) => setTimeout(() => resolve(ITEMS), 400));
}
