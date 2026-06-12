import { item } from "@/lib/crud";
import { contacts } from "@/lib/db/schema";
import { contactUpdate } from "@/lib/validation";

export const { PATCH, DELETE } = item(contacts, contactUpdate);
