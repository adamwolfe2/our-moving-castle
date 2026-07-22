import { collection, asc } from "@/lib/crud";
import { homeAccounts } from "@/lib/db/schema";
import { homeAccountCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(homeAccounts, homeAccountCreate, (t) => [
  asc(t.sortOrder),
  asc(t.id),
]);
