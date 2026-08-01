CREATE TYPE "public"."activity_direction" AS ENUM('in', 'out');--> statement-breakpoint
CREATE TYPE "public"."activity_kind" AS ENUM('invoice', 'email', 'call', 'note', 'job', 'payment', 'quote', 'meeting');--> statement-breakpoint
CREATE TYPE "public"."ai_generation_kind" AS ENUM('proposal', 'draft', 'insight', 'signal', 'move');--> statement-breakpoint
CREATE TYPE "public"."ai_generation_status" AS ENUM('pending', 'accepted', 'dismissed', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."business_member_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TYPE "public"."calendar_category" AS ENUM('work', 'marketing');--> statement-breakpoint
CREATE TYPE "public"."calendar_tone" AS ENUM('neutral', 'machine');--> statement-breakpoint
CREATE TYPE "public"."campaign_channel" AS ENUM('email', 'post', 'letter');--> statement-breakpoint
CREATE TYPE "public"."campaign_season_state" AS ENUM('planning', 'running', 'closed');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('sent', 'scheduled', 'draft', 'proposed');--> statement-breakpoint
CREATE TYPE "public"."confidence" AS ENUM('known', 'estimated', 'guessing');--> statement-breakpoint
CREATE TYPE "public"."connected_source_status" AS ENUM('connected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."content_idea_status" AS ENUM('suggested', 'dismissed', 'actioned');--> statement-breakpoint
CREATE TYPE "public"."document_kind" AS ENUM('document', 'playbook', 'meeting', 'process');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('paid', 'open', 'over_terms', 'draft');--> statement-breakpoint
CREATE TYPE "public"."note_kind" AS ENUM('process', 'supplier', 'pricing', 'decision', 'person');--> statement-breakpoint
CREATE TYPE "public"."person_kind" AS ENUM('customer', 'supplier', 'referrer');--> statement-breakpoint
CREATE TYPE "public"."person_standing" AS ENUM('current', 'over_terms', 'drifting', 'new');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('now', 'soon', 'whenever');--> statement-breakpoint
CREATE TABLE "business_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid,
	"display_name" varchar(200) NOT NULL,
	"role" "business_member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"trade" varchar(200) NOT NULL,
	"city" varchar(200) NOT NULL,
	"founded_year" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"timezone" varchar(100) DEFAULT 'Europe/Amsterdam' NOT NULL,
	"standing_figure_key" varchar(100) DEFAULT 'cash_on_hand' NOT NULL,
	"voice_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ai_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"kind" "ai_generation_kind" NOT NULL,
	"target_type" varchar(50),
	"target_id" uuid,
	"model" varchar(100) NOT NULL,
	"output_text" text,
	"output_json" jsonb,
	"confidence" "confidence" DEFAULT 'estimated' NOT NULL,
	"status" "ai_generation_status" DEFAULT 'pending' NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_by_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"kind" "activity_kind" NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"title" varchar(300) NOT NULL,
	"detail" text,
	"amount" numeric(12, 2),
	"direction" "activity_direction",
	"unanswered" boolean,
	"by_machine" boolean DEFAULT false NOT NULL,
	"ai_generation_id" uuid,
	"created_by_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"contact_name" varchar(200),
	"email" varchar(320),
	"phone" varchar(50),
	"kind" "person_kind" DEFAULT 'customer' NOT NULL,
	"standing" "person_standing" DEFAULT 'new' NOT NULL,
	"since_date" date,
	"relationship_summary" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"attention_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_company_info" (
	"person_id" uuid PRIMARY KEY NOT NULL,
	"address" text,
	"vat_number" varchar(50),
	"payment_terms" varchar(100),
	"rhythm_note" text,
	"internal_owner_member_id" uuid
);
--> statement-breakpoint
CREATE TABLE "connected_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"provider" varchar(100) NOT NULL,
	"status" "connected_source_status" DEFAULT 'connected' NOT NULL,
	"detail" varchar(200),
	"last_synced_at" timestamp with time zone,
	"external_ref" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "figures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"key" varchar(100) NOT NULL,
	"label" varchar(200) NOT NULL,
	"value" numeric(14, 2) NOT NULL,
	"is_currency" boolean DEFAULT false NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"period_label" varchar(100) NOT NULL,
	"delta_pct" numeric(6, 2),
	"delta_basis" varchar(200),
	"reading" text,
	"confidence" "confidence" DEFAULT 'estimated' NOT NULL,
	"receipt" jsonb,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_series_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"series_key" varchar(100) NOT NULL,
	"label" varchar(50) NOT NULL,
	"period_date" date,
	"value" numeric(14, 4) NOT NULL,
	"annotation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"ref" varchar(50) NOT NULL,
	"issued_at" date,
	"due_at" date,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"days_over" integer,
	"job_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"intent" text,
	"starts_at" date,
	"ends_at" date,
	"state" "campaign_season_state" DEFAULT 'planning' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"season_id" uuid,
	"name" varchar(300) NOT NULL,
	"channel" "campaign_channel" NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"audience_count" integer DEFAULT 0 NOT NULL,
	"sent_at" timestamp with time zone,
	"result_summary" text,
	"open_rate" numeric(5, 2),
	"enquiries" integer,
	"by_machine" boolean DEFAULT false NOT NULL,
	"ai_generation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"why" text,
	"ai_generation_id" uuid,
	"status" "content_idea_status" DEFAULT 'suggested' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"category" "calendar_category" DEFAULT 'work' NOT NULL,
	"title" varchar(300) NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"who" varchar(200),
	"where_location" varchar(200),
	"campaign_id" uuid,
	"tone" "calendar_tone" DEFAULT 'neutral' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"detail" text,
	"due_date" date,
	"owner_member_id" uuid NOT NULL,
	"room" varchar(100),
	"priority" "task_priority" DEFAULT 'whenever' NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"proposed" boolean DEFAULT false NOT NULL,
	"amount" numeric(12, 2),
	"ai_generation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"linked_note_id" uuid,
	"linked_document_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"kind" "document_kind" NOT NULL,
	"owner_member_id" uuid,
	"body" text NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"kind" "note_kind" NOT NULL,
	"body" text NOT NULL,
	"used_by" varchar(200),
	"by_machine" boolean DEFAULT false NOT NULL,
	"ai_generation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_accepted_by_member_id_business_members_id_fk" FOREIGN KEY ("accepted_by_member_id") REFERENCES "public"."business_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_ai_generation_id_ai_generations_id_fk" FOREIGN KEY ("ai_generation_id") REFERENCES "public"."ai_generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_member_id_business_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."business_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_company_info" ADD CONSTRAINT "person_company_info_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_company_info" ADD CONSTRAINT "person_company_info_internal_owner_member_id_business_members_id_fk" FOREIGN KEY ("internal_owner_member_id") REFERENCES "public"."business_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connected_sources" ADD CONSTRAINT "connected_sources_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "figures" ADD CONSTRAINT "figures_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_series_points" ADD CONSTRAINT "financial_series_points_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_seasons" ADD CONSTRAINT "campaign_seasons_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_season_id_campaign_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."campaign_seasons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_ai_generation_id_ai_generations_id_fk" FOREIGN KEY ("ai_generation_id") REFERENCES "public"."ai_generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_ideas" ADD CONSTRAINT "content_ideas_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_ideas" ADD CONSTRAINT "content_ideas_ai_generation_id_ai_generations_id_fk" FOREIGN KEY ("ai_generation_id") REFERENCES "public"."ai_generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_member_id_business_members_id_fk" FOREIGN KEY ("owner_member_id") REFERENCES "public"."business_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_ai_generation_id_ai_generations_id_fk" FOREIGN KEY ("ai_generation_id") REFERENCES "public"."ai_generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_links" ADD CONSTRAINT "document_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_links" ADD CONSTRAINT "document_links_linked_note_id_notes_id_fk" FOREIGN KEY ("linked_note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_links" ADD CONSTRAINT "document_links_linked_document_id_documents_id_fk" FOREIGN KEY ("linked_document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_member_id_business_members_id_fk" FOREIGN KEY ("owner_member_id") REFERENCES "public"."business_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_ai_generation_id_ai_generations_id_fk" FOREIGN KEY ("ai_generation_id") REFERENCES "public"."ai_generations"("id") ON DELETE set null ON UPDATE no action;