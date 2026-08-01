import type { DefaultSession } from "next-auth";

// Augments next-auth's Session.user with the business context every
// Server Action guard (session.ts) needs. Populated by the session
// callback in config.ts from the JWT (see the JWT augmentation below).
// memberId/businessId/role are null when a user exists but hasn't been
// linked to a business_members row yet (e.g. an account created ahead
// of an invite being accepted).
declare module "next-auth" {
  interface Session {
    user: {
      businessId: string | null;
      memberId: string | null;
      role: "owner" | "member" | null;
    } & DefaultSession["user"];
  }
}
