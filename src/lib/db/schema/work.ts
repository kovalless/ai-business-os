import { boolean, date, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { aiGenerations } from "./ai";
import { businessMembers, businesses } from "./business";
import { campaigns } from "./marketing";
import { calendarCategoryEnum, calendarToneEnum, taskPriorityEnum } from "./enums";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 300 }).notNull(),
  detail: text("detail"),
  dueDate: date("due_date", { mode: "string" }),
  // Required to match the mock Task type, where `owner` is a mandatory
  // string. Loosening to nullable ("unassigned") later is a cheap
  // migration; the reverse is not, so faithful-to-mock is the safer
  // default here.
  ownerMemberId: uuid("owner_member_id")
    .notNull()
    .references(() => businessMembers.id, { onDelete: "restrict" }),
  room: varchar("room", { length: 100 }),
  priority: taskPriorityEnum("priority").notNull().default("whenever"),
  done: boolean("done").notNull().default(false),
  proposed: boolean("proposed").notNull().default(false),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  aiGenerationId: uuid("ai_generation_id").references(() => aiGenerations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Unifies the mock data's `upcoming` and `workCalendar` (work) and
// `contentCalendar` (marketing) arrays into one table, distinguished by
// category, instead of three near-identical shapes.
export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  category: calendarCategoryEnum("category").notNull().default("work"),
  title: varchar("title", { length: 300 }).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  who: varchar("who", { length: 200 }),
  whereLocation: varchar("where_location", { length: 200 }),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  tone: calendarToneEnum("tone").notNull().default("neutral"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
