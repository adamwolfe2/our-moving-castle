// Shared enums + client-safe row types. No server deps — safe in client components.

export const TASK_CATEGORIES = [
  "closing",
  "money",
  "move",
  "utilities",
  "home",
  "repairs",
  "cleaning",
  "admin",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const OWNERS = ["you", "partner", "both", "unassigned"] as const;
export type Owner = (typeof OWNERS)[number];

export const STATUSES = ["todo", "doing", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["critical", "high", "normal"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PAYMENT_KINDS = [
  "paid",
  "due",
  "upcoming",
  "planned",
  "monthly",
] as const;
export type PaymentKind = (typeof PAYMENT_KINDS)[number];

// ---- client row types (mirror the DB, all JSON-serialized) ----
export interface Task {
  id: number;
  title: string;
  category: TaskCategory;
  owner: Owner;
  status: Status;
  priority: Priority;
  dueDate: string | null;
  area: string | null;
  cost: number | null;
  link: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  label: string;
  amount: number;
  kind: PaymentKind;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: number;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: number;
  item: string;
  area: string | null;
  estCost: number | null;
  bought: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const BUDGET_SOURCES = ["manual", "shopping", "marketplace"] as const;
export type BudgetSource = (typeof BUDGET_SOURCES)[number];

export interface BudgetLine {
  id: number;
  name: string;
  planned: number;
  actual: number;
  source: BudgetSource;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const MARKETPLACE_STATUSES = [
  "wishlist",
  "posted",
  "found",
  "contacted",
  "bought",
] as const;
export type MarketplaceStatus = (typeof MARKETPLACE_STATUSES)[number];

export interface MarketplaceItem {
  id: number;
  item: string;
  targetPrice: number | null;
  status: MarketplaceStatus;
  url: string | null;
  imageUrl: string | null;
  location: string | null;
  seller: string | null;
  isoPost: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLogEntry {
  id: number;
  logDate: string;
  mood: string | null;
  wins: string | null;
  blockers: string | null;
  entry: string | null;
  createdAt: string;
  updatedAt: string;
}
