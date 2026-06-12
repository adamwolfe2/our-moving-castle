import { collection, asc, desc } from "@/lib/crud";
import { tasks } from "@/lib/db/schema";
import { taskCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(tasks, taskCreate, (t) => [
  asc(t.sortOrder),
  asc(t.dueDate),
  desc(t.priority),
]);
