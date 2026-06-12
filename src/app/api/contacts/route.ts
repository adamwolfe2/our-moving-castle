import { collection, asc } from "@/lib/crud";
import { contacts } from "@/lib/db/schema";
import { contactCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(contacts, contactCreate, (t) => [
  asc(t.name),
]);
