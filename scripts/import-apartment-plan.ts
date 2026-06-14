/**
 * Append-only: apartment-specific move-out layer, built from the real photos
 * of the current unit (Current Apartment folder, 6/14). Room-by-room purge +
 * pack map, big/awkward-item decisions, and the cat plan.
 *
 * Idempotent by title/item. Never wipes. Run: pnpm tsx scripts/import-apartment-plan.ts
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

const OLD = "Old — 16533 NE Halsey";

const NEW_TASKS = [
  // ===== BIG / AWKWARD ITEM DECISIONS — longest lead time, decide FIRST =====
  { title: "🔴 DECIDE THE POOL TABLE — sell now OR book specialty movers (NOT a DIY lift)", category: "move", priority: "critical", dueDate: "2026-06-15", owner: "you", area: OLD, notes: "From kitchen photo. A pool table can't ride a U-Haul DIY move — if it's slate it's 700–1000 lb in 3 pieces and needs pro disassembly + re-leveling at the new house. Two paths: (1) LIST IT FOR SALE today — it's your longest-lead item, or (2) get a pool-table-mover quote (~$400–600). Decide Monday or it derails Saturday." },
  { title: "List big SELL items today: pool table, patio daybed, shoji screens, extra seating", category: "move", priority: "high", dueDate: "2026-06-14", owner: "both", area: "Sell/Downsize", notes: "Bulky items need days to sell, so post FIRST: pool table, the green patio daybed + office chair, the 4-panel shoji room dividers, any sofa/chair you're not taking. FB Marketplace + OfferUp, price to move." },

  // ===== PRIORITY PURGE — where the actual mess is (do these before pretty-packing) =====
  { title: "PURGE #1: Storage/utility closet — the duffels, plastic bags & bins", category: "move", priority: "high", dueDate: "2026-06-14", owner: "both", area: OLD, notes: "Biggest downsize win. The packed closet (suitcases, camp chairs, vacuum, bags of deferred stuff). Open every bag, decide now: toss broken, donate unused. ✅ You already have flattened Home Depot MEDIUM/LARGE boxes stashed in here — reuse them, buy fewer." },
  { title: "PURGE #2: Linen closet — towels, toiletries, baskets (it's overflowing)", category: "move", priority: "normal", dueDate: "2026-06-15", owner: "both", area: OLD, notes: "Keep 2 towel sets + 1 week of toiletries out; box the rest, toss anything expired/half-empty. Heads up: this is the cat's perch — she'll be in here. Soft linens are great void-fill in big boxes." },
  { title: "PURGE #3: Bedroom closet — cull clothes, then wardrobe-box the rail", category: "move", priority: "normal", dueDate: "2026-06-15", owner: "both", area: OLD, notes: "Donate what neither of you wore this year. Then hanging clothes go straight from the rail into wardrobe boxes. Empty the gray bins on the top shelf — decide their contents now." },
  { title: "PURGE #4: Books — cull 1–2 shelves, box the rest in SMALL boxes only", category: "move", priority: "normal", dueDate: "2026-06-14", owner: "both", area: OLD, notes: "Two full bookshelves. Books are heavy + you have a lot — cull a box or two (Powell's buys books; donate the rest). Whatever stays goes in SMALL boxes so they stay liftable." },

  // ===== ROOM-BY-ROOM PACK MAP (matches your actual layout) =====
  { title: "PACK — Kitchen/dining: dish-pack glassware, box small appliances, clear the island", category: "move", priority: "normal", dueDate: "2026-06-16", owner: "both", area: OLD, notes: "Glassware → dish-pack w/ dividers + paper. Keep 2 plates/mugs/pans + coffee out for the week. Clear the island + barstools." },
  { title: "PACK — 2nd bedroom/office: kids'/guest area, stuffed animals, loose cables", category: "move", priority: "normal", dueDate: "2026-06-16", owner: "both", area: OLD, notes: "Bag + label cables. Stuffed animals are free void-fill. Decide what guest/kid gear actually comes with you." },
  { title: "PACK — Patio: clear the daybed, office chair, shoe rack off the deck", category: "move", priority: "normal", dueDate: "2026-06-17", owner: "both", area: OLD, notes: "If not sold, blanket-wrap the daybed for the truck. Patio empties easily — good quick win." },
  { title: "PACK — Living room: wrap TV + electronics, then Togo chairs + sectional", category: "move", priority: "normal", dueDate: "2026-06-18", owner: "both", area: OLD, notes: "Dismount the TV (keep screws bagged + the bracket). Togo beanbag chairs + the white sectional are LIGHT but bulky — pull cushions + legs and they car-shuttle easily; truck only if a load is going anyway. Don't forget the mini-split remote." },

  // ===== CAT =====
  { title: "🐈 Cat plan: safe-room at BOTH ends + carrier/litter always reachable", category: "home", priority: "high", dueDate: "2026-06-17", owner: "both", area: "New — 3336 NE Cadet", notes: "She perches high (linen shelf) and will hide/bolt during chaos. On pack days + move day, confine her to ONE quiet closed room with food/water/litter/hideout — at the old place while loading, then the prepped quiet room at the new house. Carrier + litter ride in the car, not the truck. Keep her away from propped-open doors." },
];

// ---- A couple apartment-specific supplies (you already have boxes, so add tools not boxes) ----
const NEW_SHOPPING = [
  { item: "Moving/lifting straps (2-person shoulder dolly)", area: "Packing", estCost: 25, notes: "For the bulky-but-light sectional + Togo chairs down stairs/through doors without wrecking your back." },
  { item: "Furniture sliders / felt pads (hard floors)", area: "Packing", estCost: 12, notes: "Slide the sectional + dresser instead of dragging them across the wood floors." },
];

async function main() {
  const { db } = await import("../src/lib/db");
  const { tasks, shopping } = await import("../src/lib/db/schema");

  const existingTasks = new Set(
    (await db.select({ title: tasks.title }).from(tasks)).map((r) => r.title),
  );
  const existingShopping = new Set(
    (await db.select({ item: shopping.item }).from(shopping)).map((r) => r.item),
  );

  const taskRows = NEW_TASKS.filter((t) => !existingTasks.has(t.title));
  const shoppingRows = NEW_SHOPPING.filter((s) => !existingShopping.has(s.item));

  if (taskRows.length) {
    const base = existingTasks.size;
    await db.insert(tasks).values(
      taskRows.map((t, i) => ({ ...t, status: "todo", sortOrder: base + i })) as never,
    );
  }
  if (shoppingRows.length) await db.insert(shopping).values(shoppingRows as never);

  console.log(
    `✅ Apartment plan import:\n` +
      `   tasks:    ${taskRows.length} new (skipped ${NEW_TASKS.length - taskRows.length} dupes)\n` +
      `   shopping: ${shoppingRows.length} new (skipped ${NEW_SHOPPING.length - shoppingRows.length})`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
