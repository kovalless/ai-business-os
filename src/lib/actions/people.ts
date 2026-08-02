import { and, desc, eq, inArray, max, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activities, businessMembers, invoices, people, personCompanyInfo } from "@/lib/db/schema";
import type { Invoice, ThreadEntry } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";

// The DB enums use underscores (over_terms); the existing UI's types and
// lookup objects (STANDING_TONE, TONE in the room components) use spaces
// ("over terms") — copied straight from the original mock. Translating
// here, once, keeps every existing component completely unchanged.
const STANDING_DISPLAY = {
  current: "current",
  over_terms: "over terms",
  drifting: "drifting",
  new: "new",
} as const;

const INVOICE_STATUS_DISPLAY = {
  paid: "paid",
  open: "open",
  over_terms: "over terms",
  draft: "draft",
} as const;

// activities unifies the old mock's separate threads/conversations arrays
// (see schema/people.ts). Conversations always have `direction` set;
// thread entries never did — reconstructing the original two-array split
// exactly as seeded, not a new distinction.
const THREAD_KINDS = ["invoice", "email", "call", "note", "job", "payment", "quote"] as const;
type ThreadKind = (typeof THREAD_KINDS)[number];
function isThreadKind(kind: string): kind is ThreadKind {
  return (THREAD_KINDS as readonly string[]).includes(kind);
}

export type PersonSummary = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  since: string;
  lifetime: number;
  outstanding: number;
  lastContactDays: number | null;
  standing: (typeof STANDING_DISPLAY)[keyof typeof STANDING_DISPLAY];
  relationship: string;
  tags: string[];
  attention?: string;
};

export type ConversationEntry = {
  id: string;
  subject: string;
  excerpt: string;
  channel: string;
  at: string;
  unanswered: boolean;
};

export type PersonDetail = {
  person: PersonSummary;
  companyInfo: { address: string; vat: string; terms: string; rhythm: string; owner: string } | null;
  thread: ThreadEntry[];
  conversations: ConversationEntry[];
  invoices: Invoice[];
};

export type RoomSignals = {
  drifting: PersonSummary | null;
  unanswered: { personId: string; personName: string; subject: string; at: string } | null;
};

function invoiceTotalsQuery(businessId: string, personIds: string[]) {
  return db
    .select({
      personId: invoices.personId,
      // Lifetime excludes drafts (not real business yet); outstanding is
      // open + over_terms only — verified against the seeded mock data,
      // this exact split reproduces every seeded person's original
      // outstanding figure precisely. Lifetime will read lower than the
      // old mock's numbers for most people: the seed only carries a
      // handful of recent invoices per person, not their full history,
      // so a real (smaller) total is expected here, not a bug.
      lifetime: sql<string>`coalesce(sum(case when ${invoices.status} != 'draft' then ${invoices.amount} else 0 end), 0)`,
      outstanding: sql<string>`coalesce(sum(case when ${invoices.status} in ('open','over_terms') then ${invoices.amount} else 0 end), 0)`,
    })
    .from(invoices)
    .where(and(eq(invoices.businessId, businessId), inArray(invoices.personId, personIds)))
    .groupBy(invoices.personId);
}

export async function listPeople(businessId: string): Promise<PersonSummary[]> {
  const rows = await db.select().from(people).where(eq(people.businessId, businessId));
  if (rows.length === 0) return [];

  const personIds = rows.map((r) => r.id);

  const [invoiceTotals, lastContactRows] = await Promise.all([
    invoiceTotalsQuery(businessId, personIds),
    db
      .select({ personId: activities.personId, lastAt: max(activities.occurredAt) })
      .from(activities)
      .where(and(eq(activities.businessId, businessId), inArray(activities.personId, personIds)))
      .groupBy(activities.personId),
  ]);

  const invoiceByPerson = new Map(invoiceTotals.map((r) => [r.personId, r]));
  const lastContactByPerson = new Map(lastContactRows.map((r) => [r.personId, r.lastAt]));
  const now = Date.now();

  return rows.map((p) => {
    const totals = invoiceByPerson.get(p.id);
    const lastAt = lastContactByPerson.get(p.id);
    return {
      id: p.id,
      name: p.name,
      contact: p.contactName ?? "",
      email: p.email ?? "",
      phone: p.phone ?? "",
      since: p.sinceDate ? p.sinceDate.slice(0, 4) : "",
      lifetime: totals ? Number(totals.lifetime) : 0,
      outstanding: totals ? Number(totals.outstanding) : 0,
      lastContactDays: lastAt ? Math.floor((now - lastAt.getTime()) / 86_400_000) : null,
      standing: STANDING_DISPLAY[p.standing],
      relationship: p.relationshipSummary ?? "",
      tags: p.tags,
      attention: p.attentionNote ?? undefined,
    };
  });
}

