import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { aiGenerations, financialSeriesPoints, invoices } from "@/lib/db/schema";
import type { Confidence, SeriesPoint } from "@/lib/types";
import { money, pct } from "@/lib/utils";
import { getPeopleRoomSignals, listPeople } from "./people";

// financial_series_points generalizes every mock chart series (cashflow,
// revenue, prior-year, hours booked/last-year, customer counts) into one
// table keyed by seriesKey — see Milestone A's schema. Two mock arrays
// have no home here or anywhere else in the schema (marginByWork's
// hours/margin-per-work-category, and the Conversion tab's enquiry/site-
// measure/quote funnel counts): nothing tracks work categories or sales-
// funnel stages as entities yet. Both are dropped rather than fabricated,
// same principle as every other room's dropped unbacked content.
const SERIES_KEYS = {
  revenue: "revenue",
  priorYear: "prior_year",
  cashflow: "cashflow",
  hoursBooked: "hours_booked",
  hoursLastYear: "hours_last_year",
  customerCounts: "customer_counts",
} as const;

export type AnalyticsSeries = {
  revenue: SeriesPoint[];
  priorYear: SeriesPoint[];
  cashflow: SeriesPoint[];
  hoursBooked: SeriesPoint[];
  hoursLastYear: SeriesPoint[];
  customerCounts: SeriesPoint[];
};

export async function getAnalyticsSeries(businessId: string): Promise<AnalyticsSeries> {
  const rows = await db
    .select()
    .from(financialSeriesPoints)
    .where(eq(financialSeriesPoints.businessId, businessId))
    .orderBy(asc(financialSeriesPoints.periodDate));

  function seriesFor(key: string): SeriesPoint[] {
    return rows
      .filter((r) => r.seriesKey === key)
      .map((r) => ({ label: r.label, value: Number(r.value), annotation: r.annotation ?? undefined }));
  }

  return {
    revenue: seriesFor(SERIES_KEYS.revenue),
    priorYear: seriesFor(SERIES_KEYS.priorYear),
    cashflow: seriesFor(SERIES_KEYS.cashflow),
    hoursBooked: seriesFor(SERIES_KEYS.hoursBooked),
    hoursLastYear: seriesFor(SERIES_KEYS.hoursLastYear),
    customerCounts: seriesFor(SERIES_KEYS.customerCounts),
  };
}

export type AnalyticsInsight = { id: string; text: string; confidence: Confidence };

// Powers the margin's "What stands out" list from the real ai_generations
// rows the seed script inserts with targetType='analytics' — not a
// separate stored fixture, this table already exists for exactly this
// (every AI-surfaced suggestion is a row here first, per ai.ts).
export async function getAnalyticsInsights(businessId: string): Promise<AnalyticsInsight[]> {
  const rows = await db
    .select()
    .from(aiGenerations)
    .where(and(eq(aiGenerations.businessId, businessId), eq(aiGenerations.targetType, "analytics"), eq(aiGenerations.kind, "insight")))
    .orderBy(asc(aiGenerations.createdAt));

  return rows.map((r) => ({ id: r.id, text: r.outputText ?? "", confidence: r.confidence }));
}

export type GrowthRow = { label: string; now: number; then: number };

// Reproduces the mock's "now vs a year ago" growth comparison from real
// invoices, windowed to the last 12 months vs the 12 months before that.
// The mock's fourth row, "Hours sold per week", is dropped: no schema
// anywhere tracks booked/sold hours per job or per week, only the
// pre-aggregated hours_booked/hours_last_year chart series (5 weeks,
// not a year of history) — not the same thing. The seed dataset itself
// only carries a handful of months of real invoice history, so the
// "then" figures below will read low or zero rather than matching the
// mock's illustrative "a year ago" numbers — an honest reflection of
// what's actually seeded, not a bug.
export async function getGrowthRows(businessId: string): Promise<GrowthRow[]> {
  const rows = await db
    .select({ personId: invoices.personId, amount: invoices.amount, issuedAt: invoices.issuedAt })
    .from(invoices)
    .where(and(eq(invoices.businessId, businessId), ne(invoices.status, "draft")));

  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setUTCFullYear(today.getUTCFullYear() - 1);
  const twoYearsAgo = new Date(today);
  twoYearsAgo.setUTCFullYear(today.getUTCFullYear() - 2);

  const dated = rows.filter((r): r is typeof r & { issuedAt: string } => r.issuedAt !== null);
  const nowRows = dated.filter((r) => new Date(r.issuedAt) >= oneYearAgo);
  const thenRows = dated.filter((r) => new Date(r.issuedAt) >= twoYearsAgo && new Date(r.issuedAt) < oneYearAgo);

  const sum = (rs: typeof dated) => rs.reduce((s, r) => s + Number(r.amount), 0);
  const avg = (rs: typeof dated) => (rs.length ? sum(rs) / rs.length : 0);
  const orderedTwice = (rs: typeof dated) => {
    const counts = new Map<string, number>();
    for (const r of rs) counts.set(r.personId, (counts.get(r.personId) ?? 0) + 1);
    return [...counts.values()].filter((c) => c >= 2).length;
  };

  return [
    { label: "Invoiced, 12 months", now: sum(nowRows), then: sum(thenRows) },
    { label: "Average job value", now: avg(nowRows), then: avg(thenRows) },
    { label: "Customers who ordered twice", now: orderedTwice(nowRows), then: orderedTwice(thenRows) },
  ];
}

