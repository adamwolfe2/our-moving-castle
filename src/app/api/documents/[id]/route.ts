import { NextResponse, type NextRequest } from "next/server";
import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { documentUpdate } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const parsed = documentUpdate.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }
  const [row] = await db
    .update(documents)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(documents.id, numId))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const [row] = await db.select().from(documents).where(eq(documents.id, numId));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // best-effort blob delete, then remove the record
  try {
    await del(row.url);
  } catch (e) {
    console.error("[documents:del blob]", e);
  }
  await db.delete(documents).where(eq(documents.id, numId));
  return NextResponse.json({ ok: true, id: numId });
}
