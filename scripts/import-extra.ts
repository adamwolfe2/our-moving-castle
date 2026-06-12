/**
 * Append-only import of extras from the move CSVs + title-report catches.
 * Idempotent: inserts only tasks/budget lines whose title/name don't already
 * exist. Does NOT wipe anything — safe to run on the live DB. Run: pnpm tsx scripts/import-extra.ts
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

const NEW_TASKS = [
  // ---- Title-report + closing catches (from logistics CSV) ----
  { title: "Confirm Umpqua Bank payoff demand has been ordered by escrow", category: "closing", priority: "critical", dueDate: "2026-06-13", owner: "you", notes: "Seller's 2020 deed of trust ($495,200) must be released at closing (title item 7). Ask Jenny." },
  { title: "Finalize repair-credit negotiation with seller in writing", category: "closing", priority: "critical", dueDate: "2026-06-15", owner: "you", notes: "Inspection-contingency deadline. Lock the sewer jet+spot credit in writing before it passes." },
  { title: "Decide internet: transfer Xfinity vs new fiber", category: "utilities", priority: "critical", dueDate: "2026-06-12", owner: "you", notes: "Check fiber availability at 97220 before defaulting to the apartment Xfinity transfer. Fiber is stronger for the whole-home smart setup. This gates the entire smart-home stack." },
  { title: "Confirm Portland Water billing cutoff / no outstanding balance", category: "utilities", priority: "high", dueDate: "2026-06-13", owner: "you", notes: "Title Note H: no utility-lien search was done. Confirm no outstanding balance and set the cutoff at close. Portland Water Bureau 503-823-7770." },
  { title: "Schedule move-out walkthrough with landlord", category: "admin", priority: "high", dueDate: "2026-06-13", owner: "you", area: "Old — 16533 NE Halsey", notes: "Get it on the calendar before keys to the new place. Deposit depends on it." },

  // ---- Smart-home buildout — Foundation (network is the gate) ----
  { title: "Audit network gear + pick a mesh system", category: "home", priority: "critical", dueDate: "2026-06-12", area: "Smart Home", notes: "Apartment router won't cover a full house with multiple Echo Studios + streaming. Mesh is the gate for everything below." },
  { title: "Buy whole-home mesh wifi (Eero Pro / Orbi)", category: "home", priority: "critical", dueDate: "2026-06-13", cost: 500, area: "Smart Home", notes: "Size node count to square footage. Must be live before any device onboards." },
  { title: "Create shared home@ email + accounts for all smart services", category: "home", priority: "high", dueDate: "2026-06-13", area: "Smart Home", notes: "One home@ inbox you and Melodi both control. Portable, avoids lock-in to a personal account." },
  { title: "Internet live + mesh deployed and tested (walk for dead zones)", category: "home", priority: "critical", dueDate: "2026-06-18", area: "Smart Home", notes: "Walk the house for dead zones before mounting cameras/audio." },

  // ---- Smart-home — Buy (hardware ~$3,350) ----
  { title: "Buy Fire TV 4K Max ×3 (~$180)", category: "home", priority: "high", dueDate: "2026-06-14", cost: 180, area: "Smart Home", notes: "~$60 each. Confirm number of TVs." },
  { title: "Buy Echo Studio ×5 (~$1,000)", category: "home", priority: "high", dueDate: "2026-06-14", cost: 1000, area: "Smart Home", notes: "~$200 each. Confirm room count. Pair two per room for stereo if wanted." },
  { title: "Buy Echo Sub ×3 (~$390)", category: "home", priority: "normal", dueDate: "2026-06-14", cost: 390, area: "Smart Home", notes: "~$130 each. Pairs with Echo Studio for low end." },
  { title: "Buy Nest thermostat (~$130) — CHECK C-WIRE FIRST", category: "home", priority: "high", dueDate: "2026-06-14", cost: 130, area: "Smart Home", notes: "Check HVAC for a C-wire before buying. No C-wire = adapter or it won't hold power. Don't buy blind." },
  { title: "Buy Ring video doorbell (~$100)", category: "home", priority: "high", dueDate: "2026-06-14", cost: 100, area: "Smart Home" },
  { title: "Buy Ring cameras ×4 (~$400)", category: "home", priority: "high", dueDate: "2026-06-14", cost: 400, area: "Smart Home", notes: "Cover entries + driveway. ~$100 each." },
  { title: "Buy Ring Alarm system kit (~$250)", category: "home", priority: "high", dueDate: "2026-06-14", cost: 250, area: "Smart Home", notes: "Keeps alarm in one app with cameras/doorbell." },
  { title: "Buy smart locks ×2, Alexa-compatible (~$400)", category: "home", priority: "high", dueDate: "2026-06-14", cost: 400, area: "Smart Home", notes: "Doubles as your re-key after possession — no separate locksmith spend. ~$200 each." },

  // ---- Smart-home — Setup ----
  { title: "Identify smart fridge make/model + connect to wifi", category: "home", priority: "normal", dueDate: "2026-06-18", area: "Smart Home", notes: "Pull the model number from inside the fridge. Install maker app (Samsung SmartThings / LG ThinQ)." },
  { title: "Onboard all Echo devices to shared account + group by room", category: "home", priority: "high", dueDate: "2026-06-19", area: "Smart Home", notes: "Set up multi-room audio groups and stereo pairs." },
  { title: "Install + configure Nest thermostat", category: "home", priority: "high", dueDate: "2026-06-19", area: "Smart Home", notes: "Verify heating and cooling cycles after install." },
  { title: "Install Ring doorbell + cameras + alarm", category: "home", priority: "high", dueDate: "2026-06-20", area: "Smart Home", notes: "Mount, set motion zones, test notifications." },
  { title: "Install smart locks + set codes", category: "home", priority: "high", dueDate: "2026-06-18", area: "Smart Home", notes: "Give Melodi her own code. Revoke any temp/installer codes." },
  { title: "Connect Fire TV devices + sign into streaming", category: "home", priority: "normal", dueDate: "2026-06-19", area: "Smart Home" },
  { title: "Build automations + test whole-home audio/routines", category: "home", priority: "normal", dueDate: "2026-06-21", area: "Smart Home", notes: "Morning / away / night routines. Confirm everything talks to each other." },
];

const NEW_BUDGET = [
  { name: "Smart home buildout", planned: 3350, notes: "Mesh + Echo/Fire TV + Ring + Nest + smart locks. Smart locks double as the re-key." },
];

async function main() {
  const { db } = await import("../src/lib/db");
  const { tasks, budgetLines } = await import("../src/lib/db/schema");

  const existingTasks = new Set(
    (await db.select({ title: tasks.title }).from(tasks)).map((r) => r.title),
  );
  const existingBudget = new Set(
    (await db.select({ name: budgetLines.name }).from(budgetLines)).map((r) => r.name),
  );

  const taskRows = NEW_TASKS.filter((t) => !existingTasks.has(t.title));
  const budgetRows = NEW_BUDGET.filter((b) => !existingBudget.has(b.name));

  if (taskRows.length) {
    const base = existingTasks.size;
    await db.insert(tasks).values(
      taskRows.map((t, i) => ({ ...t, sortOrder: base + i })) as never,
    );
  }
  if (budgetRows.length) {
    await db.insert(budgetLines).values(budgetRows as never);
  }

  console.log(
    `✅ Imported ${taskRows.length} new tasks (skipped ${NEW_TASKS.length - taskRows.length} dupes), ${budgetRows.length} budget lines.`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
