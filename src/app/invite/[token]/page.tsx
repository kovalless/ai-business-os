import { eq } from "drizzle-orm";
import { Panel } from "@/components/ui";
import { db } from "@/lib/db/client";
import { businesses, invites } from "@/lib/db/schema";
import { AcceptInviteForm } from "./accept-form";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const [invite] = await db.select().from(invites).where(eq(invites.token, token)).limit(1);

  let status: "valid" | "invalid" | "used" | "expired" = "valid";
  if (!invite) status = "invalid";
  else if (invite.acceptedAt) status = "used";
  else if (invite.expiresAt < new Date()) status = "expired";

  const business =
    invite && status === "valid"
      ? (await db.select().from(businesses).where(eq(businesses.id, invite.businessId)).limit(1))[0]
      : null;

  return (
    <div className="flex h-full min-w-0 flex-1 items-center justify-center p-court">
      <Panel tone="outline" className="w-full max-w-[360px]">
        {status === "valid" && invite && business ? (
          <>
            <h1 className="text-title font-medium text-ink">Join {business.name}</h1>
            <p className="mt-step text-bodysm text-ink-3">{invite.email}</p>
            <div className="mt-bay">
              <AcceptInviteForm token={token} />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-title font-medium text-ink">Invite not available</h1>
            <p className="mt-step text-bodysm text-ink-3">
              {status === "used"
                ? "This invite has already been used."
                : status === "expired"
                  ? "This invite has expired."
                  : "This invite link is invalid."}
            </p>
          </>
        )}
      </Panel>
    </div>
  );
}
