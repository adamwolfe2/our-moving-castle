/**
 * Append-only import of the move-week execution plan (Sun 6/14 → Sun 6/21).
 * Day-by-day, time-blocked tasks (calendar reads by dueDate), packing-supply
 * shopping list, move-out cleaner contacts, and budget lines.
 *
 * Idempotent: inserts only rows whose title/item/name/label don't already exist.
 * Never wipes anything — safe to run on the live DB.
 * Run: pnpm tsx scripts/import-move-week.ts
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

const OLD = "Old — 16533 NE Halsey";
const NEW = "New — 3336 NE Cadet";

// ---- Day-by-day, time-blocked schedule (titles prefixed so the calendar reads as a plan) ----
const NEW_TASKS = [
  // ===== SUN 6/14 — Supply run + downsize launch (cooler work AM/PM, not midday heat) =====
  { title: "SUN AM: One supply run — buy ALL packing materials (see Shopping)", category: "move", priority: "high", dueDate: "2026-06-14", owner: "you", area: "Packing", notes: "One trip only. U-Haul (boxes + rent pads/dolly/truck) → Home Depot (contractor bags, tools) → Amazon same-day for tape/bubble/markers. Get it all today so you never have to leave again." },
  { title: "SUN Midday: 3-pile sweep every room — KEEP / SELL / TOSS", category: "move", priority: "high", dueDate: "2026-06-14", owner: "both", area: "Packing", notes: "Decide fast, room by room. Goal: downsize hard. If it hasn't been used in 6 months and you won't miss it, it sells or goes. Tape a colored label on KEEP boxes per room." },
  { title: "SUN PM: Photograph + post first SELL batch (FB Marketplace, OfferUp, Nextdoor)", category: "move", priority: "high", dueDate: "2026-06-14", owner: "both", area: "Sell/Downsize", notes: "Price to MOVE, not to max. Furniture you're not taking, electronics, decor. 'Porch pickup, first-come, cash.' Post Sunday night = most weekday buyers." },
  { title: "SUN Evening: Pack cold zones — books, out-of-season clothes, decor, closet overflow", category: "move", priority: "normal", dueDate: "2026-06-14", owner: "both", area: "Packing", notes: "Start with what you won't touch before the move. Books in SMALL boxes (heavy). Label top + side by room." },

  // ===== MON 6/15 — Work day + evening pack =====
  { title: "MON Before work: Answer sell inquiries, schedule porch pickups", category: "move", priority: "normal", dueDate: "2026-06-15", owner: "both", area: "Sell/Downsize", notes: "Batch replies. Stack pickups for one evening window so you're not interrupted all week." },
  { title: "MON CONFIRM landlord move-out date + deposit terms (lease notice)", category: "admin", priority: "critical", dueDate: "2026-06-15", owner: "you", area: OLD, notes: "THE open dependency — the whole back half of this plan assumes you can keep the apartment through ~6/21. Verify required surrender date + notice period TODAY. Deposit depends on it." },
  { title: "MON 7–9pm: Pack Zone 1 — bedroom closet + dresser + nightstands", category: "move", priority: "normal", dueDate: "2026-06-15", owner: "both", area: "Packing", notes: "Hanging clothes → wardrobe boxes straight off the rod. Keep one week of work clothes out." },

  // ===== TUE 6/16 — Work + final walkthrough + pack =====
  { title: "TUE: Final walkthrough of the house — verify repairs + condition before funding", category: "closing", priority: "high", dueDate: "2026-06-16", owner: "both", area: NEW, notes: "Confirm sewer + siding credit items and overall condition match the contract before the wire settles. Bring the inspection list." },
  { title: "TUE: Confirm ALL utilities set to START 6/17 (PGE, NW Natural, Water, Internet)", category: "utilities", priority: "critical", dueDate: "2026-06-16", owner: "you", area: NEW, notes: "Internet install slot is the gate for the whole smart-home stack — confirm earliest 6/17–18 window. Verify each account's start date = close date." },
  { title: "TUE 7–9pm: Pack Zone 2 — kitchen non-essentials + bathroom extras", category: "move", priority: "normal", dueDate: "2026-06-16", owner: "both", area: "Packing", notes: "Glassware → dish-pack boxes w/ dividers + paper. Keep 2 plates/mugs/pans + coffee out for the week." },
  { title: "TUE: Sweep unsold items → Buy Nothing group / schedule donation pickup", category: "move", priority: "normal", dueDate: "2026-06-16", owner: "both", area: "Sell/Downsize", notes: "Anything not sold by tonight: list free on Buy Nothing or book a free large-item pickup (Salvation Army / Habitat ReStore). Don't let it become furniture-day weight." },

  // ===== WED 6/17 — CLOSING DAY / KEYS AT 5PM =====
  { title: "WED Daytime: Sign closing docs + confirm wire settled (keys at 5PM)", category: "closing", priority: "critical", dueDate: "2026-06-17", owner: "both", area: NEW, notes: "Possession 5:00 PM. Don't load anything into the car until keys are in hand." },
  { title: "WED 5:00 PM: Take possession — locate water/gas shutoffs + electrical panel", category: "home", priority: "critical", dueDate: "2026-06-17", owner: "both", area: NEW, notes: "First thing in the door. Know these before you need them. Photo the panel labels." },
  { title: "WED 5:30 PM: Install smart locks / re-key all exterior doors", category: "home", priority: "critical", dueDate: "2026-06-17", owner: "you", area: NEW, notes: "Security first — you don't know who has old keys. Smart locks double as the re-key (no locksmith spend). Set Melodi a code." },
  { title: "WED Evening: First 2 car loads of pre-packed boxes → new house", category: "move", priority: "high", dueDate: "2026-06-17", owner: "both", area: NEW, notes: "13-min drive. Load the car you packed Sun–Tue. Stack boxes in the garage by room — keep rooms clear for cleaners." },
  { title: "WED: Set cleaner smart-lock code for Thursday access", category: "home", priority: "high", dueDate: "2026-06-17", owner: "you", area: NEW, notes: "Give the cleaners a temporary lock code so they can deep-clean Thursday while you're at work. Revoke it after." },

  // ===== THU 6/18 — Cleaners deep-clean new house + heavy shuttle =====
  { title: "THU Daytime: Cleaners DEEP-CLEAN empty new house (you're at work)", category: "cleaning", priority: "high", dueDate: "2026-06-18", owner: "both", area: NEW, cost: 400, notes: "Best day — house is empty of furniture so they reach everything. Book by Mon. ~$275–$600 (see cleaner contacts). They enter via smart-lock code." },
  { title: "THU Evening: Car-shuttle run #3–5 — all remaining boxes + fragile items", category: "move", priority: "high", dueDate: "2026-06-18", owner: "both", area: NEW, notes: "Carry fragile/valuable yourself in the car, not on the truck. By tonight only furniture should be left at the apartment." },
  { title: "THU: Stage furniture day — disassemble bed frames, wrap glass, bag + label hardware", category: "move", priority: "normal", dueDate: "2026-06-18", owner: "both", area: OLD, notes: "Ziploc each set of screws, tape to its piece. Shrink-wrap drawers shut. Mattress bags on. Makes Saturday fast." },

  // ===== FRI 6/19 — Finish small stuff + furniture-day prep =====
  { title: "FRI Evening: Final car-shuttle — leave ONLY furniture at the apartment", category: "move", priority: "normal", dueDate: "2026-06-19", owner: "both", area: OLD, notes: "Last box run. Walk every closet/cabinet/drawer so nothing gets left behind." },
  { title: "FRI: Confirm U-Haul reservation + Saturday AM pickup time", category: "move", priority: "high", dueDate: "2026-06-19", owner: "you", area: OLD, notes: "Earliest morning slot to beat the heat. Confirm pads + dolly + furniture sliders are on the reservation." },
  { title: "FRI: Pack the FIRST-NIGHT box — do NOT load it on the truck", category: "move", priority: "high", dueDate: "2026-06-19", owner: "both", area: "Packing", notes: "Chargers, toiletries, meds, important docs, change of clothes, bedding, phone chargers, cat food/litter, coffee, paper towels, TP. Rides in the car." },

  // ===== SAT 6/20 — FURNITURE DAY (U-Haul, cool morning) =====
  { title: "SAT 7:00 AM: Pick up U-Haul + pads/dolly/sliders", category: "move", priority: "critical", dueDate: "2026-06-20", owner: "you", area: OLD, notes: "Early = cool + you get the full day. Gas it up before return to avoid the refuel surcharge." },
  { title: "SAT 8 AM–1 PM: Load + move ALL furniture (beat the heat)", category: "move", priority: "critical", dueDate: "2026-06-20", owner: "both", area: NEW, notes: "Heavy work in the cool hours. Hydrate. Load heaviest/last-needed first. One full load if downsizing worked." },
  { title: "SAT: Move the CAT last — carrier → prepped quiet room (litter, food, water, hideout)", category: "home", priority: "high", dueDate: "2026-06-20", owner: "both", area: NEW, notes: "Set up one closed, quiet room at the new house FIRST, then bring the cat in the carrier once the chaos is over. Let her decompress before opening the room." },
  { title: "SAT Afternoon: Return U-Haul, set up beds + first-night box at new house", category: "home", priority: "normal", dueDate: "2026-06-20", owner: "both", area: NEW, notes: "Reassemble beds before you're exhausted. Sleep in the new house tonight." },

  // ===== SUN 6/21 — Old apartment move-out + deposit protection =====
  { title: "SUN: Old apartment final pass — haul remaining trash + donations", category: "cleaning", priority: "high", dueDate: "2026-06-21", owner: "both", area: OLD, notes: "Empty unit. Last load of toss/donate to the curb or pickup. Check the parking spot + storage + mailbox." },
  { title: "SUN: Deep-clean old apartment (DIY or cleaner) + timestamped photos for deposit", category: "cleaning", priority: "high", dueDate: "2026-06-21", owner: "both", area: OLD, cost: 150, notes: "Empty + clean = max deposit back. Photo every room AFTER cleaning, timestamped. Hire a cleaner here too if you're spent (~$150 1BR)." },
  { title: "SUN: Return keys/fobs/parking passes + move-out walkthrough with landlord", category: "admin", priority: "high", dueDate: "2026-06-21", owner: "you", area: OLD, notes: "Get the walkthrough on the calendar earlier in the week. Hand off keys, confirm deposit return timeline in writing." },
];

// ---- Packing-supply shopping list (Packing area) ----
const NEW_SHOPPING = [
  { item: "Small moving boxes ×20 (books, heavy items)", area: "Packing", estCost: 30, notes: "1.5 cu ft. Heavy stuff goes small so boxes stay liftable." },
  { item: "Medium moving boxes ×25 (general / kitchen)", area: "Packing", estCost: 45, notes: "3.0 cu ft — the workhorse box." },
  { item: "Large moving boxes ×15 (light + bulky: linens, pillows)", area: "Packing", estCost: 35, notes: "4.5 cu ft. Keep these light." },
  { item: "Wardrobe boxes ×4 (hanging clothes)", area: "Packing", estCost: 60, notes: "Clothes go straight from rod to box on the built-in bar." },
  { item: "Dish-pack boxes + cell dividers ×3 (glassware)", area: "Packing", estCost: 45, notes: "Double-wall + dividers for glasses/stemware." },
  { item: "Picture / mirror boxes ×4 (all the wall art)", area: "Packing", estCost: 40, notes: "Telescoping boxes for the art you're taking off the walls." },
  { item: "Packing tape 8-pack + 2 tape guns", area: "Packing", estCost: 35, notes: "You always need more tape than you think. Two guns = two packers." },
  { item: "Bubble wrap — large roll", area: "Packing", estCost: 25, notes: "Electronics, frames, fragile decor." },
  { item: "Packing paper (newsprint) ×2 bundles", area: "Packing", estCost: 30, notes: "Wrap dishes + fill voids. Cleaner than newspaper." },
  { item: "Stretch / shrink wrap (5\" handheld)", area: "Packing", estCost: 18, notes: "Wrap drawers shut, bundle cords, protect upholstery." },
  { item: "Mattress bags ×2", area: "Packing", estCost: 20, notes: "Keep mattresses clean + dry on the truck." },
  { item: "Sharpies ×4 + colored labels / colored tape", area: "Packing", estCost: 15, notes: "Color-code by room — unload goes 3× faster." },
  { item: "Contractor-grade trash bags (heavy, 42gal)", area: "Packing", estCost: 25, notes: "Toss/donate piles + soft items (pillows, clothes)." },
  { item: "Ziploc freezer bags (furniture hardware)", area: "Packing", estCost: 8, notes: "One bag of screws per disassembled piece, taped to it." },
  { item: "Box cutters ×2 + scissors", area: "Packing", estCost: 12, notes: "One per person." },
  { item: "Furniture pads/blankets ×12 + dolly + sliders", area: "Packing", estCost: 0, notes: "RENT with the U-Haul (cheaper than buying). Add to the reservation." },
  { item: "Cleaning kit (all-purpose, gloves, paper towels, Magic Erasers)", area: "Packing", estCost: 35, notes: "For both the new-house wipe-down and the old-apartment deep clean." },
];

// ---- Move-out cleaner options (East Portland / 97220), from live search 6/14 ----
const NEW_CONTACTS = [
  { name: "Neat Hive Cleaning", role: "Move-out cleaner (option A)", phone: "(971) 228-2646", email: "", notes: "Portland move-out specialist. ~$275 studio → $600+ larger house (2026). Flat-rate quotes. neathivecleaning.com" },
  { name: "Superb Maids Portland", role: "Move-in/out cleaner (option B)", phone: "", email: "", notes: "Licensed by State of OR + City of Portland, $2M liability, bonded, background-checked. 55-point checklist. superbmaidsportland.com" },
  { name: "Sparkling Palaces", role: "Move-in/out cleaner (option C)", phone: "(503) 505-9130", email: "info@sparklingpalaces.com", notes: "Instant online quote, move in/out + deep clean, 24h re-clean guarantee. sparklingpalaces.com" },
  { name: "ecomaids of Portland", role: "Eco move-out cleaner (option D)", phone: "", email: "", notes: "Eco-friendly move-in/out. Good if you want non-toxic products around the cat. ecomaids.com/portland" },
];

// ---- Budget lines for the move-week spend ----
const NEW_BUDGET = [
  { name: "Packing supplies", planned: 150, notes: "Boxes, tape, wrap, paper, bags, markers, cleaning kit. ~$480 list price but most reused/rented; budget ~$150 net." },
  { name: "Move-out cleaners (new + old)", planned: 600, notes: "New-house deep clean Thu (~$275–$600) + optional old-apartment clean Sun (~$150). Protects the deposit." },
  { name: "U-Haul + pads/dolly (furniture day)", planned: 250, notes: "Local one-day truck + furniture pads + dolly + sliders, Saturday AM." },
];

async function main() {
  const { db } = await import("../src/lib/db");
  const { tasks, shopping, contacts, budgetLines } = await import("../src/lib/db/schema");

  const existingTasks = new Set(
    (await db.select({ title: tasks.title }).from(tasks)).map((r) => r.title),
  );
  const existingShopping = new Set(
    (await db.select({ item: shopping.item }).from(shopping)).map((r) => r.item),
  );
  const existingContacts = new Set(
    (await db.select({ name: contacts.name }).from(contacts)).map((r) => r.name),
  );
  const existingBudget = new Set(
    (await db.select({ name: budgetLines.name }).from(budgetLines)).map((r) => r.name),
  );

  const taskRows = NEW_TASKS.filter((t) => !existingTasks.has(t.title));
  const shoppingRows = NEW_SHOPPING.filter((s) => !existingShopping.has(s.item));
  const contactRows = NEW_CONTACTS.filter((c) => !existingContacts.has(c.name));
  const budgetRows = NEW_BUDGET.filter((b) => !existingBudget.has(b.name));

  if (taskRows.length) {
    const base = existingTasks.size;
    await db.insert(tasks).values(
      taskRows.map((t, i) => ({ ...t, status: "todo", sortOrder: base + i })) as never,
    );
  }
  if (shoppingRows.length) await db.insert(shopping).values(shoppingRows as never);
  if (contactRows.length) await db.insert(contacts).values(contactRows as never);
  if (budgetRows.length) await db.insert(budgetLines).values(budgetRows as never);

  console.log(
    `✅ Move-week import:\n` +
      `   tasks:    ${taskRows.length} new (skipped ${NEW_TASKS.length - taskRows.length} dupes)\n` +
      `   shopping: ${shoppingRows.length} new (skipped ${NEW_SHOPPING.length - shoppingRows.length})\n` +
      `   contacts: ${contactRows.length} new (skipped ${NEW_CONTACTS.length - contactRows.length})\n` +
      `   budget:   ${budgetRows.length} new (skipped ${NEW_BUDGET.length - budgetRows.length})`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
