import { collection, asc } from "@/lib/crud";
import { maintenanceTasks } from "@/lib/db/schema";
import { maintenanceTaskCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(maintenanceTasks, maintenanceTaskCreate, (t) => [
  asc(t.nextDue),
  asc(t.id),
]);
