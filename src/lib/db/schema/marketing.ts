import { boolean, date, integer, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { aiGenerations } from "./ai";
import { businesses } from "./business";
import { campaignChannelEnum, campaignSeasonStateEnum, campaignStatusEnum, contentIdeaStatusEnum } from "./enums";

export const campaignSeasons = pgTable("campaign_seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  intent: text("intent"),
  startsAt: date("starts_at", { mode: "string" }),
  endsAt: date("ends_at", { mode: "string" }),
  state: campaignSeasonStateEnum("state").notNull().default("planning"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  seasonId: uuid("season_id").references(() => campaignSeasons.id, { onDelete: "set null" }),
  name: varchar("name", { length: 300 }).notNull(),
  channel: campaignChannelEnum("channel").notNull(),
  status: campaignStatusEnum("status").notNull().default("draft"),
  audienceCount: integer("audience_count").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  resultSummary: text("result_summary"),
  openRate: numeric("open_rate", { precision: 5, scale: 2 }),
  enquiries: integer("enquiries"),
  byMachine: boolean("by_machine").notNull().default(false),
  aiGenerationId: uuid("ai_generation_id").references(() => aiGenerations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentIdeas = pgTable("content_ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 300 }).notNull(),
  why: text("why"),
  aiGenerationId: uuid("ai_generation_id").references(() => aiGenerations.id, { onDelete: "set null" }),
  status: contentIdeaStatusEnum("status").notNull().default("suggested"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
