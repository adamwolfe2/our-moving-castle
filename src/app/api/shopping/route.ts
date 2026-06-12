import { collection, asc } from "@/lib/crud";
import { shopping } from "@/lib/db/schema";
import { shoppingCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(shopping, shoppingCreate, (t) => [
  asc(t.area),
  asc(t.id),
]);
