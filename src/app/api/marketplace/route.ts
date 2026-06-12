import { collection, asc } from "@/lib/crud";
import { marketplace } from "@/lib/db/schema";
import { marketplaceCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(marketplace, marketplaceCreate, (t) => [
  asc(t.sortOrder),
  asc(t.id),
]);
