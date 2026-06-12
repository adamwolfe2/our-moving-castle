import { collection, asc } from "@/lib/crud";
import { payments } from "@/lib/db/schema";
import { paymentCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(payments, paymentCreate, (t) => [
  asc(t.dueDate),
  asc(t.id),
]);
