import { pgEnum } from "drizzle-orm/pg-core";

export const confidenceEnum = pgEnum("confidence", ["known", "estimated", "guessing"]);

export const businessMemberRoleEnum = pgEnum("business_member_role", ["owner", "member"]);

export const personKindEnum = pgEnum("person_kind", ["customer", "supplier", "referrer"]);
export const personStandingEnum = pgEnum("person_standing", [
  "current",
  "over_terms",
  "drifting",
  "new",
]);

export const activityKindEnum = pgEnum("activity_kind", [
  "invoice",
  "email",
  "call",
  "note",
  "job",
  "payment",
  "quote",
  "meeting",
]);
export const activityDirectionEnum = pgEnum("activity_direction", ["in", "out"]);

export const invoiceStatusEnum = pgEnum("invoice_status", ["paid", "open", "over_terms", "draft"]);

export const connectedSourceStatusEnum = pgEnum("connected_source_status", ["connected", "expired"]);

export const taskPriorityEnum = pgEnum("task_priority", ["now", "soon", "whenever"]);

export const calendarCategoryEnum = pgEnum("calendar_category", ["work", "marketing"]);
export const calendarToneEnum = pgEnum("calendar_tone", ["neutral", "machine"]);

export const noteKindEnum = pgEnum("note_kind", ["process", "supplier", "pricing", "decision", "person"]);
export const documentKindEnum = pgEnum("document_kind", ["document", "playbook", "meeting", "process"]);

export const campaignChannelEnum = pgEnum("campaign_channel", ["email", "post", "letter"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["sent", "scheduled", "draft", "proposed"]);
export const campaignSeasonStateEnum = pgEnum("campaign_season_state", ["planning", "running", "closed"]);
export const contentIdeaStatusEnum = pgEnum("content_idea_status", ["suggested", "dismissed", "actioned"]);

export const aiGenerationKindEnum = pgEnum("ai_generation_kind", [
  "proposal",
  "draft",
  "insight",
  "signal",
  "move",
]);
export const aiGenerationStatusEnum = pgEnum("ai_generation_status", [
  "pending",
  "accepted",
  "dismissed",
  "superseded",
]);