// Powers the People list room's margin. Both signals are computed from
// real per-business data (not hardcoded to any one seeded person, unlike
// the original mock-up's fixed Brouwer/Ansems example text) — a business
// with no drifting customers or no unanswered messages simply shows
// neither, rather than always displaying fixed illustrative content.
export async function getPeopleRoomSignals(businessId: string, list: PersonSummary[]): Promise<RoomSignals> {
  const drifting =
    list
      .filter((p) => p.standing === "drifting")
      .sort((a, b) => (b.lastContactDays ?? 0) - (a.lastContactDays ?? 0))[0] ?? null;

  const [oldestUnanswered] = await db
    .select({
      personId: activities.personId,
      personName: people.name,
      title: activities.title,
      occurredAt: activities.occurredAt,
    })
    .from(activities)
    .innerJoin(people, eq(people.id, activities.personId))
    .where(and(eq(activities.businessId, businessId), eq(activities.unanswered, true)))
    .orderBy(activities.occurredAt)
    .limit(1);

  return {
    drifting,
    unanswered: oldestUnanswered
      ? {
          personId: oldestUnanswered.personId,
          personName: oldestUnanswered.personName,
          subject: oldestUnanswered.title,
          at: formatShortDate(oldestUnanswered.occurredAt),
        }
      : null,
  };
}

export async function getPersonDetail(businessId: string, personId: string): Promise<PersonDetail | null> {
  const [personRow] = await db
    .select()
    .from(people)
    .where(and(eq(people.businessId, businessId), eq(people.id, personId)))
    .limit(1);
  if (!personRow) return null;

  const [[invoiceTotals], lastContactRows, activityRows, invoiceRows, [companyInfoRow]] = await Promise.all([
    invoiceTotalsQuery(businessId, [personId]),
    db
      .select({ lastAt: max(activities.occurredAt) })
      .from(activities)
      .where(and(eq(activities.businessId, businessId), eq(activities.personId, personId))),
    db
      .select()
      .from(activities)
      .where(and(eq(activities.businessId, businessId), eq(activities.personId, personId)))
      .orderBy(desc(activities.occurredAt)),
    db
      .select()
      .from(invoices)
      .where(and(eq(invoices.businessId, businessId), eq(invoices.personId, personId)))
      .orderBy(desc(invoices.issuedAt)),
    db.select().from(personCompanyInfo).where(eq(personCompanyInfo.personId, personId)),
  ]);

  let ownerName: string | null = null;
  if (companyInfoRow?.internalOwnerMemberId) {
    const [owner] = await db
      .select({ displayName: businessMembers.displayName })
      .from(businessMembers)
      .where(eq(businessMembers.id, companyInfoRow.internalOwnerMemberId));
    ownerName = owner?.displayName ?? null;
  }

  const now = Date.now();
  const lastAt = lastContactRows[0]?.lastAt;
  const person: PersonSummary = {
    id: personRow.id,
    name: personRow.name,
    contact: personRow.contactName ?? "",
    email: personRow.email ?? "",
    phone: personRow.phone ?? "",
    since: personRow.sinceDate ? personRow.sinceDate.slice(0, 4) : "",
    lifetime: invoiceTotals ? Number(invoiceTotals.lifetime) : 0,
    outstanding: invoiceTotals ? Number(invoiceTotals.outstanding) : 0,
    lastContactDays: lastAt ? Math.floor((now - lastAt.getTime()) / 86_400_000) : null,
    standing: STANDING_DISPLAY[personRow.standing],
    relationship: personRow.relationshipSummary ?? "",
    tags: personRow.tags,
    attention: personRow.attentionNote ?? undefined,
  };

  const thread: ThreadEntry[] = activityRows
    .filter((a) => a.direction === null && isThreadKind(a.kind))
    .map((a) => ({
      id: a.id,
      kind: a.kind as ThreadKind,
      at: formatShortDate(a.occurredAt),
      title: a.title,
      detail: a.detail ?? undefined,
      amount: a.amount ? Number(a.amount) : undefined,
      byMachine: a.byMachine,
    }));

  const conversations: ConversationEntry[] = activityRows
    .filter((a) => a.direction !== null)
    .map((a) => ({
      id: a.id,
      subject: a.title,
      excerpt: a.detail ?? "",
      channel: a.kind,
      at: formatShortDate(a.occurredAt),
      unanswered: a.unanswered ?? false,
    }));

  const invoiceList: Invoice[] = invoiceRows.map((i) => ({
    id: i.id,
    ref: i.ref,
    personId: i.personId,
    person: personRow.name,
    issued: i.issuedAt ? formatShortDate(new Date(i.issuedAt)) : "—",
    due: i.dueAt ? formatShortDate(new Date(i.dueAt)) : "—",
    amount: Number(i.amount),
    status: INVOICE_STATUS_DISPLAY[i.status],
    daysOver: i.daysOver ?? undefined,
    job: i.jobDescription ?? "",
  }));

  return {
    person,
    companyInfo: companyInfoRow
      ? {
          address: companyInfoRow.address ?? "",
          vat: companyInfoRow.vatNumber ?? "",
          terms: companyInfoRow.paymentTerms ?? "",
          rhythm: companyInfoRow.rhythmNote ?? "",
          owner: ownerName ?? "",
        }
      : null,
    thread,
    conversations,
    invoices: invoiceList,
  };
}
