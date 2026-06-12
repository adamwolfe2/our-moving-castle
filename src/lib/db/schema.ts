// Drizzle schema for the Our Moving Castle move-in CRM.
// One household, one move. Tables stay flat and practical.

import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

// enums live in constants.ts (client-safe). Re-export for convenience.
export {
  TASK_CATEGORIES,
  OWNERS,
  STATUSES,
  PRIORITIES,
  PAYMENT_KINDS,
} from "@/lib/constants";
export type {
  TaskCategory,
  Owner,
  Status,
  Priority,
  PaymentKind,
} from "@/lib/constants";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().default("home"),
  owner: text("owner").notNull().default("both"),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("normal"),
  dueDate: date("due_date"),
  area: text("area"), // room/zone, used by cleaning + home setup
  cost: integer("cost"), // whole dollars, optional
  link: text("link"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  amount: integer("amount").notNull().default(0), // whole dollars
  kind: text("kind").notNull().default("upcoming"),
  dueDate: date("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const shopping = pgTable("shopping", {
  id: serial("id").primaryKey(),
  item: text("item").notNull(),
  area: text("area"),
  estCost: integer("est_cost"),
  bought: boolean("bought").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dailyLog = pgTable("daily_log", {
  id: serial("id").primaryKey(),
  logDate: date("log_date").notNull(),
  mood: text("mood"),
  wins: text("wins"),
  blockers: text("blockers"),
  entry: text("entry"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const budgetLines = pgTable("budget_lines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  planned: integer("planned").notNull().default(0),
  actual: integer("actual").notNull().default(0),
  source: text("source").notNull().default("manual"), // manual | shopping | marketplace
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const marketplace = pgTable("marketplace", {
  id: serial("id").primaryKey(),
  item: text("item").notNull(),
  targetPrice: integer("target_price"),
  status: text("status").notNull().default("wishlist"),
  url: text("url"),
  imageUrl: text("image_url"),
  location: text("location"),
  seller: text("seller"),
  isoPost: text("iso_post"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("other"),
  url: text("url").notNull(),
  pathname: text("pathname"),
  size: integer("size"),
  contentType: text("content_type"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type ShoppingItem = typeof shopping.$inferSelect;
export type DailyLog = typeof dailyLog.$inferSelect;
