import { item } from "@/lib/crud";
import { dailyLog } from "@/lib/db/schema";
import { dailyLogUpdate } from "@/lib/validation";

export const { PATCH, DELETE } = item(dailyLog, dailyLogUpdate);
