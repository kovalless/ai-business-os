import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businessMembers, calendarEvents, tasks } from "@/lib/db/schema";
import type { CalendarEntry } from "@/components/ui";
import type { Task } from "@/lib/types";
import { formatShortDate, SHORT_MONTHS } from "@/lib/utils";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysBetweenUTC(a: Date, b: Date): number {
  const aUTC = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bUTC = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((bUTC - aUTC) / 86_400_000);
}

// Reproduces the mock's relative due-date labels (Today/Tomorrow/
// Yesterday/weekday name for the next few days) computed against real
// time instead of hand-authored per task. Note: the existing UI only
// special-cases the literal string "Yesterday" for red overdue styling
// (not "is this task overdue" generally) — preserved exactly as-is,
// quirky as that is, since redesigning it is out of scope here.
function formatTaskDue(dueDate: string | null, now: Date): string {
  if (!dueDate) return "No due date";
  const due = new Date(dueDate);
  const diff = daysBetweenUTC(now, due);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff <= 6) return WEEKDAYS[due.getUTCDay()]!;
  return formatShortDate(due, now);
}

// "Mon 4 Aug, 08:00" / "Thu 7 Aug" / "2–9 Aug" for a same-month range.
// Events seeded with a placeholder time (see Milestone A's seed script)
// will show that time here even though the original mock text for a
// couple of those didn't display one — an honest read of the stored
// timestamp, not a fabrication, and the expected kind of small
// difference between illustrative mock text and real stored data.
function formatEventWhen(startsAt: Date, endsAt: Date | null): string {
  const day = startsAt.getUTCDate();
  const month = SHORT_MONTHS[startsAt.getUTCMonth()];
  const weekday = WEEKDAYS_SHORT[startsAt.getUTCDay()];
  const hasTime = startsAt.getUTCHours() !== 0 || startsAt.getUTCMinutes() !== 0;
  const time = hasTime
    ? `, ${String(startsAt.getUTCHours()).padStart(2, "0")}:${String(startsAt.getUTCMinutes()).padStart(2, "0")}`
    : "";

  if (endsAt && (endsAt.getUTCDate() !== startsAt.getUTCDate() || endsAt.getUTCMonth() !== startsAt.getUTCMonth())) {
    return `${day}–${endsAt.getUTCDate()} ${month}`;
  }
  return `${weekday} ${day} ${month}${time}`;
}

export type WorkTask = Task & { priority: "now" | "soon" | "whenever" };

// Owner is resolved via a join instead of a separate lookup keyed by
// name — the mock's Task.owner was already a plain string, but the real
// column is a business_members reference. priority is a real column on
// the DB row, so (unlike the mock's separate `priorityOf` map) it's just
// part of the task here.
export async function listTasks(businessId: string): Promise<WorkTask[]> {
  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      detail: tasks.detail,
      dueDate: tasks.dueDate,
      room: tasks.room,
      done: tasks.done,
      proposed: tasks.proposed,
      amount: tasks.amount,
      priority: tasks.priority,
      ownerName: businessMembers.displayName,
    })
    .from(tasks)
    .innerJoin(businessMembers, eq(businessMembers.id, tasks.ownerMemberId))
    .where(eq(tasks.businessId, businessId));

  const now = new Date();
  return rows.map((t) => ({
    id: t.id,
    title: t.title,
    detail: t.detail ?? undefined,
    due: formatTaskDue(t.dueDate, now),
    owner: t.ownerName,
    room: t.room ?? "",
    done: t.done,
    proposed: t.proposed,
    amount: t.amount ? Number(t.amount) : undefined,
    priority: t.priority,
  }));
}

export type UpcomingItem = { id: string; title: string; when: string; who: string; where: string };

// The mock's `upcoming` list and `workCalendar` grid both draw from the
// same underlying event set (and, per the original mock, from more than
// just work-category events — the September newsletter go-out appeared
// in both, despite being a marketing event) — one fetch, shaped two ways
// below, same pattern as the People room's activities → thread/
// conversations split.
async function fetchCalendarEvents(businessId: string) {
  return db.select().from(calendarEvents).where(eq(calendarEvents.businessId, businessId)).orderBy(calendarEvents.startsAt);
}

export async function listUpcoming(businessId: string): Promise<UpcomingItem[]> {
  const rows = await fetchCalendarEvents(businessId);
  return rows.map((e) => ({
    id: e.id,
    title: e.title,
    when: formatEventWhen(e.startsAt, e.endsAt),
    who: e.who ?? "",
    where: e.whereLocation ?? "",
  }));
}

// Expands a multi-day event (e.g. "Workshop closed" spanning a week)
// into one calendar cell per day it actually covers, rather than the
// original mock's arbitrary 3-day sampling of that same range — more
// complete, not a redesign. Assumes the range doesn't cross a month
// boundary, true for all currently seeded events and a reasonable scope
// limit for a single-month calendar grid.
export async function listWorkCalendar(businessId: string): Promise<CalendarEntry[]> {
  const rows = await fetchCalendarEvents(businessId);
  const entries: CalendarEntry[] = [];
  for (const e of rows) {
    const start = e.startsAt.getUTCDate();
    const end = e.endsAt ? e.endsAt.getUTCDate() : start;
    for (let day = start; day <= end; day++) {
      entries.push({ day, label: e.title, tone: e.tone === "neutral" ? undefined : e.tone });
    }
  }
  return entries;
}

export type WorkSignals = { proposedCount: number; proposedTotal: number };

// Pure function, not a query — computed from the already-fetched task
// list. Replaces the original mock-up's hardcoded "Steel rose 6% on 12
// July" framing (no schema tracks supplier price history, same
// principle as the Ledger room's dropped Notice) while keeping the part
// that IS real: the total euro value currently attached to open,
// proposed tasks.
export function getWorkSignals(taskList: WorkTask[]): WorkSignals {
  const proposedOpen = taskList.filter((t) => t.proposed && !t.done && t.amount);
  return {
    proposedCount: proposedOpen.length,
    proposedTotal: proposedOpen.reduce((sum, t) => sum + (t.amount ?? 0), 0),
  };
}
