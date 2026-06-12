import { item } from "@/lib/crud";
import { shopping } from "@/lib/db/schema";
import { shoppingUpdate } from "@/lib/validation";

export const { PATCH, DELETE } = item(shopping, shoppingUpdate);
