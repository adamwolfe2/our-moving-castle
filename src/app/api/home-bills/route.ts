import { collection, desc, asc } from "@/lib/crud";
import { homeBills } from "@/lib/db/schema";
import { homeBillCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(homeBills, homeBillCreate, (t) => [
  desc(t.period),
  asc(t.id),
]);
