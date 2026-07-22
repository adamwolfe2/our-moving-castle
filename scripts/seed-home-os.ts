/**
 * Seed the Home OS: maintenance schedule + utility/bill accounts.
 * Source: Cadet_House_Maintenance_Tracker.xlsx (96 active tasks) + corrections
 * from the APEX inspection (sewer roots, fireplaces, dryer vent, shutoff, panel).
 *
 * Idempotent: wipes maintenance_tasks + home_accounts, re-inserts.
 * Leaves maintenance_log + home_bills untouched (user history).
 *
 * Start dates are STAGGERED so day 1 isn't a 96-task wall: each frequency
 * group spreads across a window of weeks from today.
 *
 * Run: pnpm tsx scripts/seed-home-os.ts
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

// [category, task, area, intervalMonths, estMinutes, owner, notes?]
type Row = [string, string, string, number, number, "adam" | "mel" | "professional", string?];

const MONTHLY: Row[] = [
  ["Plumbing", "Check under sinks and around toilets for leaks", "Whole house", 1, 15, "adam", "Visual inspection; address moisture immediately"],
  ["Plumbing", "Run water and flush toilets in rarely used bathrooms", "Guest bathrooms", 1, 15, "adam", "Prevents dry traps and sewer odors"],
  ["Kitchen", "Clean dishwasher filter and inspect spray arms", "Kitchen", 1, 10, "adam"],
  ["Laundry", "Clean washing-machine detergent drawer and gasket", "Laundry", 1, 10, "adam", "Leave door ajar afterward to dry"],
  ["Laundry", "Inspect washer hoses and connections for bulges or leaks", "Laundry", 1, 10, "adam", "Replace damaged rubber hoses with braided stainless"],
  ["Kitchen", "Clean garbage disposal", "Kitchen", 1, 10, "adam"],
  ["Kitchen", "Clean range hood grease filters", "Kitchen", 1, 20, "adam"],
  ["Safety", "Test smoke and carbon-monoxide alarms", "Whole house", 1, 15, "adam", "Use test button; replace failed units"],
  ["Safety", "Check fire extinguishers are accessible and charged", "Kitchen/garage", 1, 10, "adam", "Needle in green zone"],
  ["HVAC", "Inspect HVAC return grilles and visible vents", "Whole house", 1, 10, "adam"],
  ["HVAC", "Check thermostat operation and batteries", "Whole house", 1, 10, "adam"],
  ["Appliances", "Clean refrigerator water/ice dispenser area", "Kitchen", 1, 10, "adam"],
  ["Appliances", "Inspect refrigerator and freezer temperatures", "Kitchen", 1, 5, "adam", "Target ~37°F fridge / 0°F freezer"],
  ["Pest", "Inspect common ant and pest entry points", "Exterior/interior", 1, 15, "adam", "Doors, windows, plumbing penetrations"],
  ["Exterior", "Walk exterior for new damage, drainage, or vegetation contact", "Exterior", 1, 20, "adam"],
  ["Pool/Game", "Brush and vacuum pool-table felt lightly", "Game room", 1, 15, "adam", "Billiard brush; no household vacuum suction"],
  ["Smart Home", "Check security cameras, doorbells, and smart locks", "Whole house", 1, 15, "adam", "Recording, batteries, alerts, timestamps"],
];

const BIMONTHLY: Row[] = [
  ["HVAC", "Replace or clean HVAC air filter", "HVAC", 2, 15, "adam", "Cat in house — check monthly at first"],
  ["Bathroom", "Deep-clean showerheads and faucet aerators", "Bathrooms/kitchen", 2, 25, "adam", "Descale with vinegar if finish permits"],
  ["Bathroom", "Clean bathroom exhaust-fan covers", "Bathrooms", 2, 20, "adam"],
  ["Laundry", "Run washing-machine cleaning cycle", "Laundry", 2, 10, "adam"],
  ["Kitchen", "Run dishwasher cleaning/descaling cycle", "Kitchen", 2, 10, "adam"],
];

const QUARTERLY: Row[] = [
  ["HVAC", "Clean supply and return vent covers", "Whole house", 3, 30, "adam"],
  ["Appliances", "Vacuum refrigerator condenser coils and vents", "Kitchen", 3, 30, "adam"],
  ["Garage", "Lubricate garage-door rollers, hinges, and springs", "Garage", 3, 20, "adam", "Garage-door lube; not tracks"],
  ["Garage", "Test garage-door auto-reverse and photo eyes", "Garage", 3, 10, "adam"],
  ["Kitchen", "Inspect sink caulk, backsplash grout, and countertop seams", "Kitchen", 3, 15, "adam"],
  ["Bathroom", "Inspect shower, tub, and sink caulk/grout", "Bathrooms", 3, 20, "adam"],
  ["Exterior", "Clean exterior door thresholds and weatherstripping", "Exterior doors", 3, 20, "adam"],
  ["Exterior", "Inspect gutters and downspouts from ground", "Exterior", 3, 15, "adam", "Confirm discharge away from foundation"],
  ["Drainage", "Check floor drains and pour water into dry traps", "Garage/utility", 3, 10, "adam"],
  ["Pest", "Inspect attic, crawlspace, garage, and pantry for pests", "Whole house", 3, 25, "adam"],
  ["Electrical", "Test GFCI and AFCI devices", "Kitchen/baths/garage", 3, 20, "adam"],
  ["Windows", "Clean window tracks and inspect locks", "Whole house", 3, 45, "adam", "Known window-moisture issue — watch for new condensation"],
  ["Doors", "Tighten loose handles, hinges, and cabinet hardware", "Whole house", 3, 30, "adam"],
  ["Smart Home", "Update firmware and verify backups for home devices", "Whole house", 3, 25, "adam", "Router, cameras, HA, locks, hubs"],
  ["Audio/AV", "Inspect speaker, TV, and subwoofer cables", "Media rooms", 3, 15, "adam", "Cat damage, looseness, heat, strain"],
  ["Plants", "Fertilize indoor plants as appropriate", "Whole house", 4, 30, "mel"],
  ["Deck/Balcony", "Inspect deck surface, railings, and fasteners", "Deck", 3, 30, "adam", "Known rot at deck/porch — track spread"],
];

const SEMIANNUAL: Row[] = [
  ["HVAC", "Professional HVAC inspection/service", "HVAC", 6, 60, "professional", "Schedule before peak heating/cooling season"],
  ["Laundry", "Clean dryer exhaust vent and exterior flap", "Laundry/exterior", 6, 60, "adam", "Vent was CLOGGED at move-in (fire risk) — first clean ASAP"],
  ["Kitchen", "Deep-clean oven", "Kitchen", 6, 60, "adam"],
  ["Kitchen", "Clean behind and beneath major appliances", "Kitchen/laundry", 6, 60, "adam"],
  ["Water", "Inspect and operate main water shutoff", "Garage", 6, 15, "adam", "Garage valve is CORRODED — verify operation gently; know location before an emergency"],
  ["Water", "Inspect hose bibs and shutoff valves", "Exterior", 6, 20, "adam", "Leaks + freeze damage"],
  ["Safety", "Review household emergency kit and contacts", "Whole house", 6, 20, "adam", "Water, lights, batteries, first aid, cat supplies"],
  ["Safety", "Inspect fire-escape routes and bedroom egress", "Whole house", 6, 15, "adam"],
  ["Plumbing", "Check toilet tanks, flappers, and supply valves", "Bathrooms", 6, 30, "adam", "Silent leaks and corrosion"],
  ["Plumbing", "Check exposed supply lines and drain connections", "Whole house", 6, 30, "adam", "Galvanized/copper mix — watch for corrosion; low pressure known"],
  ["Interior", "Inspect ceilings and walls for moisture stains or cracks", "Whole house", 6, 30, "adam", "Photograph and track changes; cat-closet moisture known"],
  ["Exterior", "Wash exterior windows and screens", "Exterior", 6, 120, "adam"],
  ["Exterior", "Trim vegetation away from siding, roof, and equipment", "Exterior", 6, 90, "adam"],
  ["Roof", "Inspect roof from ground with binoculars", "Exterior", 6, 20, "adam", "Missing shingles, moss, flashing"],
  ["Foundation", "Inspect foundation and crawlspace vents", "Exterior", 6, 30, "adam"],
  ["Garage", "Inspect garage-door balance and hardware", "Garage", 6, 20, "adam"],
  ["Furniture", "Tighten bed frames, shelving, desks, and mounts", "Whole house", 6, 45, "adam", "Include monitor arms and anti-tip anchors"],
  ["Pool/Game", "Check pool table level, rail bolts, pockets, and cloth", "Game room", 6, 30, "adam"],
  ["Irrigation", "Run each irrigation zone and inspect coverage", "Exterior", 6, 45, "adam"],
  ["Water Heater", "Test temperature-pressure relief valve", "Utility area", 6, 15, "adam"],
  ["Air Quality", "Replace air-purifier filters", "Whole house", 6, 20, "adam"],
];

const ANNUAL: Row[] = [
  ["Safety", "Replace smoke/CO alarm batteries if replaceable", "Whole house", 12, 20, "adam"],
  ["Safety", "Check smoke/CO alarm manufacture dates", "Whole house", 12, 15, "adam", "Replace at end of rated life"],
  ["Water Heater", "Flush water heater / service tankless unit", "Utility area", 12, 90, "professional"],
  ["Water Heater", "Inspect water-heater anode and corrosion", "Utility area", 12, 45, "professional"],
  ["Plumbing", "Professional whole-house plumbing inspection", "Whole house", 12, 60, "professional", "Galvanized/copper mix + low pressure — plan eventual repipe"],
  ["Electrical", "Inspect electrical panel and label circuits accurately", "Panel", 12, 60, "adam", "Panel labels UNRELIABLE per inspection — fix before smart-home electrical work"],
  ["HVAC", "Clean condensate drain and inspect drain pan", "HVAC", 12, 30, "adam"],
  ["HVAC", "Inspect exposed ductwork and insulation", "Attic/crawlspace", 12, 45, "professional"],
  ["Kitchen", "Replace refrigerator water filter", "Kitchen", 12, 10, "adam"],
  ["Kitchen", "Inspect dishwasher supply line and drain hose", "Kitchen", 12, 20, "adam"],
  ["Laundry", "Inspect/replace washer hoses based on condition", "Laundry", 12, 20, "adam"],
  ["Exterior", "Clean gutters and downspouts thoroughly", "Exterior", 12, 120, "adam", "Portland trees — consider 2x/yr"],
  ["Exterior", "Inspect siding, trim, exterior paint, and sealants", "Exterior", 12, 60, "adam", "See siding report — touch up exposed wood promptly"],
  ["Exterior", "Pressure wash hardscape and exterior as appropriate", "Exterior", 12, 180, "adam"],
  ["Roof", "Professional roof inspection", "Roof", 12, 60, "professional"],
  ["Drainage", "Clean catch basins, channel drains, and yard drains", "Exterior", 12, 90, "adam"],
  ["Foundation", "Check grading and soil contact around foundation", "Exterior", 12, 45, "adam"],
  ["Deck/Balcony", "Deep-clean and seal wood deck as needed", "Deck", 12, 180, "adam", "Known rot — reassess extent before sealing"],
  ["Windows", "Inspect window seals, glazing, and exterior caulk", "Whole house", 12, 90, "adam", "Known moisture intrusion at windows — document each year"],
  ["Doors", "Lubricate locks and inspect exterior door seals", "Exterior doors", 12, 30, "adam"],
  ["Pest", "Professional pest inspection", "Whole house", 12, 60, "professional"],
  ["Attic/Crawlspace", "Inspect attic/crawlspace insulation, moisture, pests", "Attic/crawlspace", 12, 60, "professional"],
  ["Irrigation", "Winterize irrigation system", "Exterior", 12, 90, "professional", "Before first freeze"],
  ["Irrigation", "Spring-start irrigation", "Exterior", 12, 90, "adam", "Open slowly; check leaks + programming"],
  ["Landscaping", "Service lawn equipment and sharpen tools", "Garage", 12, 60, "adam"],
  ["Trees", "Inspect large trees and limbs near house", "Exterior", 12, 60, "professional"],
  ["Smart Home", "Audit Wi-Fi coverage, passwords, users, automations", "Whole house", 12, 45, "adam"],
  ["Documentation", "Photograph major systems and update home inventory", "Whole house", 12, 90, "adam", "Serials, receipts, condition"],
  ["Insurance", "Review homeowners coverage and property inventory", "Office", 12, 45, "adam", "Openly policy renews June"],
  // House-specific corrections (tracker had sewer as N/A — WRONG for this house):
  ["Sewer", "Sewer line camera inspection + root treatment", "Main line", 12, 120, "professional", "ROOT INTRUSION ~57ft found at inspection — top priority; get scoped/quoted, then treat annually"],
  ["Fireplace", "Chimney/fireplace inspection — 5 fireplaces, none cleared", "Whole house", 12, 90, "professional", "DO NOT USE any fireplace until professionally cleared"],
];

const MULTI_YEAR: Row[] = [
  ["Water Heater", "Inspect/replace sacrificial anode", "Utility area", 24, 60, "professional"],
  ["Garage", "Professional garage-door service", "Garage", 36, 60, "professional"],
  ["Exterior", "Reseal stone/granite surfaces as needed", "Kitchen/bath/exterior", 48, 180, "adam", "Water-drop test indicates need"],
  ["Plumbing", "Replace washer hoses proactively", "Laundry", 60, 30, "adam"],
  ["Safety", "Replace fire extinguishers or service per label", "Whole house", 60, 30, "adam"],
  ["Roof", "Evaluate roof moss treatment and cleaning need", "Roof", 60, 180, "professional", "Portland moss — condition-based"],
  ["Safety", "Replace sealed smoke/CO alarms at rated end of life", "Whole house", 120, 60, "adam"],
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Stagger next-due dates across a window so day 1 isn't a 96-task wall. */
function stagger(rows: Row[], startOffset: number, endOffset: number): { row: Row; due: string }[] {
  const base = todayISO();
  const span = Math.max(1, endOffset - startOffset);
  return rows.map((row, i) => {
    const off =
      rows.length === 1
        ? startOffset
        : startOffset + Math.round((i * span) / (rows.length - 1));
    return { row, due: addDaysISO(base, off) };
  });
}

