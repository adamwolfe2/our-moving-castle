/**
 * Append-only import from repairs_and_materials_forecast.csv + invoice intel.
 * Idempotent (dedupe by label/title/name). Does NOT wipe. Run: pnpm tsx scripts/import-forecast.ts
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

// Paid / to-confirm invoices (the home-purchase costs already out the door)
const NEW_PAYMENTS = [
  { label: "Siding Solutions inspection + report", amount: 350, kind: "paid", dueDate: "2026-06-10", notes: "Paid 06/10. Invoice #365779378. T1-11 siding N/E sides." },
  { label: "Xavier Environmental oil-tank locate", amount: 125, kind: "paid", dueDate: "2026-06-05", notes: "Invoice 22943. No tank found. No payment confirmation in inbox — VERIFY it cleared." },
];

const NEW_TASKS = [
  // ---- Invoice / closing reconciliation ----
  { title: "Confirm signed addendum price $748,730 (−$26,270 inspection credit)", category: "closing", priority: "high", dueDate: "2026-06-13", owner: "you", notes: "SkySlope envelope Jun 11 2:11 AM. $775,000 − $26,270 = $748,730. Reconcile against the settlement statement." },
  { title: "Verify Xavier oil-tank invoice ($125) actually cleared", category: "admin", priority: "normal", dueDate: "2026-06-13", owner: "you", notes: "Invoice 22943 due 06/05, no confirmation in inbox." },
  { title: "Find / confirm the sewer-scope invoice", category: "admin", priority: "normal", dueDate: "2026-06-13", owner: "you", notes: "No separate scope invoice surfaced — either APEX-bundled or billed elsewhere. Confirm." },

  // ---- Seller-credit levers (track the PDF amounts) ----
  { title: "Get Superior Exterior siding estimate amount (partial re-side)", category: "closing", priority: "high", dueDate: "2026-06-14", owner: "you", notes: "Mikal email 06/10. 2nd opinion: replace over windows on LEFT + portions of BACK, NOT full re-side. Benchmark: full re-side two sides in Hardie $20K-35K; partial less. Pull the PDF amount." },
  { title: "Get Reynolds sewer estimate amount (spot vs lining)", category: "closing", priority: "high", dueDate: "2026-06-14", owner: "you", notes: "Mikal email 06/10. Spot repair $4K-8K; lining/replace past blockage $10K-25K. Strongest credit lever — pull the PDF amount." },
  { title: "Assign wood-stove insert decommission in contract (Oregon SB 102)", category: "closing", priority: "high", dueDate: "2026-06-14", owner: "you", notes: "Remove + destroy 2 uncertified inserts, file DEQ notification. Seller obligation by default ($200-1500 each) unless contract shifts it. Get DEQ confirmation at close. Masonry fireplaces exempt." },

  // ---- DIY repair materials (genuine costs — APEX findings) ----
  { title: "Buy exterior caulk / sealant (window perimeters, trim, penetrations)", category: "repairs", priority: "normal", dueDate: "2026-06-20", cost: 120, area: "DIY materials", notes: "6-12 tubes, ~$60-180. Confirm locations/footage against APEX report." },
  { title: "Buy + install GFCI outlets (kitchen, baths, exterior, garage)", category: "repairs", priority: "high", dueDate: "2026-06-21", cost: 210, area: "DIY materials", notes: "APEX 8.5.1 — 1969 home flagged no GFCI. 6-10 units, ~$120-300. Count against report." },
  { title: "Buy smoke + CO detectors (each bedroom + each level)", category: "repairs", priority: "high", dueDate: "2026-06-17", cost: 225, area: "DIY materials", notes: "8-10 units, ~$150-300. Verify what APEX flagged missing/expired." },
  { title: "Buy downspout extensions + grading fill (negative grading)", category: "repairs", priority: "high", dueDate: "2026-06-22", cost: 165, area: "DIY materials", notes: "APEX 2.6.2. 4-6 extensions + fill, ~$80-250. Cheap fix that protects the foundation; ties to crawlspace moisture." },
  { title: "Buy crawlspace vapor barrier (6-mil poly)", category: "repairs", priority: "normal", dueDate: "2026-06-24", cost: 200, area: "DIY materials", notes: "APEX 4.x — crawlspace moisture/efflorescence. ~1 roll, $100-300. Confirm sq ft from report." },
];

const NEW_BUDGET = [
  { name: "Repairs — DIY materials (APEX findings)", planned: 1100, notes: "Caulk, GFCI, detectors, downspouts/grading, vapor barrier. Midpoint of forecast ranges." },
];

async function main() {
  const { db } = await import("../src/lib/db");
  const { tasks, payments, budgetLines } = await import("../src/lib/db/schema");

  const exTasks = new Set((await db.select({ t: tasks.title }).from(tasks)).map((r) => r.t));
  const exPay = new Set((await db.select({ l: payments.label }).from(payments)).map((r) => r.l));
  const exBud = new Set((await db.select({ n: budgetLines.name }).from(budgetLines)).map((r) => r.n));

  const taskRows = NEW_TASKS.filter((t) => !exTasks.has(t.title));
  const payRows = NEW_PAYMENTS.filter((p) => !exPay.has(p.label));
  const budRows = NEW_BUDGET.filter((b) => !exBud.has(b.name));

  if (taskRows.length) {
    const base = exTasks.size;
    await db.insert(tasks).values(taskRows.map((t, i) => ({ ...t, sortOrder: base + i })) as never);
  }
  if (payRows.length) await db.insert(payments).values(payRows as never);
  if (budRows.length) await db.insert(budgetLines).values(budRows as never);

  console.log(`✅ +${taskRows.length} tasks, +${payRows.length} payments, +${budRows.length} budget lines (dupes skipped).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
