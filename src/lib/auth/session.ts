import { redirect } from "next/navigation";
import { auth } from "./config";

export type CurrentMember = {
  userId: string;
  businessId: string;
  memberId: string;
  role: "owner" | "member";
};

// Non-throwing: for surfaces that behave differently when signed in vs
// not (e.g. redirecting an already-authenticated user away from /login)
// rather than requiring authentication outright.
export async function getCurrentMember(): Promise<CurrentMember | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.businessId || !user.memberId || !user.role) {
    return null;
  }
  return {
    userId: user.id,
    businessId: user.businessId,
    memberId: user.memberId,
    role: user.role,
  };
}

// The guard for Server Actions and pages that require an authenticated
// business member. Scaffolded here, not yet called from anywhere — the
// existing mock-data rooms stay ungated per locked decision 4; this
// becomes load-bearing once Milestone C's Server Actions call it.
export async function requireSession(): Promise<CurrentMember> {
  const member = await getCurrentMember();
  if (!member) {
    redirect("/login");
  }
  return member;
}
