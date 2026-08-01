"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { businessMembers, invites, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";

export type AcceptInviteState = { error?: string };

// Bound with `token` via .bind(null, token) in accept-form.tsx, so the
// remaining (prevState, payload) signature matches useActionState.
export async function acceptInviteAction(
  token: string,
  _prevState: AcceptInviteState,
  payload: { name: string; password: string },
): Promise<AcceptInviteState> {
  const name = payload.name.trim();
  const password = payload.password;

  if (!name) return { error: "Enter your name." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const [invite] = await db.select().from(invites).where(eq(invites.token, token)).limit(1);
  if (!invite) return { error: "This invite link is invalid." };
  if (invite.acceptedAt) return { error: "This invite has already been used." };
  if (invite.expiresAt < new Date()) return { error: "This invite has expired." };

  // If this email already has an account (e.g. invited to a second
  // business), link it instead of creating a duplicate — the existing
  // password stays as-is, so no re-hash needed in that branch.
  const [existingUser] = await db.select().from(users).where(eq(users.email, invite.email)).limit(1);
  const passwordHash = existingUser ? null : await hashPassword(password);

  await db.transaction(async (tx) => {
    const userId = existingUser
      ? existingUser.id
      : (
          await tx
            .insert(users)
            .values({ email: invite.email, name, passwordHash: passwordHash! })
            .returning({ id: users.id })
        )[0]!.id;

    await tx.insert(businessMembers).values({
      businessId: invite.businessId,
      userId,
      displayName: name,
      role: invite.role,
    });

    await tx.update(invites).set({ acceptedAt: new Date() }).where(eq(invites.id, invite.id));
  });

  redirect("/login?accepted=1");
}
