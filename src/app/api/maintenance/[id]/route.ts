import { item } from "@/lib/crud";
import { maintenanceTasks } from "@/lib/db/schema";
import { maintenanceTaskUpdate } from "@/lib/validation";

export const { PATCH, DELETE } = item(maintenanceTasks, maintenanceTaskUpdate);
