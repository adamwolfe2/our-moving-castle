import { item } from "@/lib/crud";
import { homeBills } from "@/lib/db/schema";
import { homeBillUpdate } from "@/lib/validation";

export const { PATCH, DELETE } = item(homeBills, homeBillUpdate);
