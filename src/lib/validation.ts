import { z } from "zod";
import {
  TASK_CATEGORIES,
  OWNERS,
  STATUSES,
  PRIORITIES,
  PAYMENT_KINDS,
} from "@/lib/db/schema";

const nullableStr = z.string().trim().max(2000).optional().nullable();
const nullableDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .nullable();

export const taskCreate = z.object({
  title: z.string().trim().min(1).max(300),
  category: z.enum(TASK_CATEGORIES).default("home"),
  owner: z.enum(OWNERS).default("both"),
  status: z.enum(STATUSES).default("todo"),
  priority: z.enum(PRIORITIES).default("normal"),
  dueDate: nullableDate,
  area: nullableStr,
  cost: z.number().int().nonnegative().optional().nullable(),
  link: nullableStr,
  notes: nullableStr,
  sortOrder: z.number().int().optional(),
});
export const taskUpdate = taskCreate.partial();

export const paymentCreate = z.object({
  label: z.string().trim().min(1).max(300),
  amount: z.number().int().default(0),
  kind: z.enum(PAYMENT_KINDS).default("upcoming"),
  dueDate: nullableDate,
  notes: nullableStr,
});
export const paymentUpdate = paymentCreate.partial();

export const contactCreate = z.object({
  name: z.string().trim().min(1).max(200),
  role: nullableStr,
  phone: nullableStr,
  email: nullableStr,
  notes: nullableStr,
});
export const contactUpdate = contactCreate.partial();

export const shoppingCreate = z.object({
  item: z.string().trim().min(1).max(300),
  area: nullableStr,
  estCost: z.number().int().nonnegative().optional().nullable(),
  bought: z.boolean().default(false),
  notes: nullableStr,
});
export const shoppingUpdate = shoppingCreate.partial();

export const budgetCreate = z.object({
  name: z.string().trim().min(1).max(200),
  planned: z.number().int().default(0),
  actual: z.number().int().default(0),
  source: z.enum(["manual", "shopping", "marketplace"]).default("manual"),
  notes: nullableStr,
  sortOrder: z.number().int().optional(),
});
export const budgetUpdate = budgetCreate.partial();

export const marketplaceCreate = z.object({
  item: z.string().trim().min(1).max(300),
  targetPrice: z.number().int().nonnegative().optional().nullable(),
  status: z
    .enum(["wishlist", "posted", "found", "contacted", "bought"])
    .default("wishlist"),
  url: nullableStr,
  imageUrl: nullableStr,
  location: nullableStr,
  seller: nullableStr,
  isoPost: nullableStr,
  notes: nullableStr,
  sortOrder: z.number().int().optional(),
});
export const marketplaceUpdate = marketplaceCreate.partial();

export const dailyLogCreate = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: nullableStr,
  wins: nullableStr,
  blockers: nullableStr,
  entry: nullableStr,
});
export const dailyLogUpdate = dailyLogCreate.partial();
