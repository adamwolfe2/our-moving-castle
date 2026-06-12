import { collection, desc } from "@/lib/crud";
import { dailyLog } from "@/lib/db/schema";
import { dailyLogCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const { GET, POST } = collection(dailyLog, dailyLogCreate, (t) => [
  desc(t.logDate),
]);
