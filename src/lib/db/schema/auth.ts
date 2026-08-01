import type { AdapterAccountType } from "next-auth/adapters";
import { integer, pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { businessMembers, businesses, users } from "./business";
import { businessMemberRoleEnum } from "./enums";

// Shape and column names below are fixed by @auth/drizzle-adapter's
// DefaultPostgresSchema contract (see node_modules/@auth/drizzle-adapter/
// lib/pg.d.ts) — not designed freely. accounts and verification_tokens are
// unused by the credentials-only Milestone B flow (no OAuth linking, no
// email verification) but must still exist: the adapter's constructor
// requires all four tables regardless of which providers are configured.
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })],
);

// Database session strategy (locked decision 2) — sessions are revocable
// immediately by deleting the row, unlike a JWT that stays valid until it
// expires client-side.
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// Our own invite mechanism (locked decision 3) — separate from
// business_members so pending invitations don't mix with active team
// membership. A row is consumed (acceptedAt set, business_members.userId
// linked) by the accept-invite Server Action.
export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull(),
  role: businessMemberRoleEnum("role").notNull().default("member"),
  token: varchar("token", { length: 255 }).notNull().unique(),
  invitedByMemberId: uuid("invited_by_member_id").references(() => businessMembers.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
