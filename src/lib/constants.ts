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
