import {
  boolean,
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { aiGenerations } from "./ai";
import { businessMembers, businesses } from "./business";
import { activityDirectionEnum, activityKindEnum, personKindEnum, personStandingEnum } from "./enums";

export const people = pgTable("people", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  contactName: varchar("contact_name", { length: 200 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  kind: personKindEnum("kind").notNull().default("customer"),
  standing: personStandingEnum("standing").notNull().default("new"),
  sinceDate: date("since_date", { mode: "string" }),
  relationshipSummary: text("relationship_summary"),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  // Note: lifetime value, outstanding balance, and last-contact-days are
  // NOT stored columns here. They're derived from invoices/activities at
  // query time (Milestone C concern) so they can't drift from the rows
  // that actually back them, unlike the static numbers in the mock data.
  attentionNote: text("attention_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const personCompanyInfo = pgTable("person_company_info", {
  personId: uuid("person_id")
    .primaryKey()
    .references(() => people.id, { onDelete: "cascade" }),
  address: text("address"),
  vatNumber: varchar("vat_number", { length: 50 }),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  rhythmNote: text("rhythm_note"),
  internalOwnerMemberId: uuid("internal_owner_member_id").references(() => businessMembers.id, {
    onDelete: "set null",
  }),
});

// Unifies the mock data's separate `threads` (ThreadEntry) and
// `conversations` (Conversation) shapes — both were person-scoped,
// time-ordered event logs with overlapping kind vocabularies.
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  personId: uuid("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  kind: activityKindEnum("kind").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  detail: text("detail"),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  direction: activityDirectionEnum("direction"),
  unanswered: boolean("unanswered"),
  byMachine: boolean("by_machine").notNull().default(false),
  aiGenerationId: uuid("ai_generation_id").references(() => aiGenerations.id, { onDelete: "set null" }),
  createdByMemberId: uuid("created_by_member_id").references(() => businessMembers.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