async function main() {
  const { db } = await import("../src/lib/db");
  const { maintenanceTasks, homeAccounts } = await import("../src/lib/db/schema");

  const groups = [
    ...stagger(MONTHLY, 5, 18), // spread across weeks 1–3
    ...stagger(BIMONTHLY, 14, 28), // weeks 2–4
    ...stagger(QUARTERLY, 14, 42), // weeks 2–6
    ...stagger(SEMIANNUAL, 21, 56), // weeks 3–8
    ...stagger(ANNUAL, 30, 90), // months 1–3
    ...stagger(MULTI_YEAR, 60, 120), // months 2–4
  ];

  // Urgent overrides: known-issue tasks come due fast regardless of group.
  const urgent: Record<string, number> = {
    "Sewer line camera inspection + root treatment": 10,
    "Clean dryer exhaust vent and exterior flap": 12,
    "Chimney/fireplace inspection — 5 fireplaces, none cleared": 45, // before burn season
    "Inspect and operate main water shutoff": 14,
    "Inspect electrical panel and label circuits accurately": 21,
  };

  const values = groups.map(({ row, due }, i) => {
    const [category, task, area, intervalMonths, estMinutes, owner, notes] = row;
    const overrideDays = urgent[task];
    return {
      task,
      category,
      area,
      intervalMonths,
      estMinutes,
      owner,
      notes: notes ?? null,
      lastDone: null,
      nextDue: overrideDays != null ? addDaysISO(todayISO(), overrideDays) : due,
      active: true,
      sortOrder: i,
    };
  });

  console.log(`Seeding ${values.length} maintenance tasks…`);
  await db.delete(maintenanceTasks);
  // Neon HTTP has payload limits — insert in chunks.
  for (let i = 0; i < values.length; i += 25) {
    await db.insert(maintenanceTasks).values(values.slice(i, i + 25));
  }

  const accounts = [
    { provider: "NW Natural", service: "gas", billingCycle: "monthly", autopay: false, dueDay: "~10th (verify)", estMonthly: 60, accountRef: "vault: cadet-private.md", notes: "Equal Pay available — stay on actual billing first 12 mo to build baseline.", sortOrder: 0 },
    { provider: "Pacific Power", service: "electric", billingCycle: "monthly", autopay: false, dueDay: "verify", estMonthly: 90, accountRef: "vault: cadet-private.md", notes: "TOU/budget plans exist — optimize after smart-home load baseline.", sortOrder: 1 },
    { provider: "Portland Water Bureau", service: "water", billingCycle: "quarterly", autopay: false, dueDay: "quarterly (verify cycle)", estMonthly: 100, accountRef: "vault: cadet-private.md", notes: "Quarterly bill ≈ $300 — autopay strongly recommended; verify cycle on first bill.", sortOrder: 2 },
    { provider: "Xfinity", service: "internet", billingCycle: "monthly", autopay: false, dueDay: "verify", estMonthly: 75, accountRef: "vault: cadet-private.md", notes: "2 Gig. Log promo expiry; renegotiate before the step-up.", sortOrder: 3 },
    { provider: "Heiberg Garbage", service: "garbage", billingCycle: "monthly", autopay: false, dueDay: "verify", estMonthly: 40, accountRef: "unverified", notes: "Hauler + Wednesday pickup UNVERIFIED — confirm for 97220 and get account set up.", sortOrder: 4 },
    { provider: "Homeowners insurance (Openly)", service: "insurance", billingCycle: "annual", autopay: false, dueDay: "June renewal", estMonthly: 312, accountRef: "vault: cadet-private.md", notes: "$3,745/yr. Confirm autopay/renewal terms with agent.", sortOrder: 5 },
    { provider: "Multnomah County property tax", service: "tax", billingCycle: "annual", autopay: false, dueDay: "Nov 15", estMonthly: 1083, accountRef: "tax lot on file", notes: "~$13K/yr est. Pay in full by Nov 16 for ~3% discount. House Holding accrues $1,400/mo.", sortOrder: 6 },
  ];

  console.log(`Seeding ${accounts.length} home accounts…`);
  await db.delete(homeAccounts);
  await db.insert(homeAccounts).values(accounts);

  console.log("Done. Maintenance schedule + bills accounts are live.");
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
