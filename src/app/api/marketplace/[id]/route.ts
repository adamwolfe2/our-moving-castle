import { item } from "@/lib/crud";
import { marketplace } from "@/lib/db/schema";
import { marketplaceUpdate } from "@/lib/validation";

export const { PATCH, DELETE } = item(marketplace, marketplaceUpdate);
