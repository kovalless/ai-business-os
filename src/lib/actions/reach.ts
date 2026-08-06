import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db/client";
import { businesses, calendarEvents, campaignSeasons, campaigns, contentIdeas } from "@/lib/db/schema";
import type { CalendarEntry } from "@/components/ui";
import { SHORT_MONTHS } from "@/lib/utils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDateOnly(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]}`;
}

function formatSeasonDates(startsAt: string | null, endsAt: string | null): string {
  if (!startsAt || !endsAt) return "";
  return `${formatDateOnly(startsAt)} – ${formatDateOnly(endsAt)}`;
}

export type ReachSeason = {
  id: string;
  name: string;
  intent: string;
  dates: string;
  state: "planning" | "running" | "closed";
};

export async function listSeasons(businessId: string): Promise<ReachSeason[]> {
  const rows = await db
    .select()
    .from(campaignSeasons)
    .where(eq(campaignSeasons.businessId, businessId))
    .orderBy(asc(campaignSeasons.startsAt));

  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    intent: s.intent ?? "",
    dates: formatSeasonDates(s.startsAt, s.endsAt),
    state: s.state,
  }));
}

export type ReachCampaign = {
  id: string;
  seasonId: string | null;
  name: string;
  channel: "email" | "post" | "letter";
  status: "sent" | "scheduled" | "draft" | "proposed";
  audience: number;
  result: string;
};

// DB enum values (sent/scheduled/draft/proposed) already match the UI's
// STATUS_TONE keys directly — no display translation needed, unlike the
// Ledger and People rooms' underscore-vs-space enum mismatches.
//
// Wrapped in cache() — called from both the root layout (Aperture's
// search index) and this room's own page within the same request.
export const listCampaigns = cache(async (businessId: string): Promise<ReachCampaign[]> => {
  const rows = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.businessId, businessId))
    .orderBy(asc(campaigns.createdAt));

  return rows.map((c) => ({
    id: c.id,
    seasonId: c.seasonId,
    name: c.name,
    channel: c.channel,
    status: c.status,
    audience: c.audienceCount,
    result: c.resultSummary ?? "",
  }));
});

// Marketing-category slice of the same calendar_events table the Work
// room reads (category='work'). One table, two rooms — see the mock's
// original contentCalendar/upcoming/workCalendar three-way split, now
// unified with a discriminator column.
export async function listReachCalendar(businessId: string): Promise<CalendarEntry[]> {
  const rows = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.businessId, businessId));

  return rows
    .filter((e) => e.category === "marketing")
    .map((e) => ({
      day: e.startsAt.getUTCDate(),
      label: e.title,
      tone: e.tone === "neutral" ? undefined : e.tone,
    }));
}

export type ReachIdea = { id: string; title: string; why: string };

export async function listIdeas(businessId: string): Promise<ReachIdea[]> {
  const rows = await db
    .select()
    .from(contentIdeas)
    .where(eq(contentIdeas.businessId, businessId))
    .orderBy(asc(contentIdeas.createdAt));

  return rows.map((i) => ({ id: i.id, title: i.title, why: i.why ?? "" }));
}

export async function getBusinessVoice(businessId: string): Promise<string[]> {
  const [row] = await db.select({ voiceRules: businesses.voiceRules }).from(businesses).where(eq(businesses.id, businessId));
  return row?.voiceRules ?? [];
}

export type ReachPerformanceRow = {
  id: string;
  label: string;
  sent: number;
  opened: number | null;
  enquiries: number;
};

// Reproduces the mock's per-season performance table using only what
// campaigns actually record (sent count, open rate, enquiries). The
// original mock also carried "jobs" and "value" columns, but no schema
// here attributes won jobs or revenue back to a campaign or season —
// that number lived only as freeform prose in a couple of campaigns'
// resultSummary text. Fabricating structured totals from that would be
// the same mistake the Ledger room's dropped supplier-price Notice and
// the Work room's dropped "steel rose 6%" framing were avoided for, so
// those two columns are dropped rather than invented.
export async function getReachPerformance(businessId: string): Promise<ReachPerformanceRow[]> {
  const [seasonRows, campaignRows] = await Promise.all([
    db.select().from(campaignSeasons).where(eq(campaignSeasons.businessId, businessId)).orderBy(asc(campaignSeasons.startsAt)),
    db.select().from(campaigns).where(eq(campaigns.businessId, businessId)),
  ]);

  return seasonRows.map((season) => {
    const sent = campaignRows.filter((c) => c.seasonId === season.id && c.status === "sent");
    const withOpenRate = sent.filter((c) => c.openRate !== null);
    const opened =
      withOpenRate.length === 0
        ? null
        : Math.round(withOpenRate.reduce((sum, c) => sum + Number(c.openRate), 0) / withOpenRate.length);
    const enquiries = sent.reduce((sum, c) => sum + (c.enquiries ?? 0), 0);

    return { id: season.id, label: season.name, sent: sent.length, opened, enquiries };
  });
}

export type SendGate = {
  campaignId: string;
  name: string;
  audience: number;
  scheduledWhen: string;
  recallableUntil: string;
} | null;

function formatSendWhen(d: Date): string {
  const day = d.getUTCDate();
  const month = MONTH_NAMES[d.getUTCMonth()];
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month}, ${hh}:${mm}`;
}

function formatRecallTime(d: Date): string {
  const recall = new Date(d.getTime() - 5 * 60_000);
  return `${String(recall.getUTCHours()).padStart(2, "0")}:${String(recall.getUTCMinutes()).padStart(2, "0")}`;
}

// Powers the "send gate" panel with the one campaign actually waiting to
// go out (drafted, not yet sent) and its real scheduled calendar_events
// row, instead of the mock's hardcoded "September newsletter" / "18
// August, 07:30" text. Recallable-until is a five-minute-before-send
// display rule, not a stored fact — same kind of formatting decision as
// the Work room's UTC-based due-date labels.
export async function getSendGate(businessId: string): Promise<SendGate> {
  const [draftRows, eventRows] = await Promise.all([
    db.select().from(campaigns).where(eq(campaigns.businessId, businessId)),
    db.select().from(calendarEvents).where(eq(calendarEvents.businessId, businessId)),
  ]);

  const draft = draftRows.find((c) => c.status === "draft");
  if (!draft) return null;

  const event = eventRows.find((e) => e.campaignId === draft.id);
  if (!event) return null;

  return {
    campaignId: draft.id,
    name: draft.name,
    audience: draft.audienceCount,
    scheduledWhen: formatSendWhen(event.startsAt),
    recallableUntil: formatRecallTime(event.startsAt),
  };
}