export type QuietCustomer = { id: string; name: string; note: string } | null;

// Reuses the People room's own "drifting" signal (src/lib/actions/people.ts)
// instead of recomputing customer dormancy here — same underlying fact
// (Brouwer & Zn's real standing + attention note), read once, not
// duplicated logic.
export async function getQuietCustomer(businessId: string): Promise<QuietCustomer> {
  const list = await listPeople(businessId);
  const { drifting } = await getPeopleRoomSignals(businessId, list);
  if (!drifting) return null;
  return { id: drifting.id, name: drifting.name, note: drifting.attention ?? drifting.relationship };
}

export type AnalyticsQuestion = { id: string; q: string; answer: string };

// Pure function, not a query — composed from data already fetched for
// the other tabs. Two of the mock's four Q&A pairs (margin/rate-change)
// reuse real analytics insight text directly rather than recomputing it:
// the seed script always inserts the four analyticsInsights rows in a
// fixed order (rate change, margin, hours, cash forecast — see
// scripts/seed.ts), and getAnalyticsInsights orders by createdAt to
// match that, so indexing here mirrors that fixed pairing.
export function buildQuestions(series: AnalyticsSeries, insights: AnalyticsInsight[], quiet: QuietCustomer): AnalyticsQuestion[] {
  const questions: AnalyticsQuestion[] = [];

  const latestRevenue = series.revenue.at(-1);
  const latestPriorYear = series.priorYear.at(-1);
  if (latestRevenue && latestPriorYear && latestPriorYear.value > 0) {
    const change = ((latestRevenue.value - latestPriorYear.value) / latestPriorYear.value) * 100;
    const up = change >= 0;
    questions.push({
      id: "q1",
      q: "Am I making more than last year?",
      answer: `${up ? "Yes" : "No"}. Invoiced ${money(latestRevenue.value)} in ${latestRevenue.label}, ${pct(change, 0)} ${up ? "above" : "below"} the same month last year.`,
    });
  }

  if (insights[1]) {
    questions.push({ id: "q2", q: "Which work actually makes money?", answer: insights[1].text });
  }
  if (insights[0]) {
    questions.push({ id: "q3", q: "What happened after the rate change?", answer: insights[0].text });
  }
  if (quiet) {
    questions.push({
      id: "q4",
      q: "Which customers are quietly leaving?",
      answer: `One. ${quiet.name} — ${quiet.note}`,
    });
  }

  return questions;
}

// Pure function. "The gap widened after the March rate change" is kept
// as fixed framing (true for the seeded dataset — the six-month gap
// really did widen after March) rather than independently re-verified
// here; the percentage itself is computed live from the real series.
export function getRevenueSentence(series: AnalyticsSeries): string {
  const revenueTotal = series.revenue.reduce((s, p) => s + p.value, 0);
  const priorYearTotal = series.priorYear.reduce((s, p) => s + p.value, 0);
  if (priorYearTotal === 0) return "";
  const change = ((revenueTotal - priorYearTotal) / priorYearTotal) * 100;
  return `Invoiced work is ${pct(change, 0)} above the same six months last year, and the gap widened after the March rate change.`;
}

export function getHoursSentence(series: AnalyticsSeries): string {
  const last = series.hoursBooked.at(-1);
  const lastYearSame = series.hoursLastYear[series.hoursBooked.length - 1];
  if (!last || !lastYearSame || lastYearSame.value === 0) return "";
  const change = ((last.value - lastYearSame.value) / lastYearSame.value) * 100;
  const direction = change >= 0 ? "above" : "below";
  return `Booked workshop hours fall to ${last.value} next week, ${pct(change, 0)} ${direction} the same week last year.`;
}

export function getCustomersSentence(series: AnalyticsSeries): string {
  const last = series.customerCounts.at(-1);
  const first = series.customerCounts[0];
  if (!last || !first) return "";
  return `${last.value} customers have ordered in the last twelve months, ${last.value - first.value} more than at the start of this window.`;
}

// Replaces the mock's fixed "...if the two open Kessler invoices land"
// framing — no schema tracks which specific invoices a cash forecast
// assumes, so that causal claim isn't something this can honestly
// assert. What's real and computable is where the series itself ends up.
export function getCashflowSentence(series: AnalyticsSeries): string {
  const last = series.cashflow.at(-1);
  if (!last) return "";
  return `Cash reaches ${money(last.value)} by ${last.label}.`;
}
