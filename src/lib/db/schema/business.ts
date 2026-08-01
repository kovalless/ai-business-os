import { integer, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businessMemberRoleEnum } from "./enums";

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  trade: varchar("trade", { length: 200 }).notNull(),
  city: varchar("city", { length: 200 }).notNull(),
  foundedYear: integer("founded_year").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  timezone: varchar("timezone", { length: 100 }).notNull().default("Europe/Amsterdam"),
  standingFigureKey: varchar("standing_figure_key", { length: 100 }).notNull().default("cash_on_hand"),
  voiceRules: jsonb("voice_rules").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const businessMembers = pgTable("business_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  // Nullable until the Auth milestone wires real accounts — a member can
  // exist (and be assigned tasks) before they have a user login.
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  role: businessMemberRoleEnum("role").notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
