import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { aiGenerations } from "@/lib/db/schema";
import type { Confidence, Move, Signal } from "@/lib/types";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

// "Tuesday, 29 July" — the original mock's fixed date, now real. Uses UTC
// getters for the same reason as every other room's date formatting: no
// stored date should shift by a day depending on the server's timezone.
export function getTodayMeta(now = new Date()): string {
  const weekday = WEEKDAYS[now.getUTCDay()];
  const day = now.getUTCDate();
  const month = MONTH_NAMES[now.getUTCMonth()];
  return `${weekday}, ${day} ${month}`;
}

// "Since you closed on Monday evening —" reproduced as "since yesterday
// evening", computed from real time instead of a fixed weekday.
export function getTodayStatement(now = new Date()): string {
  const yesterday = new Date(now.getTime() - 86_400_000);
  const weekday = WEEKDAYS[yesterday.getUTCDay()];
  return `Since you closed on ${weekday} evening —`;
}

// Signals, moves, and the margin insight are all real ai_generations rows
// the seed script already inserts with targetType='today'/'today_margin'
// (see scripts/seed.ts) — every AI-surfaced suggestion is a row there
// first, per ai.ts's own design. No new derivation needed here, unlike
// most other rooms this milestone: this room's mock data already *was*
// the ai_generations fixture, word for word.
export async function listSignals(businessId: string): Promise<Signal[]> {
  const rows = await db
    .select()
    .from(aiGenerations)
    .where(and(eq(aiGenerations.businessId, businessId), eq(aiGenerations.targetType, "today"), eq(aiGenerations.kind, "signal")))
    .orderBy(asc(aiGenerations.createdAt));

  return rows.map((r) => {
    const json = (r.outputJson ?? {}) as { emphasis?: string[] | null; room: string; href: string; at: string };
    return {
      id: r.id,
      text: r.outputText ?? "",
      emphasis: json.emphasis ?? undefined,
      room: json.room,
      href: json.href,
      at: json.at,
    };
  });
}

export async function listMoves(businessId: string): Promise<Move[]> {
  const rows = await db
    .select()
    .from(aiGenerations)
    .where(and(eq(aiGenerations.businessId, businessId), eq(aiGenerations.targetType, "today"), eq(aiGenerations.kind, "move")))
    .orderBy(asc(aiGenerations.createdAt));

  return rows.map((r) => {
    const json = (r.outputJson ?? {}) as { why: string; action: string; href: string; amount: string | null; primary: boolean };
    return {
      id: r.id,
      title: r.outputText ?? "",
      why: json.why,
      action: json.action,
      href: json.href,
      primary: json.primary || undefined,
      amount: json.amount ? Number(json.amount) : undefined,
      confidence: r.confidence,
    };
  });
}

export type TodayMarginNote = {
  text: string;
  confidence: Confidence;
  actions: { label: string; href: string }[];
  quiet: string;
};

export async function getMarginNote(businessId: string): Promise<TodayMarginNote | null> {
  const [row] = await db
    .select()
    .from(aiGenerations)
    .where(
      and(
        eq(aiGenerations.businessId, businessId),
        eq(aiGenerations.targetType, "today_margin"),
        eq(aiGenerations.kind, "insight"),
      ),
    )
    .limit(1);
  if (!row) return null;

  const json = (row.outputJson ?? {}) as { actions?: { label: string; href: string }[]; quiet?: string };
  return {
    text: row.outputText ?? "",
    confidence: row.confidence,
    actions: json.actions ?? [],
    quiet: json.quiet ?? "",
  };
}
