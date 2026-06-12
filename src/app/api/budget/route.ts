import { collection, asc } from "@/lib/crud";
import { budgetLines } from "@/lib/db/schema";
import { budgetCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(budgetLines, budgetCreate, (t) => [
  asc(t.sortOrder),
  asc(t.id),
]);
