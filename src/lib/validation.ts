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

export const documentCreate = z.object({
  name: z.string().trim().min(1).max(400),
  category: z
    .enum(["inspection", "closing", "insurance", "utilities", "estimates", "receipts", "other"])
    .default("other"),
  url: z.string().url().max(2000),
  pathname: nullableStr,
  size: z.number().int().nonnegative().optional().nullable(),
  contentType: nullableStr,
  notes: nullableStr,
});
export const documentUpdate = z
  .object({
    name: z.string().trim().min(1).max(400),
    category: z.enum([
      "inspection",
      "closing",
      "insurance",
      "utilities",
      "estimates",
      "receipts",
      "other",
    ]),
    notes: nullableStr,
  })
  .partial();

export const maintenanceTaskCreate = z.object({
  task: z.string().trim().min(1).max(300),
  category: z.string().trim().min(1).max(60).default("Interior"),
  area: nullableStr,
  intervalMonths: z.number().int().min(1).max(240).default(12),
  estMinutes: z.number().int().nonnegative().optional().nullable(),
  owner: z.enum(["adam", "mel", "professional"]).default("adam"),
  notes: nullableStr,
  lastDone: nullableDate,
  nextDue: nullableDate,
  active: z.boolean().default(true),
  sortOrder: z.number().int().optional(),
});
export const maintenanceTaskUpdate = maintenanceTaskCreate.partial();

export const maintenanceComplete = z.object({
  doneDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  cost: z.number().int().nonnegative().optional().nullable(),
  vendor: nullableStr,
  notes: nullableStr,
});

export const homeAccountCreate = z.object({
  provider: z.string().trim().min(1).max(200),
  service: z
    .enum(["gas", "electric", "water", "internet", "garbage", "insurance", "tax", "other"])
    .default("other"),
  billingCycle: z.enum(["monthly", "quarterly", "annual"]).default("monthly"),
  autopay: z.boolean().default(false),
  dueDay: nullableStr,
  estMonthly: z.number().int().nonnegative().optional().nullable(),
  accountRef: nullableStr,
  portalUrl: nullableStr,
  notes: nullableStr,
  sortOrder: z.number().int().optional(),
});
export const homeAccountUpdate = homeAccountCreate.partial();

export const homeBillCreate = z.object({
  accountId: z.number().int().optional().nullable(),
  period: z.string().trim().regex(/^\d{4}-\d{2}$/),
  amount: z.number().int().default(0),
  dueDate: nullableDate,
  status: z.enum(["pending", "paid"]).default("pending"),
  notes: nullableStr,
});
export const homeBillUpdate = homeBillCreate.partial();

export const dailyLogCreate = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: nullableStr,
  wins: nullableStr,
  blockers: nullableStr,
  entry: nullableStr,
});
export const dailyLogUpdate = dailyLogCreate.partial();
