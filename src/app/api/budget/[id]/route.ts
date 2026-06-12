import { item } from "@/lib/crud";
import { budgetLines } from "@/lib/db/schema";
import { budgetUpdate } from "@/lib/validation";

export const { PATCH, DELETE } = item(budgetLines, budgetUpdate);
