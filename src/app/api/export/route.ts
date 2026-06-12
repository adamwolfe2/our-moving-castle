// Full JSON snapshot of the move state. Auth-gated by middleware.
// Paste/share this with Claude for a daily re-plan.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, payments, contacts, shopping, dailyLog } from "@/lib/db/schema";
import { MOVE } from "@/lib/move-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [t, p, c, s, d] = await Promise.all([
      db.select().from(tasks),
      db.select().from(payments),
      db.select().from(contacts),
      db.select().from(shopping),
      db.select().from(dailyLog),
    ]);
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      move: MOVE,
      counts: {
        tasks: t.length,
        tasksDone: t.filter((x) => x.status === "done").length,
        payments: p.length,
        contacts: c.length,
        shopping: s.length,
        shoppingBought: s.filter((x) => x.bought).length,
      },
      tasks: t,
      payments: p,
      contacts: c,
      shopping: s,
      dailyLog: d,
    });
  } catch (e) {
    console.error("[export]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
