import { item } from "@/lib/crud";
import { homeAccounts } from "@/lib/db/schema";
import { homeAccountUpdate } from "@/lib/validation";

export const { PATCH, DELETE } = item(homeAccounts, homeAccountUpdate);
