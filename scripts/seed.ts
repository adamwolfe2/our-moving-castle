/**
 * Seed the move-in CRM with the real Cadet Ave data.
 * Idempotent: wipes the 5 tables then re-inserts. Run: pnpm db:seed
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });
import {
  tasks,
  payments,
  contacts,
  shopping,
  dailyLog,
  budgetLines,
  marketplace,
  type NewTask,
} from "../src/lib/db/schema";

// Imported lazily inside main() so dotenv runs before the db client reads env.

type T = Omit<NewTask, "id" | "createdAt" | "updatedAt">;
const t = (title: string, o: Partial<T> = {}): T => ({
  title,
  category: "home",
  owner: "both",
  status: "todo",
  priority: "normal",
  ...o,
});

const TASKS: T[] = [
  // ---- Already done (reflect reality, baseline June 11) ----
  t("Mutual acceptance — executed contract + summary in one place", { category: "closing", priority: "high", status: "done", dueDate: "2026-06-01" }),
  t("Home inspection completed", { category: "closing", status: "done", dueDate: "2026-06-02" }),
  t("Earnest deposit wired ($15,000)", { category: "closing", status: "done", dueDate: "2026-06-04" }),

  // ---- THIS WEEK — critical path (has queues) ----
  t("Schedule internet install for June 17–18", { category: "utilities", owner: "you", priority: "critical", dueDate: "2026-06-12", notes: "Ziply / CenturyLink fiber, or Comcast. Biggest risk — you work from home." }),
  t("Start utility transfers effective June 17", { category: "utilities", priority: "critical", dueDate: "2026-06-12", notes: "PGE, NW Natural, Portland Water/Sewer, trash." }),
  t("Book movers or truck", { category: "move", priority: "critical", dueDate: "2026-06-12", notes: "June is peak season in Portland — availability is the constraint." }),
  t("Bind home insurance — active June 17", { category: "closing", priority: "critical", dueDate: "2026-06-15", cost: 3745, notes: "Bill Nelson, Moreland. Active June 17, not just the $3,745 quote." }),
  t("Call Jenny McGuire (503-654-7770) — verbally confirm wire instructions", { category: "closing", priority: "critical", dueDate: "2026-06-13", notes: "Never trust wiring changes sent by email." }),
  t("Book the sewer contractor (jet + spot repair) before move-in", { category: "repairs", priority: "critical", dueDate: "2026-06-13" }),
  t("Set USPS mail forwarding to start June 17", { category: "admin", priority: "high", dueDate: "2026-06-14" }),

  // ---- Payment transfer checklist ----
  t("PGE (electric): open account eff June 17, enable autopay", { category: "utilities", priority: "high", dueDate: "2026-06-15", link: "https://portlandgeneral.com" }),
  t("NW Natural (gas): open account eff June 17, enable autopay", { category: "utilities", priority: "high", dueDate: "2026-06-15", link: "https://nwnatural.com" }),
  t("Portland Water Bureau: set up account, enable autopay", { category: "utilities", priority: "high", dueDate: "2026-06-15", link: "https://portland.gov", notes: "Billed quarterly (~$420 lump, not monthly)." }),
  t("Trash / recycling: find assigned NE Portland hauler, set up + autopay", { category: "utilities", priority: "normal", dueDate: "2026-06-16", link: "https://portland.gov/bps/garbage-recycling" }),
  t("Multnomah County tax: create online account + paperless billing", { category: "money", priority: "normal", dueDate: "2026-06-30", link: "https://multco.us", notes: "Reminder early Nov 2026. Pay in full Nov 16 for ~3% discount (~$390)." }),
  t("Open House Holding account, set ~$1,400/mo auto-transfer", { category: "money", priority: "high", dueDate: "2026-06-20", notes: "Tax + insurance accruals. Keeps November from being a cliff." }),
  t("Old place: final rent, close/transfer old utilities, request deposit return", { category: "admin", priority: "normal", dueDate: "2026-06-25", area: "Old — 16533 NE Halsey" }),

  // ---- Closing day mechanics ----
  t("Final walkthrough with Mikal before close", { category: "closing", priority: "high", dueDate: "2026-06-16", notes: "Note any new condition issues." }),
  t("Wire balance to close ($760,000)", { category: "closing", priority: "critical", dueDate: "2026-06-16", notes: "Re-verify wire instructions by phone first." }),
  t("Close + possession + keys (5:00 PM)", { category: "closing", priority: "critical", dueDate: "2026-06-17" }),
  t("Movers on site", { category: "move", priority: "high", dueDate: "2026-06-18" }),

  // ---- Repairs & contractor punch list (cash credit = ours now) ----
  t("Sewer — jet the line", { category: "repairs", priority: "critical", dueDate: "2026-06-15", notes: "Root intrusion blocked the camera past ~57 ft." }),
  t("Sewer — spot-repair the joint", { category: "repairs", priority: "critical", dueDate: "2026-06-16" }),
  t("Sewer — re-scope to confirm it's clear", { category: "repairs", priority: "high", dueDate: "2026-06-19" }),
  t("Siding rot + active water intrusion — book Tassie now", { category: "repairs", priority: "critical", dueDate: "2026-06-15", notes: "Rot on all four sides + water entering at porch cover = envelope failure. Worse every rain. Prioritize active-intrusion points." }),
  t("Electrical panel — fix double-lug, add GFCI, screws, relabel", { category: "repairs", priority: "critical", dueDate: "2026-06-18", notes: "FIRE HAZARD. Licensed electrician. Inspector flagged labels as wrong." }),
  t("Cat closet moisture — investigate active source", { category: "repairs", priority: "high", dueDate: "2026-06-18", notes: "Possible supply line behind wall. Fix before subfloor replacement. Do NOT use as cat's day-1 room." }),
  t("Foundation — seal cracks + regrade north slope", { category: "repairs", priority: "normal", dueDate: "2026-06-30", notes: "Engineer's monitor-and-seal guidance. Re-check cracks in 6–12 months." }),
  t("Radon — chase the 48-hour test result", { category: "repairs", priority: "high", dueDate: "2026-06-14", notes: "If elevated, budget mitigation ($1.5K–$3K) and book it." }),

  // ---- Day 1: first hour (safety) ----
  t("Locate & tag the water main", { category: "home", priority: "critical", dueDate: "2026-06-17", notes: "Leaking main shutoff valve needs replacing." }),
  t("Locate & tag the gas shutoff", { category: "home", priority: "critical", dueDate: "2026-06-17" }),
  t("Locate & tag the electrical panel — make sure Melodi knows", { category: "home", priority: "critical", dueDate: "2026-06-17" }),
  t("Clean the dryer vent before the first load", { category: "home", priority: "critical", dueDate: "2026-06-17", notes: "Heavily clogged — #1 fire cause." }),
  t("Test smoke / CO detectors, replace batteries", { category: "home", priority: "high", dueDate: "2026-06-17" }),
  t("Set a fire extinguisher in the kitchen", { category: "home", priority: "high", dueDate: "2026-06-17" }),

  // ---- Day 1: first day ----
  t("Strap the water heater (seismic code)", { category: "home", priority: "high", dueDate: "2026-06-17", notes: "Cheap, fast." }),
  t("Set up the cat's safe room", { category: "home", owner: "both", priority: "high", dueDate: "2026-06-17", notes: "Quiet, closed, food/water/litter. NOT the moisture closet." }),
  t("Unpack the first-night box", { category: "move", priority: "high", dueDate: "2026-06-17", notes: "Bedding, toiletries, chargers, coffee, basic tools." }),
  t("Rekey or replace exterior locks", { category: "home", priority: "high", dueDate: "2026-06-17", cost: 150 }),
  t("Locate and change HVAC filters", { category: "home", priority: "normal", dueDate: "2026-06-17" }),

  // ---- First week ----
  t("Transfer the Nest thermostat out of seller's account", { category: "home", priority: "normal", dueDate: "2026-06-19" }),
  t("Decide on security cameras / alarm and schedule install", { category: "home", priority: "normal", dueDate: "2026-06-21" }),
  t("Test every outlet with the outlet tester", { category: "home", priority: "normal", dueDate: "2026-06-22" }),
  t("Walk the property and note anything new", { category: "home", priority: "normal", dueDate: "2026-06-22" }),
  t("Find the breaker for each room and label it", { category: "home", priority: "normal", dueDate: "2026-06-23" }),

  // ---- Move logistics ----
  t("Collect packing supplies & boxes", { category: "move", priority: "high", dueDate: "2026-06-13", cost: 150 }),
  t("Pack — kitchen", { category: "move", dueDate: "2026-06-14", area: "Kitchen" }),
  t("Pack — bedroom + closets", { category: "move", dueDate: "2026-06-15", area: "Bedroom" }),
  t("Pack — living room + office", { category: "move", dueDate: "2026-06-15", area: "Living / Office" }),
  t("Pack — bathroom + misc", { category: "move", dueDate: "2026-06-16", area: "Bathroom" }),

  // ---- Cleaning (category=cleaning) ----
  t("Deep clean kitchen — cabinets, counters, appliances", { category: "cleaning", dueDate: "2026-06-17", area: "New — Kitchen" }),
  t("Scrub both bathrooms — toilets, tubs, tile", { category: "cleaning", dueDate: "2026-06-17", area: "New — Bathrooms" }),
  t("Clean all floors — shop vac + mop", { category: "cleaning", dueDate: "2026-06-17", area: "New — Whole house" }),
  t("Wipe walls, baseboards, doors", { category: "cleaning", dueDate: "2026-06-18", area: "New — Whole house" }),
  t("Clean inside fridge / freezer", { category: "cleaning", dueDate: "2026-06-17", area: "New — Kitchen" }),
  t("Wash windows + sills", { category: "cleaning", dueDate: "2026-06-19", area: "New — Whole house" }),
  t("Mold / mildew treat damp areas", { category: "cleaning", priority: "high", dueDate: "2026-06-18", area: "New — Basement / damp" }),
  t("Final move-out clean of apartment", { category: "cleaning", dueDate: "2026-06-20", area: "Old — 16533 NE Halsey" }),
  t("Patch nail holes + touch-up paint (old place)", { category: "cleaning", dueDate: "2026-06-20", area: "Old — 16533 NE Halsey" }),
  t("Carpet clean / vacuum (old place, for deposit)", { category: "cleaning", dueDate: "2026-06-21", area: "Old — 16533 NE Halsey" }),
  t("Return old place keys + photo everything for deposit", { category: "admin", dueDate: "2026-06-21", area: "Old — 16533 NE Halsey" }),

  // ---- Move Logistics & Lead-Time (Notion) ----
  t("Confirm internet install window in writing", { category: "utilities", owner: "you", priority: "high", dueDate: "2026-06-13" }),
  t("Set up hotspot / phone-plan backup for week one", { category: "utilities", owner: "you", priority: "high", dueDate: "2026-06-15", notes: "Do this regardless of fiber — you work from home." }),
  t("Test work access once internet is live (AIMS, Cursive, LeaseStack, MA)", { category: "utilities", owner: "you", priority: "high", dueDate: "2026-06-18" }),
  t("Confirm all utilities are in your name as of closing day", { category: "utilities", priority: "high", dueDate: "2026-06-17" }),
  t("Get 2–3 mover quotes (short haul from 16533 NE Halsey)", { category: "move", priority: "high", dueDate: "2026-06-12" }),
  t("Confirm mover date, arrival window, payment method", { category: "move", priority: "normal", dueDate: "2026-06-13" }),
  t("Reserve elevator / parking at the apartment for move-out", { category: "move", priority: "normal", dueDate: "2026-06-16", area: "Old — 16533 NE Halsey" }),
  t("Give notice / confirm move-out date with current landlord", { category: "admin", priority: "high", dueDate: "2026-06-12", area: "Old — 16533 NE Halsey" }),

  // ---- Money & Closing Protection (Notion) — six figures can vanish here ----
  t("Confirm owner's title insurance is in the closing (with Jenny)", { category: "closing", priority: "critical", dueDate: "2026-06-13", notes: "Cash buyer = nobody forces this. Your only protection vs liens or a bad deed." }),
  t("Re-verify account + routing numbers by phone the day you wire", { category: "closing", priority: "critical", dueDate: "2026-06-16" }),
  t("Keep written confirmation of the wire-verification call", { category: "closing", priority: "high", dueDate: "2026-06-16" }),
  t("Verify all credited items are accounted for at walkthrough", { category: "closing", priority: "high", dueDate: "2026-06-16" }),
  t("Test major systems at walkthrough (HVAC, water, electrical)", { category: "closing", priority: "high", dueDate: "2026-06-16" }),
  t("Bring ID + required documents to closing", { category: "closing", priority: "high", dueDate: "2026-06-17" }),
  t("Confirm funds cleared / wire received", { category: "closing", priority: "critical", dueDate: "2026-06-17" }),
  t("Collect all keys, garage remotes, mailbox keys, and codes", { category: "closing", priority: "high", dueDate: "2026-06-17" }),
  t("Photo + video every room and every defect", { category: "home", priority: "high", dueDate: "2026-06-17", notes: "Insurance baseline + cost-basis record." }),
  t("Get a home warranty quote + decide", { category: "money", priority: "normal", dueDate: "2026-06-13", notes: "Cheap insurance given the deferred repairs you took the credit on." }),
  t("Bundle home + auto with Bill Nelson; update auto garaging address", { category: "money", priority: "normal", dueDate: "2026-06-15", notes: "Usually drops both rates." }),

  // ---- Address & Identity Changes (Notion) ----
  t("Change address — banks", { category: "admin", dueDate: "2026-06-22" }),
  t("Change address — Amex + other credit cards", { category: "admin", dueDate: "2026-06-22" }),
  t("Change address — Mercury (business banking)", { category: "admin", dueDate: "2026-06-22" }),
  t("Change address — LLCs / business registrations", { category: "admin", dueDate: "2026-06-24" }),
  t("Oregon DMV / driver license address", { category: "admin", dueDate: "2026-06-24" }),
  t("Update voter registration", { category: "admin", dueDate: "2026-06-24" }),
  t("Employer payroll address (MA)", { category: "admin", owner: "you", dueDate: "2026-06-22" }),
  t("Subscriptions + recurring deliveries address", { category: "admin", dueDate: "2026-06-25" }),
  t("Amazon + online retailer default addresses", { category: "admin", dueDate: "2026-06-25" }),
  t("Insurance, medical, and dental records address", { category: "admin", dueDate: "2026-06-25" }),
];

const PAYMENTS = [
  { label: "Earnest deposit (wired)", amount: 15000, kind: "paid", dueDate: "2026-06-04" },
  { label: "Home inspection", amount: 900, kind: "paid", dueDate: "2026-06-02" },
  { label: "Balance due at closing", amount: 760000, kind: "due", dueDate: "2026-06-16", notes: "Wire — verify instructions by phone." },
  { label: "Closing costs (escrow / title / recording)", amount: 2500, kind: "due", dueDate: "2026-06-17" },
  { label: "Home insurance annual premium", amount: 3745, kind: "due", dueDate: "2026-06-17", notes: "Due at bind. Bill Nelson, Moreland. Renewal May 2027." },
  { label: "Sewer repair (jet + spot)", amount: 3000, kind: "planned", dueDate: "2026-06-16", notes: "Funded by the cash credit you took." },
  { label: "Movers", amount: 1200, kind: "upcoming", dueDate: "2026-06-18" },
  { label: "Packing supplies", amount: 150, kind: "upcoming", dueDate: "2026-06-13" },
  { label: "Re-key / locks", amount: 150, kind: "upcoming", dueDate: "2026-06-17" },
  { label: "Deep clean", amount: 250, kind: "upcoming", dueDate: "2026-06-17" },
  { label: "Utility setup / deposits", amount: 300, kind: "upcoming", dueDate: "2026-06-17", notes: "Some waived with autopay or credit check." },
  { label: "New-home essentials (first Home Depot run)", amount: 600, kind: "planned" },
  { label: "Property tax (annual)", amount: 13000, kind: "planned", dueDate: "2026-11-16", notes: "Pay in full for ~3% discount (~$12,610). Do NOT miss November." },
  // Monthly true cost of ownership
  { label: "PGE electric", amount: 140, kind: "monthly", notes: "seasonal swing" },
  { label: "NW Natural gas", amount: 70, kind: "monthly", notes: "higher in winter" },
  { label: "Water / sewer / stormwater", amount: 140, kind: "monthly", notes: "billed quarterly (~$420/qtr)" },
  { label: "Trash / recycling", amount: 50, kind: "monthly" },
  { label: "Internet", amount: 75, kind: "monthly" },
  { label: "Property tax accrual", amount: 1083, kind: "monthly", notes: "$13K/yr, paid in November" },
  { label: "Insurance accrual", amount: 312, kind: "monthly", notes: "$3,745/yr, paid in June" },
  { label: "Maintenance reserve", amount: 646, kind: "monthly", notes: "1% of $775K/yr — repairs are yours now" },
];

const CONTACTS = [
  { name: "Jenny McGuire", role: "Escrow / Title", phone: "503-654-7770", notes: "VERIFY wire instructions by voice before sending any funds." },
  { name: "Mikal", role: "Buyer's agent", notes: "Final walkthrough, condition issues." },
  { name: "Bill Nelson", role: "Insurance broker — Moreland (Windermere-affiliated)" },
  { name: "Tassie", role: "Siding / water-intrusion contractor" },
  { name: "PGE", role: "Electric utility", notes: "portlandgeneral.com" },
  { name: "NW Natural", role: "Gas utility", notes: "nwnatural.com" },
  { name: "Portland Water Bureau", role: "Water / sewer / stormwater", notes: "portland.gov — billed quarterly" },
  { name: "Multnomah County Tax", role: "Property tax", notes: "multco.us — due Nov 16, pay full for 3% discount" },
];

const S = (item: string, area: string, estCost: number) => ({ item, area, estCost, bought: false });
const SHOPPING = [
  // Buy this weekend — Safety & Day-1
  S("Fire extinguishers", "Buy this weekend", 40), S("CO detectors + smoke batteries", "Buy this weekend", 35),
  S("Flashlights / headlamps", "Buy this weekend", 25), S("First aid kit", "Buy this weekend", 20),
  S("Work gloves, safety glasses, N95 masks", "Buy this weekend", 30), S("Utility knife", "Buy this weekend", 10),
  S("Step ladder", "Buy this weekend", 60), S("Extension cords + surge protectors", "Buy this weekend", 40),
  // Buy this weekend — Cleaning & Reset
  S("Shop vac", "Buy this weekend", 80), S("Broom, dustpan, mop + bucket", "Buy this weekend", 35),
  S("Paper towels, trash bags, contractor bags", "Buy this weekend", 40), S("Sponges / scrub brushes", "Buy this weekend", 12),
  S("All-purpose + mold/mildew cleaner", "Buy this weekend", 20), S("Toilet brush, TP, hand & dish soap", "Buy this weekend", 25),
  // Buy this weekend — This-house specifics
  S("Dryer vent cleaning kit", "This-house specifics", 25), S("Furnace / air filters", "This-house specifics", 30),
  S("Moisture meter", "This-house specifics", 30), S("Non-contact voltage tester + outlet tester", "This-house specifics", 30),
  S("Pipe insulation sleeves (exposed galvanized)", "This-house specifics", 25), S("Weather stripping + door sweeps", "This-house specifics", 35),
  S("Caulk (ext/int, silicone, fire-rated) + gun", "This-house specifics", 45), S("Spackle / drywall patch kit", "This-house specifics", 20),
  // First 30 days
  S("Exterior stain / sealer for cedar", "First 30 days", 120), S("Dehumidifier + DampRid + fans", "First 30 days", 200),
  S("Replacement supply lines, hose clamps, plumber's tape", "First 30 days", 30), S("Drain snake + water pressure gauge", "First 30 days", 40),
  S("Gutter cleaning tools + ladder stabilizer", "First 30 days", 60), S("Gravel / sand / fill dirt (grading)", "First 30 days", 80),
  // Tools to own
  S("Tape measure, hammer, screwdriver set", "Tools to own", 50), S("Drill / driver + bits", "Tools to own", 120),
  S("Stud finder, level, pliers set", "Tools to own", 45), S("Adjustable wrench, socket set, allen keys", "Tools to own", 60),
  S("Channel locks", "Tools to own", 20), S("Tool bag / organizer", "Tools to own", 35),
  // People forget
  S("New toilet seats", "People forget", 50), S("Shower curtains + liners", "People forget", 35),
  S("Door mats, garbage + recycling cans", "People forget", 60), S("Window coverings", "People forget", 150),
  S("Light bulbs, batteries, command hooks", "People forget", 45), S("First-night box (bedding, toiletries, coffee)", "People forget", 80),
];

const BUDGET_LINES = [
  { name: "Movers", planned: 1200 },
  { name: "Packing supplies", planned: 150 },
  { name: "Re-key / locks", planned: 150 },
  { name: "Deep clean", planned: 250 },
  { name: "Utility setup / deposits", planned: 300 },
  { name: "Sewer repair (jet + spot)", planned: 3000 },
  { name: "Siding & water intrusion (Tassie)", planned: 4000 },
  { name: "Electrical panel fixes", planned: 800 },
  { name: "Radon mitigation (if elevated)", planned: 2500 },
  { name: "Foundation seal + regrade", planned: 1500 },
  { name: "Home warranty", planned: 600 },
  { name: "Home insurance (year 1)", planned: 3745 },
  { name: "Home essentials / Home Depot", planned: 1500, source: "shopping", notes: "Auto-totals live from the Shopping list." },
  { name: "Furniture & secondhand", planned: 3000, source: "marketplace", notes: "Auto-totals live from the Marketplace board." },
  { name: "Contingency buffer", planned: 2000, notes: "Flexible — absorbs surprises. Adjust as real bills land." },
];

const iso = (item: string, price: number) =>
  `ISO: ${item} in good condition, up to $${price}. NE Portland / Cadet area — can pick up, cash ready. Moving in mid-June.`;
const M = (item: string, targetPrice: number) => ({
  item,
  targetPrice,
  status: "wishlist",
  location: "Portland, OR (NE / Cadet)",
  isoPost: iso(item, targetPrice),
});
const MARKETPLACE = [
  M("Couch / sectional sofa", 400),
  M("Dining table + chairs", 250),
  M("Bed frame (queen)", 200),
  M("Dresser", 120),
  M("Nightstands (pair)", 70),
  M("Bookshelf", 60),
  M("Standing / WFH desk", 150),
  M("Area rug", 80),
  M("Patio / outdoor furniture set", 200),
  M("Lawn mower", 150),
];

const DAILY = [
  {
    logDate: "2026-06-11",
    mood: "Locked in",
    wins: "Move-in command center is live. Inspection + earnest done.",
    blockers: "Critical path queues: internet, movers, insurance bind, sewer. Book this week.",
    entry: "6 days to keys. Working the critical path first — anything with a queue we can't recover.",
  },
];

async function main() {
  const { db } = await import("../src/lib/db");
  console.log("Wiping tables…");
  await db.delete(tasks);
  await db.delete(payments);
  await db.delete(contacts);
  await db.delete(shopping);
  await db.delete(budgetLines);
  await db.delete(marketplace);
  await db.delete(dailyLog);

  console.log(`Inserting ${TASKS.length} tasks…`);
  await db.insert(tasks).values(TASKS.map((x, i) => ({ ...x, sortOrder: i })));
  console.log(`Inserting ${PAYMENTS.length} payments…`);
  await db.insert(payments).values(PAYMENTS as never);
  console.log(`Inserting ${CONTACTS.length} contacts…`);
  await db.insert(contacts).values(CONTACTS as never);
  console.log(`Inserting ${SHOPPING.length} shopping items…`);
  await db.insert(shopping).values(SHOPPING as never);
  console.log(`Inserting ${BUDGET_LINES.length} budget lines…`);
  await db.insert(budgetLines).values(BUDGET_LINES.map((x, i) => ({ ...x, sortOrder: i })) as never);
  console.log(`Inserting ${MARKETPLACE.length} marketplace items…`);
  await db.insert(marketplace).values(MARKETPLACE.map((x, i) => ({ ...x, sortOrder: i })) as never);
  console.log(`Inserting ${DAILY.length} daily log…`);
  await db.insert(dailyLog).values(DAILY as never);

  console.log("✅ Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
