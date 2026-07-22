import { db } from "@/lib/db";
import { maintenanceLog } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(maintenanceLog)
      .orderBy(desc(maintenanceLog.doneDate), desc(maintenanceLog.id))
      .limit(200);
    return NextResponse.json(rows);
  } catch (e) {
    console.error("[maintenance-log:list]", e);
    return NextResponse.json(
      { error: "Database error. Is DATABASE_URL set?" },
      { status: 500 },
    );
  }
}
