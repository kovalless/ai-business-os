ALTER TABLE "tasks" DROP CONSTRAINT "tasks_owner_member_id_business_members_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_member_id_business_members_id_fk" FOREIGN KEY ("owner_member_id") REFERENCES "public"."business_members"("id") ON DELETE cascade ON UPDATE no action;