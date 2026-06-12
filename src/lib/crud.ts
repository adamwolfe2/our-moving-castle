// Tiny generic CRUD factory over a Drizzle pg table with an `id` column.
// One household, already auth-gated by middleware — no per-row ownership.
import { db } from "@/lib/db";
import { asc, desc, eq, type SQL } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import type { ZodTypeAny } from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyTable = any;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function collection(
  table: AnyTable,
  createSchema: ZodTypeAny,
  orderBy: (t: AnyTable) => SQL[] = (t) => [desc(t.createdAt)],
) {
  async function GET() {
    try {
      const rows = await db.select().from(table).orderBy(...orderBy(table));
      return NextResponse.json(rows);
    } catch (e) {
      console.error("[crud:list]", e);
      return bad("Database error. Is DATABASE_URL set?", 500);
    }
  }

  async function POST(req: NextRequest) {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return bad("Invalid JSON body");
    }
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return bad(parsed.error.issues.map((i) => i.message).join(", "));
    }
    try {
      const rows = (await db
        .insert(table)
        .values(parsed.data as any)
        .returning()) as any[];
      return NextResponse.json(rows[0], { status: 201 });
    } catch (e) {
      console.error("[crud:create]", e);
      return bad("Could not create.", 500);
    }
  }

  return { GET, POST };
}

export function item(table: AnyTable, updateSchema: ZodTypeAny) {
  type Ctx = { params: Promise<{ id: string }> };

  async function PATCH(req: NextRequest, ctx: Ctx) {
    const { id } = await ctx.params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) return bad("Bad id");
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return bad("Invalid JSON body");
    }
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return bad(parsed.error.issues.map((i) => i.message).join(", "));
    }
    try {
      const rows = (await db
        .update(table)
        .set({ ...(parsed.data as any), updatedAt: new Date() })
        .where(eq(table.id, numId))
        .returning()) as any[];
      if (!rows[0]) return bad("Not found", 404);
      return NextResponse.json(rows[0]);
    } catch (e) {
      console.error("[crud:update]", e);
      return bad("Could not update.", 500);
    }
  }

  async function DELETE(_req: NextRequest, ctx: Ctx) {
    const { id } = await ctx.params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) return bad("Bad id");
    try {
      const rows = (await db
        .delete(table)
        .where(eq(table.id, numId))
        .returning()) as any[];
      if (!rows[0]) return bad("Not found", 404);
      return NextResponse.json({ ok: true, id: numId });
    } catch (e) {
      console.error("[crud:delete]", e);
      return bad("Could not delete.", 500);
    }
  }

  return { PATCH, DELETE };
}

export { asc, desc };
