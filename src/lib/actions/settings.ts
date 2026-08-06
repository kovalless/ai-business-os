import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db/client";
import { businesses, connectedSources } from "@/lib/db/schema";

const STANDING_FIGURE_LABELS: Record<string, string> = {
  cash_on_hand: "Cash on hand",
};

export type BusinessSettings = { name: string; trade: string; standingFigureLabel: string };

// Wrapped in cache() — called from both the root layout (Rail's
// business name) and this room's own page within the same request.
export const getBusinessSettings = cache(async (businessId: string): Promise<BusinessSettings | null> => {
  const [row] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!row) return null;

  return {
    name: row.name,
    trade: row.trade,
    standingFigureLabel: STANDING_FIGURE_LABELS[row.standingFigureKey] ?? row.standingFigureKey,
  };
});

export type ConnectedSource = { id: string; name: string; detail: string; ok: boolean };

// connected_sources exists precisely so Settings can read real (possibly
// empty) state instead of the mock's hardcoded SOURCES array — see
// schema/financial.ts's own comment on the table. No live OAuth sync
// exists yet (a later integration milestone), so the seeded business
// currently has zero rows here; showing nothing is the honest state,
// not a bug, and matches the same "don't fabricate" principle applied
// to every other room this milestone.
export async function listConnectedSources(businessId: string): Promise<ConnectedSource[]> {
  const rows = await db.select().from(connectedSources).where(eq(connectedSources.businessId, businessId));

  return rows.map((r) => ({
    id: r.id,
    name: r.provider,
    detail: r.detail ?? "",
    ok: r.status === "connected",
  }));
}
