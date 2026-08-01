import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { businesses } from "./business";
import { people } from "./people";
import { confidenceEnum, connectedSourceStatusEnum, invoiceStatusEnum } from "./enums";

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  personId: uuid("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  ref: varchar("ref", { length: 50 }).notNull(),
  issuedAt: date("issued_at", { mode: "string" }),
  dueAt: date("due_at", { mode: "string" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  // Stored to mirror the mock data directly; a query-time computation
  // against dueAt is the more correct long-term shape (Milestone C).
  daysOver: integer("days_over"),
  jobDescription: text("job_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Generalizes the mock data's `standing` + `supporting[]` FigureData
// shapes into one table — any AI-surfaced or computed metric, carrying
// its own provenance receipt inline instead of a separate lookup.
export const figures = pgTable("figures", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 100 }).notNull(),
  label: varchar("label", { length: 200 }).notNull(),
  value: numeric("value", { precision: 14, scale: 2 }).notNull(),
  isCurrency: boolean("is_currency").notNull().default(false),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  periodLabel: varchar("period_label", { length: 100 }).notNull(),
  deltaPct: numeric("delta_pct", { precision: 6, scale: 2 }),
  deltaBasis: varchar("delta_basis", { length: 200 }),
  reading: text("reading"),
  confidence: confidenceEnum("confidence").notNull().default("estimated"),
  receipt: jsonb("receipt").$type<{
    definition: string;
    sources: string[];
    window: string;
    excluded?: string;
    syncedAt: string;
  }>(),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Generalizes cashSeries/revenueSeries/priorYearSeries/hoursBooked/etc.
// Deliberately no currency column here — not every series is money
// (hours, customer counts, margin percentages share this table too).
export const financialSeriesPoints = pgTable("financial_series_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  seriesKey: varchar("series_key", { length: 100 }).notNull(),
  label: varchar("label", { length: 50 }).notNull(),
  periodDate: date("period_date", { mode: "string" }),
  value: numeric("value", { precision: 14, scale: 4 }).notNull(),
  annotation: text("annotation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Phase 1: rows exist so Settings reads real (possibly empty) state
// instead of the hardcoded SOURCES array in the current Settings page.
// No live OAuth sync — that's a later integration milestone.
export const connectedSources = pgTable("connected_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 100 }).notNull(),
  status: connectedSourceStatusEnum("status").notNull().default("connected"),
  detail: varchar("detail", { length: 200 }),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  externalRef: varchar("external_ref", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
