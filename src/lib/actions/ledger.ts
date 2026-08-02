import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { figures, invoices, people } from "@/lib/db/schema";
import type { FigureData, Invoice } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";

// The DB enum uses underscores (over_terms); the existing UI's types and
// TONE lookup use spaces ("over terms"), copied from the original mock.
const INVOICE_STATUS_DISPLAY = {
  paid: "paid",
  open: "open",
  over_terms: "over terms",
  draft: "draft",
} as const;

// Display order for the headline + supporting figures — a plain SELECT
// doesn't guarantee row order matches seed/insert order, so the layout
// order is made explicit here rather than assumed.
const STANDING_KEY = "cash_on_hand";
const SUPPORTING_KEYS = ["invoiced_30d", "owed", "committed_14d"];

function toFigureData(row: typeof figures.$inferSelect): FigureData {
  return {
    id: row.key,
    label: row.label,
    value: Number(row.value),
    currency: row.isCurrency,
    period: row.periodLabel,
    delta: row.deltaPct !== null ? { pct: Number(row.deltaPct), basis: row.deltaBasis ?? "" } : undefined,
    reading: row.reading ?? undefined,
    receipt: row.receipt ?? { definition: "", sources: [], window: "", syncedAt: "" },
    confidence: row.confidence,
  };
}

export async function getLedgerFigures(businessId: string): Promise<{ standing: FigureData | null; supporting: FigureData[] }> {
  const rows = await db.select().from(figures).where(eq(figures.businessId, businessId));
  const byKey = new Map(rows.map((r) => [r.key, r]));

  const standingRow = byKey.get(STANDING_KEY);
  const supporting = SUPPORTING_KEYS.map((k) => byKey.get(k))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .map(toFigureData);

  return {
    standing: standingRow ? toFigureData(standingRow) : null,
    supporting,
  };
}

export async function listInvoices(businessId: string): Promise<Invoice[]> {
  const rows = await db
    .select({
      id: invoices.id,
      ref: invoices.ref,
      personId: invoices.personId,
      personName: people.name,
      issuedAt: invoices.issuedAt,
      dueAt: invoices.dueAt,
      amount: invoices.amount,
      status: invoices.status,
      daysOver: invoices.daysOver,
      jobDescription: invoices.jobDescription,
    })
    .from(invoices)
    .innerJoin(people, eq(people.id, invoices.personId))
    .where(eq(invoices.businessId, businessId))
    // Postgres sorts NULL first in DESC order by default, which would
    // put every draft (no issuedAt yet) at the top of the list — an
    // artifact caught by actually looking at the rendered table, not
    // something the type layer would ever flag.
    .orderBy(sql`${invoices.issuedAt} DESC NULLS LAST`);

  return rows.map((i) => ({
    id: i.id,
    ref: i.ref,
    personId: i.personId,
    person: i.personName,
    issued: i.issuedAt ? formatShortDate(new Date(i.issuedAt)) : "—",
    due: i.dueAt ? formatShortDate(new Date(i.dueAt)) : "—",
    amount: Number(i.amount),
    status: INVOICE_STATUS_DISPLAY[i.status],
    daysOver: i.daysOver ?? undefined,
    job: i.jobDescription ?? "",
  }));
}

export type OverdueSignal = {
  personId: string;
  personName: string;
  totalOverdue: number;
  count: number;
  maxDaysOver: number;
};

export type LedgerSignals = { mostOverdue: OverdueSignal | null };

// Powers the Ledger margin's Proposal. Computed from whichever customer
// actually has the most over-terms exposure, not the original mock-up's
// fixed "Kessler Bau" text — that text happens to still be accurate
// against the seeded data (Kessler is in fact the only over-terms
// customer here), but hardcoding it wouldn't generalize to any other
// business's real invoices. The original mock's second margin item (a
// Notice about a supplier's price change affecting open quotes) is
// dropped entirely — nothing in the current schema tracks supplier price
// history or quotes, so there's no real data to back it, matching the
// same principle applied to the People room's dropped Proposal.
export async function getLedgerSignals(businessId: string): Promise<LedgerSignals> {
  const rows = await db
    .select({
      personId: invoices.personId,
      personName: people.name,
      amount: invoices.amount,
      daysOver: invoices.daysOver,
    })
    .from(invoices)
    .innerJoin(people, eq(people.id, invoices.personId))
    .where(and(eq(invoices.businessId, businessId), eq(invoices.status, "over_terms")));

  if (rows.length === 0) return { mostOverdue: null };

  const byPerson = new Map<string, OverdueSignal>();
  for (const r of rows) {
    const existing = byPerson.get(r.personId) ?? {
      personId: r.personId,
      personName: r.personName,
      totalOverdue: 0,
      count: 0,
      maxDaysOver: 0,
    };
    existing.totalOverdue += Number(r.amount);
    existing.count += 1;
    existing.maxDaysOver = Math.max(existing.maxDaysOver, r.daysOver ?? 0);
    byPerson.set(r.personId, existing);
  }

  const mostOverdue = [...byPerson.values()].sort((a, b) => b.totalOverdue - a.totalOverdue)[0] ?? null;
  return { mostOverdue };
}
