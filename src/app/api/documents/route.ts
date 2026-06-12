import { collection, desc } from "@/lib/crud";
import { documents } from "@/lib/db/schema";
import { documentCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(documents, documentCreate, (t) => [
  desc(t.createdAt),
]);
