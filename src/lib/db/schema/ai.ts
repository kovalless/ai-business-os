import { jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businessMembers, businesses } from "./business";
import { aiGenerationKindEnum, aiGenerationStatusEnum, confidenceEnum } from "./enums";

// Every AI-surfaced suggestion — a Proposal, a Today signal or move, a
// content idea — is a row here first. It only becomes a domain fact once
// accepted: see ai_generation_id on activities/tasks/notes/campaigns/
// content_ideas, and Milestone D's accept/dismiss Server Actions.
export const aiGenerations = pgTable("ai_generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  kind: aiGenerationKindEnum("kind").notNull(),
  // Polymorphic pointer to whatever domain row this generation is about
  // (a person, a task, a campaign, ...). Deliberately not a foreign key —
  // Postgres has no native polymorphic FK, and modeling one via a
  // per-type nullable-column set or a generic reference table was judged
  // overengineering for Phase 1. Integrity here is an application-layer
  // concern (locked decision 4).
  targetType: varchar("target_type", { length: 50 }),
  targetId: uuid("target_id"),
  model: varchar("model", { length: 100 }).notNull(),
  outputText: text("output_text"),
  outputJson: jsonb("output_json"),
  confidence: confidenceEnum("confidence").notNull().default("estimated"),
  status: aiGenerationStatusEnum("status").notNull().default("pending"),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  acceptedByMemberId: uuid("accepted_by_member_id").references(() => businessMembers.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
