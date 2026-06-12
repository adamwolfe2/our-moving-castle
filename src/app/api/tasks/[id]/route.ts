import { item } from "@/lib/crud";
import { tasks } from "@/lib/db/schema";
import { taskUpdate } from "@/lib/validation";

export const { PATCH, DELETE } = item(tasks, taskUpdate);
