import { item } from "@/lib/crud";
import { payments } from "@/lib/db/schema";
import { paymentUpdate } from "@/lib/validation";

export const { PATCH, DELETE } = item(payments, paymentUpdate);
