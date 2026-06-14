/**
 * Append-only: Portland pool-table-mover contacts (live search 6/14) so the
 * pool-table decision has real numbers to call. Idempotent by name.
 * Run: pnpm tsx scripts/import-pooltable-movers.ts
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

const NEW_CONTACTS = [
  { name: "Portland Pool Table Movers (Nancy Graves)", role: "Pool-table mover (option A)", phone: "214-282-3974", email: "", notes: "Since 1993, BCA member, machinist-level leveling. Disassemble + transport + reassemble + level. Stair charges may apply. Claims lowest local rates. portlandpooltablemovers.com" },
  { name: "Portland Billiard Table Movers (SOLO)", role: "Pool-table mover (option B)", phone: "(971) 544-8194", email: "", notes: "SOLO national network. Full tear-down, transport, install + leveling, reuses your cloth. portlandbilliardtablemovers.com" },
  { name: "Coastline Moving", role: "Pool-table mover (option C)", phone: "(503) 812-1044", email: "coastlinemovingcs@gmail.com", notes: "Hillsboro/Portland, insured (DOT 4150220), free quick quote. Also does general moving — could bundle the furniture day. coastlinemovingco.com" },
];

const NEW_BUDGET = [
  { name: "Pool table move OR sale", planned: 500, notes: "If moving: local pro move $200–$600 (expect ~$400–600 with stairs at the new house + reassembly/leveling). If selling: net positive — list this week. Disposal-only is $150–400 if no buyer and you don't want it." },
];

async function main() {
  const { db } = await import("../src/lib/db");
  const { contacts, budgetLines } = await import("../src/lib/db/schema");

  const existingContacts = new Set(
    (await db.select({ name: contacts.name }).from(contacts)).map((r) => r.name),
  );
  const existingBudget = new Set(
    (await db.select({ name: budgetLines.name }).from(budgetLines)).map((r) => r.name),
  );

  const contactRows = NEW_CONTACTS.filter((c) => !existingContacts.has(c.name));
  const budgetRows = NEW_BUDGET.filter((b) => !existingBudget.has(b.name));

  if (contactRows.length) await db.insert(contacts).values(contactRows as never);
  if (budgetRows.length) await db.insert(budgetLines).values(budgetRows as never);

  console.log(
    `✅ Pool-table movers import: contacts ${contactRows.length} new, budget ${budgetRows.length} new.`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
