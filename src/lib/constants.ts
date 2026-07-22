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

export const DOC_CATEGORIES = [
  "inspection",
  "closing",
  "insurance",
  "utilities",
  "estimates",
  "receipts",
  "other",
] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];

export interface DocumentItem {
  id: number;
  name: string;
  category: DocCategory;
  url: string;
  pathname: string | null;
  size: number | null;
  contentType: string | null;
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

// ---- Home OS: maintenance + bills ----

export const MAINT_OWNERS = ["adam", "mel", "professional"] as const;
export type MaintOwner = (typeof MAINT_OWNERS)[number];

export const MAINT_CATEGORIES = [
  "Plumbing", "Kitchen", "Laundry", "Bathroom", "Safety", "HVAC",
  "Appliances", "Pest", "Exterior", "Interior", "Roof", "Foundation",
  "Garage", "Electrical", "Windows", "Doors", "Drainage", "Water",
  "Water Heater", "Sewer", "Irrigation", "Landscaping", "Trees",
  "Smart Home", "Audio/AV", "Pool/Game", "Furniture", "Plants",
  "Air Quality", "Attic/Crawlspace", "Deck/Balcony", "Fireplace",
  "Documentation", "Insurance",
] as const;
export type MaintCategory = (typeof MAINT_CATEGORIES)[number];

export interface MaintenanceTask {
  id: number;
  task: string;
  category: string;
  area: string | null;
  intervalMonths: number;
  estMinutes: number | null;
  owner: MaintOwner;
  notes: string | null;
  lastDone: string | null;
  nextDue: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLogEntry {
  id: number;
  taskId: number | null;
  taskName: string;
  doneDate: string;
  cost: number | null;
  vendor: string | null;
  notes: string | null;
  createdAt: string;
}

export const SERVICE_TYPES = [
  "gas", "electric", "water", "internet", "garbage",
  "insurance", "tax", "other",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const BILLING_CYCLES = ["monthly", "quarterly", "annual"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export interface HomeAccount {
  id: number;
  provider: string;
  service: ServiceType;
  billingCycle: BillingCycle;
  autopay: boolean;
  dueDay: string | null;
  estMonthly: number | null;
  accountRef: string | null;
  portalUrl: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const BILL_STATUSES = ["pending", "paid"] as const;
export type BillStatus = (typeof BILL_STATUSES)[number];

export interface HomeBill {
  id: number;
  accountId: number | null;
  period: string;
  amount: number;
  dueDate: string | null;
  status: BillStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Normalize an account's cost to monthly dollars. */
export function normalizedMonthly(a: {
  billingCycle: string;
  estMonthly: number | null;
}): number {
  return a.estMonthly ?? 0; // estMonthly is stored already normalized to $/mo
}
