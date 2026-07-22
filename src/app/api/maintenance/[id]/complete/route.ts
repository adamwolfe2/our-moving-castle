// Mark a maintenance task complete: sets lastDone, recomputes nextDue from the
// interval, and writes a completion-log row (cost/vendor optional) atomically-ish.
import { db } from "@/lib/db";
import { maintenanceLog, maintenanceTasks } from "@/lib/db/schema";
import { maintenanceComplete } from "@/lib/validation";
import { todayISO } from "@/lib/format";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function addMonthsISO(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const day = Math.min(d, lastDay);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine — complete with defaults
  }
  const parsed = maintenanceComplete.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }
  const doneDate = parsed.data.doneDate ?? todayISO();

  try {
    const [task] = await db
      .select()
      .from(maintenanceTasks)
      .where(eq(maintenanceTasks.id, numId));
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const nextDue = addMonthsISO(doneDate, task.intervalMonths);
    const [updated] = await db
      .update(maintenanceTasks)
      .set({ lastDone: doneDate, nextDue, updatedAt: new Date() })
      .where(eq(maintenanceTasks.id, numId))
      .returning();

    const [logRow] = await db
      .insert(maintenanceLog)
      .values({
        taskId: numId,
        taskName: task.task,
        doneDate,
        cost: parsed.data.cost ?? null,
        vendor: parsed.data.vendor ?? null,
        notes: parsed.data.notes ?? null,
      })
      .returning();

    return NextResponse.json({ task: updated, log: logRow });
  } catch (e) {
    console.error("[maintenance:complete]", e);
    return NextResponse.json(
      { error: "Could not complete task." },
      { status: 500 },
    );
  }
}
