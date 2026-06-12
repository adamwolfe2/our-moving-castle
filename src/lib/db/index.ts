// Neon HTTP + Drizzle client. Works in serverless route handlers.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  // Fail loud at import in dev; in prod the route will surface a clear 500.
  console.warn("[db] DATABASE_URL is not set — DB calls will fail.");
}

const sql = neon(url ?? "postgres://invalid");
export const db = drizzle(sql, { schema });
export { schema };
