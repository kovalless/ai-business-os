import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { aiGenerations } from "./ai";
import { businessMembers, businesses } from "./business";
import { documentKindEnum, noteKindEnum } from "./enums";

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 300 }).notNull(),
  kind: noteKindEnum("kind").notNull(),
  body: text("body").notNull(),
  usedBy: varchar("used_by", { length: 200 }),
  byMachine: boolean("by_machine").notNull().default(false),
  aiGenerationId: uuid("ai_generation_id").references(() => aiGenerations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 300 }).notNull(),
  kind: documentKindEnum("kind").notNull(),
  ownerMemberId: uuid("owner_member_id").references(() => businessMembers.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Replaces the mock Doc.links: string[] (link targets by title) with
// real foreign keys. A row links a document to either a note or another
// document — "exactly one of the two" is an application-layer rule, not
// a DB constraint, to keep this table simple for Phase 1.
export const documentLinks = pgTable("document_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  linkedNoteId: uuid("linked_note_id").references(() => notes.id, { onDelete: "cascade" }),
  linkedDocumentId: uuid("linked_document_id").references(() => documents.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
