import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.local.example to .env.local first.");
}

// Standalone connection, not the app's shared client in src/lib/db/client.ts
// — this script needs to close its connection and exit, which a long-lived
// Next.js server process never does.
const queryClient = postgres(process.env.DATABASE_URL);
const db = drizzle(queryClient, { schema });

// ---------------------------------------------------------------------------
// Fixed reference date.
//
// The mock data ("Vaneck & Co") narrates a specific in-story "today" — the
// Today room's signals are timestamped 06:40-06:42, invoice/receipt windows
// throughout read "29 Jul", and VC-2026-xxx invoice refs confirm the year.
// Every relative task label (Today/Tomorrow/Yesterday/weekday names) is
// resolved against this fixed anchor rather than the real clock, so the
// seeded narrative doesn't drift every time this script is re-run.
//
// Explicit day+month strings elsewhere in the mock data ("4 Aug", "31 Aug")
// are parsed directly and are NOT re-derived from this anchor. Weekday
// PREFIXES on those explicit dates ("Mon 4 Aug") are decorative and ignored
// — cross-checking them against the real 2026 calendar shows the mock text
// isn't internally exact about weekdays, only about day+month, so treating
// the day+month as authoritative and the weekday label as flavor text is
// the more faithful reading, not a shortcut.
const ANCHOR = new Date(Date.UTC(2026, 6, 29)); // 2026-07-29
const YEAR = 2026;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function isoDate(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
function isoFromDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
function nextWeekday(from: Date, targetDay: number): Date {
  let d = addDays(from, 1);
  while (d.getUTCDay() !== targetDay) d = addDays(d, 1);
  return d;
}
function tsAt(y: number, m: number, d: number, hh = 9, mm = 0): Date {
  return new Date(Date.UTC(y, m - 1, d, hh, mm));
}
const MONTH_INDEX: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};
// Parses the mock data's "28 Jul" / "12 Mar 25" thread-date shorthand.
// A trailing two-digit year means 2025 (the only year the mock data uses
// besides the implicit 2026); no suffix means 2026.
function parseThreadDate(s: string): Date {
  const parts = s.split(" ");
  const day = Number.parseInt(parts[0]!, 10);
  const month = MONTH_INDEX[parts[1]!]!;
  const year = parts[2] ? 2000 + Number.parseInt(parts[2], 10) : YEAR;
  return new Date(Date.UTC(year, month - 1, day, 9, 0));
}

const TODAY = isoFromDate(ANCHOR);
const TOMORROW = isoFromDate(addDays(ANCHOR, 1));
const YESTERDAY = isoFromDate(addDays(ANCHOR, -1));
const THURSDAY = isoFromDate(nextWeekday(ANCHOR, 4));
const FRIDAY = isoFromDate(nextWeekday(ANCHOR, 5));
const MONDAY = isoFromDate(nextWeekday(ANCHOR, 1));

type Confidence = (typeof schema.confidenceEnum.enumValues)[number];
type AiGenerationKind = (typeof schema.aiGenerationKindEnum.enumValues)[number];
type AiGenerationStatus = (typeof schema.aiGenerationStatusEnum.enumValues)[number];
type MemberName = "Joris" | "Ruben" | "Marit";

const SEED_BUSINESS_ID = "00000000-0000-4000-8000-000000000001";

async function main() {
  console.log("Seeding Vaneck & Co...");

  await db.transaction(async (tx) => {
    // Idempotent re-seed: every table cascades from businesses.id (directly
    // or transitively), so this one delete clears a full prior seed run.
    await tx.delete(schema.businesses).where(eq(schema.businesses.id, SEED_BUSINESS_ID));

    async function insertAiGeneration(input: {
      kind: AiGenerationKind;
      outputText?: string | null;
      outputJson?: unknown;
      confidence?: Confidence;
      status: AiGenerationStatus;
      acceptedAt?: Date | null;
      acceptedByMemberId?: string | null;
      targetType?: string | null;
    }): Promise<string> {
      const [row] = await tx
        .insert(schema.aiGenerations)
        .values({
          businessId: SEED_BUSINESS_ID,
          kind: input.kind,
          targetType: input.targetType ?? null,
          model: "claude-opus-5",
          outputText: input.outputText ?? null,
          outputJson: input.outputJson ?? null,
          confidence: input.confidence ?? "estimated",
          status: input.status,
          acceptedAt: input.acceptedAt ?? null,
          acceptedByMemberId: input.acceptedByMemberId ?? null,
        })
        .returning();
      return row!.id;
    }

    // -- Business ------------------------------------------------------
    await tx.insert(schema.businesses).values({
      id: SEED_BUSINESS_ID,
      name: "Vaneck & Co",
      trade: "Architectural metalwork",
      city: "Amsterdam-Noord",
      foundedYear: 2014,
      currency: "EUR",
      standingFigureKey: "cash_on_hand",
      voiceRules: [
        "Short sentences. First person plural.",
        "Never uses the word premium.",
        "Names the maker on every job.",
        "Sells on tolerance and finish, not on price.",
        "Apologises directly when a delivery slips.",
      ],
    });

    // -- Members ---------------------------------------------------------
    const memberSeed = [
      { name: "Joris Vaneck", role: "owner" as const },
      { name: "Ruben", role: "member" as const },
      { name: "Marit", role: "member" as const },
    ];
    const insertedMembers = await tx
      .insert(schema.businessMembers)
      .values(memberSeed.map((m) => ({ businessId: SEED_BUSINESS_ID, displayName: m.name, role: m.role })))
      .returning();
    const memberByName = new Map(insertedMembers.map((m) => [m.displayName, m.id]));
    function memberId(name: MemberName): string {
      const full = name === "Joris" ? "Joris Vaneck" : name;
      const id = memberByName.get(full);
      if (!id) throw new Error(`member not found: ${name}`);
      return id;
    }

    // -- People ------------------------------------------------------------
    const peopleSeed = [
      {
        key: "kessler",
        name: "Kessler Bau",
        contactName: "Martin Kessler",
        email: "m.kessler@kesslerbau.de",
        phone: "+49 211 664 208",
        kind: "customer" as const,
        standing: "over_terms" as const,
        sinceDate: "2021-01-01",
        relationshipSummary:
          "Client since 2021. Slow to pay, always pays. Two invoices are 62 days over. Ask about Martin's knee.",
        tags: ["balustrades", "Dusseldorf", "repeat"],
        attentionNote: "62 days over terms on €7,410, and a new job starts in September.",
      },
      {
        key: "ansems",
        name: "Ansems Architecten",
        contactName: "Wies Ansems",
        email: "wies@ansems.nl",
        phone: "+31 20 771 4402",
        kind: "customer" as const,
        standing: "current" as const,
        sinceDate: "2019-01-01",
        relationshipSummary:
          "Referred three of your last five customers. Specifies you by name in tender documents. Never been thanked.",
        tags: ["referrer", "architect", "Amsterdam"],
        attentionNote: "Source of three new customers this year. No thank-you has ever been sent.",
      },
      {
        key: "vermeer",
        name: "Vermeer Interieur",
        contactName: "Daan Vermeer",
        email: "daan@vermeerinterieur.nl",
        phone: "+31 20 442 9981",
        kind: "customer" as const,
        standing: "current" as const,
        sinceDate: "2022-01-01",
        relationshipSummary: "Shopfitting. Small, frequent jobs. Pays on the day the invoice arrives.",
        tags: ["shopfitting", "fast payer"],
        attentionNote: null,
      },
      {
        key: "haarlem",
        name: "Gemeente Haarlem",
        contactName: "Procurement desk",
        email: "inkoop@haarlem.nl",
        phone: "+31 23 511 5115",
        kind: "customer" as const,
        standing: "current" as const,
        sinceDate: "2023-01-01",
        relationshipSummary:
          "Public tender work. Slow, predictable, 60-day terms by contract. The balustrade quote is still open.",
        tags: ["public", "tender", "60-day terms"],
        attentionNote: null,
      },
      {
        key: "dijkman",
        name: "Dijkman Staal",
        contactName: "Rien Dijkman",
        email: "verkoop@dijkmanstaal.nl",
        phone: "+31 20 636 1180",
        kind: "supplier" as const,
        standing: "current" as const,
        sinceDate: "2014-01-01",
        relationshipSummary: "Supplier, not customer. Steel and section. Raised prices 6% on 12 July.",
        tags: ["supplier", "steel"],
        attentionNote: null,
      },
      {
        key: "brouwer",
        name: "Brouwer & Zn",
        contactName: "Ilse Brouwer",
        email: "ilse@brouwerenzn.nl",
        phone: "+31 72 512 3390",
        kind: "customer" as const,
        standing: "drifting" as const,
        sinceDate: "2018-01-01",
        relationshipSummary: "Ordered monthly until March last year, then stopped without a reason. No complaint was ever logged.",
        tags: ["dormant", "Alkmaar"],
        attentionNote: "Ordered monthly for four years, then nothing since March. Nobody asked why.",
      },
      {
        key: "polder",
        name: "Polderlicht BV",
        contactName: "Sanne de Wit",
        email: "sanne@polderlicht.nl",
        phone: "+31 20 208 7714",
        kind: "customer" as const,
        standing: "new" as const,
        sinceDate: "2026-01-01",
        relationshipSummary: "First job: 14 pendant frames, powder-coated. Came through Ansems.",
        tags: ["new", "lighting", "via Ansems"],
        attentionNote: null,
      },
      {
        key: "roest",
        name: "Roest Vastgoed",
        contactName: "Peter Roest",
        email: "p.roest@roestvastgoed.nl",
        phone: "+31 10 414 2200",
        kind: "customer" as const,
        standing: "current" as const,
        sinceDate: "2020-01-01",
        relationshipSummary: "Property developer. Three buildings a year, always in the second half.",
        tags: ["developer", "Rotterdam", "seasonal"],
        attentionNote: null,
      },
    ];
    const insertedPeople = await tx
      .insert(schema.people)
      .values(
        peopleSeed.map((p) => ({
          businessId: SEED_BUSINESS_ID,
          name: p.name,
          contactName: p.contactName,
          email: p.email,
          phone: p.phone,
          kind: p.kind,
          standing: p.standing,
          sinceDate: p.sinceDate,
          relationshipSummary: p.relationshipSummary,
          tags: p.tags,
          attentionNote: p.attentionNote,
        })),
      )
      .returning();
    const personId = new Map(peopleSeed.map((p, i) => [p.key, insertedPeople[i]!.id]));

    // -- Person company info -----------------------------------------------
    const companyInfoSeed = [
      {
        key: "kessler",
        address: "Bilker Allee 214, 40215 Düsseldorf",
        vatNumber: "DE 811 204 663",
        paymentTerms: "30 days",
        rhythmNote: "3–4 jobs a year, always Q1 and Q3",
        owner: "Joris" as MemberName,
      },
      {
        key: "ansems",
        address: "Prinsengracht 812, 1017 JL Amsterdam",
        vatNumber: "NL 8221 44 109 B01",
        paymentTerms: "14 days",
        rhythmNote: "Specifier, not a buyer. Sends work, rarely orders.",
        owner: "Joris" as MemberName,
      },
      {
        key: "vermeer",
        address: "Kinkerstraat 141, 1053 DZ Amsterdam",
        vatNumber: "NL 8598 12 004 B01",
        paymentTerms: "14 days",
        rhythmNote: "Small jobs, every 5–7 weeks",
        owner: "Marit" as MemberName,
      },
      {
        key: "haarlem",
        address: "Zijlvest 39, 2011 VB Haarlem",
        vatNumber: "NL 0023 61 405 B01",
        paymentTerms: "60 days, contractual",
        rhythmNote: "One tender a year, awarded in spring",
        owner: "Joris" as MemberName,
      },
      {
        key: "dijkman",
        address: "Tt. Melillaweg 8, 1046 AK Amsterdam",
        vatNumber: "NL 8014 22 771 B01",
        paymentTerms: "14 days, ours to them",
        rhythmNote: "Supplier. Weekly orders.",
        owner: "Ruben" as MemberName,
      },
      {
        key: "brouwer",
        address: "Helderseweg 22, 1815 AB Alkmaar",
        vatNumber: "NL 8102 55 318 B01",
        paymentTerms: "30 days",
        rhythmNote: "Was monthly. Nothing since March 2025.",
        owner: "Marit" as MemberName,
      },
      {
        key: "polder",
        address: "Distelweg 429, 1031 HD Amsterdam",
        vatNumber: "NL 8677 03 552 B01",
        paymentTerms: "30 days",
        rhythmNote: "First job. Asked about a second run in October.",
        owner: "Marit" as MemberName,
      },
      {
        key: "roest",
        address: "Wilhelminakade 179, 3072 AP Rotterdam",
        vatNumber: "NL 8199 47 226 B01",
        paymentTerms: "30 days",
        rhythmNote: "Three buildings a year, always H2",
        owner: "Joris" as MemberName,
      },
    ];
    await tx.insert(schema.personCompanyInfo).values(
      companyInfoSeed.map((c) => ({
        personId: personId.get(c.key)!,
        address: c.address,
        vatNumber: c.vatNumber,
        paymentTerms: c.paymentTerms,
        rhythmNote: c.rhythmNote,
        internalOwnerMemberId: memberId(c.owner),
      })),
    );
    const ownerOf = new Map(companyInfoSeed.map((c) => [c.key, c.owner]));

    // -- Invoices ------------------------------------------------------
    const invoiceSeed = [
      {
        ref: "VC-2026-118",
        person: "kessler",
        issuedAt: "2026-05-28",
        dueAt: "2026-06-27",
        amount: "4260.00",
        status: "over_terms" as const,
        daysOver: 62,
        jobDescription: "Balustrade, Oberkassel",
      },
      {
        ref: "VC-2026-109",
        person: "kessler",
        issuedAt: "2026-05-12",
        dueAt: "2026-06-11",
        amount: "3150.00",
        status: "over_terms" as const,
        daysOver: 78,
        jobDescription: "Handrail extension",
      },
      {
        ref: "VC-2026-141",
        person: "haarlem",
        issuedAt: "2026-07-02",
        dueAt: "2026-08-31",
        amount: "12160.00",
        status: "open" as const,
        daysOver: null,
        jobDescription: "Bridge railing, Spaarne",
      },
      {
        ref: "VC-2026-147",
        person: "vermeer",
        issuedAt: "2026-07-18",
        dueAt: "2026-08-17",
        amount: "4180.00",
        status: "open" as const,
        daysOver: null,
        jobDescription: "Shopfront frame, Kinkerstraat",
      },
      {
        ref: "VC-2026-149",
        person: "polder",
        issuedAt: "2026-07-24",
        dueAt: "2026-08-23",
        amount: "3900.00",
        status: "open" as const,
        daysOver: null,
        jobDescription: "14 pendant frames",
      },
      {
        ref: "VC-2026-136",
        person: "ansems",
        issuedAt: "2026-06-11",
        dueAt: "2026-07-11",
        amount: "22400.00",
        status: "paid" as const,
        daysOver: null,
        jobDescription: "Herengracht screens",
      },
      {
        ref: "VC-2026-128",
        person: "roest",
        issuedAt: "2026-05-27",
        dueAt: "2026-06-26",
        amount: "18900.00",
        status: "paid" as const,
        daysOver: null,
        jobDescription: "Stair cores, Katendrecht",
      },
      {
        ref: "VC-2026-151",
        person: "vermeer",
        issuedAt: null,
        dueAt: null,
        amount: "2740.00",
        status: "draft" as const,
        daysOver: null,
        jobDescription: "Counter frame, Javastraat",
      },
    ];
    await tx.insert(schema.invoices).values(
      invoiceSeed.map((i) => ({
        businessId: SEED_BUSINESS_ID,
        personId: personId.get(i.person)!,
        ref: i.ref,
        issuedAt: i.issuedAt,
        dueAt: i.dueAt,
        amount: i.amount,
        currency: "EUR",
        status: i.status,
        daysOver: i.daysOver,
        jobDescription: i.jobDescription,
      })),
    );

    // -- Figures -------------------------------------------------------
    await tx.insert(schema.figures).values([
      {
        businessId: SEED_BUSINESS_ID,
        key: "cash_on_hand",
        label: "Cash on hand",
        value: "62480.00",
        isCurrency: true,
        currency: "EUR",
        periodLabel: "as of this morning",
        deltaPct: "-4.20",
        deltaBasis: "vs 30 days ago",
        reading: "Most of the drop is the Dijkman steel order you paid on the 14th. Without it, cash is flat.",
        confidence: "known",
        receipt: {
          definition: "Cleared balance across all connected accounts",
          sources: ["Bunq", "ING", "Stripe"],
          window: "as of 29 Jul, 09:12",
          excluded: "2 pending card holds",
          syncedAt: "29 Jul, 06:40",
        },
      },
      {
        businessId: SEED_BUSINESS_ID,
        key: "invoiced_30d",
        label: "Invoiced, 30 days",
        value: "48320.00",
        isCurrency: true,
        currency: "EUR",
        periodLabel: "last 30 days",
        deltaPct: "12.40",
        deltaBasis: "vs prior 30 days",
        reading: null,
        confidence: "known",
        receipt: {
          definition: "Sum of issued invoices, excluding drafts and credit notes",
          sources: ["Invoices"],
          window: "30 Jun – 29 Jul",
          syncedAt: "29 Jul, 09:12",
        },
      },
      {
        businessId: SEED_BUSINESS_ID,
        key: "owed",
        label: "Owed to you",
        value: "19740.00",
        isCurrency: true,
        currency: "EUR",
        periodLabel: "outstanding now",
        deltaPct: null,
        deltaBasis: null,
        reading: "2 invoices over terms",
        confidence: "known",
        receipt: {
          definition: "Issued and unpaid, all ages",
          sources: ["Invoices", "Bunq"],
          window: "as of 29 Jul, 09:12",
          syncedAt: "29 Jul, 09:12",
        },
      },
      {
        businessId: SEED_BUSINESS_ID,
        key: "committed_14d",
        label: "Committed out, 14 days",
        value: "23110.00",
        isCurrency: true,
        currency: "EUR",
        periodLabel: "next 14 days",
        deltaPct: null,
        deltaBasis: null,
        reading: "payroll, Dijkman, rent",
        confidence: "estimated",
        receipt: {
          definition: "Scheduled payments plus recurring commitments",
          sources: ["Bunq", "Payroll", "Standing orders"],
          window: "29 Jul – 12 Aug",
          excluded: "variable material orders",
          syncedAt: "29 Jul, 06:40",
        },
      },
    ]);

    // -- Financial series points ------------------------------------------
    // Not seeded here (schema gap, deliberate for Phase 1): marginByWork,
    // funnelSteps, growthRows, reachPerformance, and the questions Q&A
    // pairs from lib/data/analytics.ts don't fit this table's single-value
    // shape or any other Milestone A table. The original architecture
    // proposal already scoped most of analytics.ts as query-time
    // computation over invoices/activities/people, not stored fixtures —
    // this just makes that gap concrete rather than silently dropping data.
    function monthDate(label: string): string | null {
      const m = MONTH_INDEX[label];
      return m ? isoDate(YEAR, m, 1) : null;
    }
    const seriesSeed: Array<{ seriesKey: string; label: string; value: string; annotation?: string }> = [
      { seriesKey: "cash", label: "Feb", value: "41200" },
      { seriesKey: "cash", label: "Mar", value: "47800" },
      { seriesKey: "cash", label: "Apr", value: "52400", annotation: "raised rates 8%" },
      { seriesKey: "cash", label: "May", value: "58900" },
      { seriesKey: "cash", label: "Jun", value: "65200" },
      { seriesKey: "cash", label: "Jul", value: "62480", annotation: "Dijkman order paid" },
      { seriesKey: "revenue", label: "Feb", value: "31400" },
      { seriesKey: "revenue", label: "Mar", value: "38900" },
      { seriesKey: "revenue", label: "Apr", value: "36200", annotation: "raised rates 8%" },
      { seriesKey: "revenue", label: "May", value: "44100" },
      { seriesKey: "revenue", label: "Jun", value: "43000" },
      { seriesKey: "revenue", label: "Jul", value: "48320" },
      { seriesKey: "prior_year", label: "Feb", value: "28900" },
      { seriesKey: "prior_year", label: "Mar", value: "31200" },
      { seriesKey: "prior_year", label: "Apr", value: "33800" },
      { seriesKey: "prior_year", label: "May", value: "35600" },
      { seriesKey: "prior_year", label: "Jun", value: "39400" },
      { seriesKey: "prior_year", label: "Jul", value: "37100" },
      { seriesKey: "hours_booked", label: "W28", value: "342" },
      { seriesKey: "hours_booked", label: "W29", value: "358" },
      { seriesKey: "hours_booked", label: "W30", value: "331" },
      { seriesKey: "hours_booked", label: "W31", value: "296" },
      { seriesKey: "hours_booked", label: "W32", value: "271", annotation: "next week" },
      { seriesKey: "hours_last_year", label: "W28", value: "318" },
      { seriesKey: "hours_last_year", label: "W29", value: "344" },
      { seriesKey: "hours_last_year", label: "W30", value: "352" },
      { seriesKey: "hours_last_year", label: "W31", value: "339" },
      { seriesKey: "hours_last_year", label: "W32", value: "331" },
      { seriesKey: "customer_counts", label: "Feb", value: "19" },
      { seriesKey: "customer_counts", label: "Mar", value: "20" },
      { seriesKey: "customer_counts", label: "Apr", value: "20" },
      { seriesKey: "customer_counts", label: "May", value: "22" },
      { seriesKey: "customer_counts", label: "Jun", value: "23" },
      { seriesKey: "customer_counts", label: "Jul", value: "24" },
      { seriesKey: "cashflow", label: "Feb", value: "41200" },
      { seriesKey: "cashflow", label: "Mar", value: "47800" },
      { seriesKey: "cashflow", label: "Apr", value: "52400", annotation: "raised rates 8%" },
      { seriesKey: "cashflow", label: "May", value: "58900" },
      { seriesKey: "cashflow", label: "Jun", value: "65200" },
      { seriesKey: "cashflow", label: "Jul", value: "62480", annotation: "Dijkman order" },
      { seriesKey: "cashflow", label: "Aug", value: "66100" },
      { seriesKey: "cashflow", label: "Sep", value: "71400" },
    ];
    await tx.insert(schema.financialSeriesPoints).values(
      seriesSeed.map((s) => ({
        businessId: SEED_BUSINESS_ID,
        seriesKey: s.seriesKey,
        label: s.label,
        periodDate: monthDate(s.label),
        value: s.value,
        annotation: s.annotation ?? null,
      })),
    );

    // -- Campaign seasons, campaigns, content ideas -------------------------
    const seasonSeed = [
      {
        key: "sep",
        name: "The September restart",
        intent: "Get specifiers thinking about Q4 fabrication slots before the schools go back.",
        startsAt: "2026-08-18",
        endsAt: "2026-09-30",
        state: "planning" as const,
      },
      {
        key: "summer",
        name: "Summer slowdown",
        intent: "Stay visible without selling. Two posts, no email.",
        startsAt: "2026-07-01",
        endsAt: "2026-08-17",
        state: "running" as const,
      },
      {
        key: "spring",
        name: "Spring rate change",
        intent: "Explain the 8% rate change before invoices arrived.",
        startsAt: "2026-03-15",
        endsAt: "2026-04-30",
        state: "closed" as const,
      },
    ];
    const insertedSeasons = await tx
      .insert(schema.campaignSeasons)
      .values(
        seasonSeed.map((s) => ({
          businessId: SEED_BUSINESS_ID,
          name: s.name,
          intent: s.intent,
          startsAt: s.startsAt,
          endsAt: s.endsAt,
          state: s.state,
        })),
      )
      .returning();
    const seasonIdByKey = new Map(seasonSeed.map((s, i) => [s.key, insertedSeasons[i]!.id]));

    const c1Gen = await insertAiGeneration({
      kind: "draft",
      outputText: "Written from your Voice. Waiting since Thursday.",
      status: "pending",
      targetType: "campaign",
    });
    const c2Gen = await insertAiGeneration({
      kind: "proposal",
      outputText: "Suggested because last September's build posts drove 31% of enquiries.",
      status: "pending",
      targetType: "campaign",
    });

    const campaignSeed = [
      {
        key: "c1",
        season: "sep",
        name: "September newsletter — first send",
        channel: "email" as const,
        status: "draft" as const,
        audienceCount: 412,
        byMachine: true,
        resultSummary: "Written from your Voice. Waiting since Thursday.",
        genId: c1Gen as string | null,
        sentAt: null as Date | null,
        openRate: null as string | null,
        enquiries: null as number | null,
      },
      {
        key: "c2",
        season: "sep",
        name: "Workshop photo set — Haarlem railing",
        channel: "post" as const,
        status: "proposed" as const,
        audienceCount: 0,
        byMachine: true,
        resultSummary: "Suggested because last September's build posts drove 31% of enquiries.",
        genId: c2Gen as string | null,
        sentAt: null as Date | null,
        openRate: null as string | null,
        enquiries: null as number | null,
      },
      {
        key: "c3",
        season: "summer",
        name: "Herengracht screens, finished",
        channel: "post" as const,
        status: "sent" as const,
        audienceCount: 0,
        byMachine: false,
        resultSummary: "3 enquiries, 1 became Polderlicht.",
        genId: null,
        sentAt: tsAt(2026, 7, 14),
        openRate: null,
        enquiries: 3,
      },
      {
        key: "c4",
        season: "summer",
        name: "Closed 2–9 August",
        channel: "email" as const,
        status: "sent" as const,
        audienceCount: 412,
        byMachine: false,
        resultSummary: "Informational. No enquiries expected.",
        genId: null,
        sentAt: tsAt(2026, 7, 1),
        openRate: "62.00",
        enquiries: 0,
      },
      {
        key: "c5",
        season: "spring",
        name: "Rate change explained",
        channel: "letter" as const,
        status: "sent" as const,
        audienceCount: 74,
        byMachine: false,
        resultSummary: "No customer left. Two asked for a call.",
        genId: null,
        sentAt: tsAt(2026, 3, 18),
        openRate: null,
        enquiries: 2,
      },
      {
        key: "c6",
        season: "spring",
        name: "Rate change — follow-up",
        channel: "email" as const,
        status: "sent" as const,
        audienceCount: 412,
        byMachine: false,
        resultSummary: "Six enquiries; four became jobs worth €31,400.",
        genId: null,
        sentAt: tsAt(2026, 4, 2),
        openRate: "58.00",
        enquiries: 6,
      },
    ];
    const insertedCampaigns = await tx
      .insert(schema.campaigns)
      .values(
        campaignSeed.map((c) => ({
          businessId: SEED_BUSINESS_ID,
          seasonId: seasonIdByKey.get(c.season)!,
          name: c.name,
          channel: c.channel,
          status: c.status,
          audienceCount: c.audienceCount,
          sentAt: c.sentAt,
          resultSummary: c.resultSummary,
          openRate: c.openRate,
          enquiries: c.enquiries,
          byMachine: c.byMachine,
          aiGenerationId: c.genId,
        })),
      )
      .returning();
    const campaignIdByKey = new Map(campaignSeed.map((c, i) => [c.key, insertedCampaigns[i]!.id]));

    const ideaSeed = [
      {
        title: "The Oberkassel balustrade, two years on",
        why: "Longevity posts drove the most enquiries in 2025. This one has patina now.",
      },
      {
        title: "How we measure a stair core in 40 minutes",
        why: "Specifiers ask this on every first call. Answer it once, publicly.",
      },
      {
        title: "Ruben on why we stopped taking gates",
        why: "Your most-read post of 2025 was also the bluntest one.",
      },
      {
        title: "Thank Ansems publicly",
        why: "Three of five new customers came through Wies this year.",
      },
    ];
    for (const idea of ideaSeed) {
      const genId = await insertAiGeneration({
        kind: "insight",
        outputText: idea.why,
        status: "pending",
        targetType: "content_idea",
      });
      await tx.insert(schema.contentIdeas).values({
        businessId: SEED_BUSINESS_ID,
        title: idea.title,
        why: idea.why,
        aiGenerationId: genId,
        status: "suggested",
      });
    }

    // -- Tasks -----------------------------------------------------------
    const priorityOf: Record<string, "now" | "soon" | "whenever"> = {
      t1: "now",
      t2: "now",
      t3: "soon",
      t4: "now",
      t5: "soon",
      t6: "soon",
      t7: "whenever",
      t8: "whenever",
      t9: "soon",
    };
    const taskSeed = [
      {
        key: "t1",
        title: "Requote Ansems — Herengracht phase two",
        detail: "Quoted 04 Jul at the old steel rate.",
        due: TODAY,
        owner: "Joris" as MemberName,
        room: "Ledger",
        done: false,
        proposed: true,
        amount: "1180.00",
      },
      {
        key: "t2",
        title: "Requote Vermeer — Javastraat counter frame",
        detail: "Quoted 08 Jul at the old steel rate.",
        due: TODAY,
        owner: "Joris" as MemberName,
        room: "Ledger",
        done: false,
        proposed: true,
        amount: "640.00",
      },
      {
        key: "t3",
        title: "Requote Haarlem balustrade",
        detail: "Public tender. Check whether the quote can still be amended.",
        due: TOMORROW,
        owner: "Joris" as MemberName,
        room: "Ledger",
        done: false,
        proposed: true,
        amount: "1020.00",
      },
      {
        key: "t4",
        title: "Call Martin Kessler",
        detail: "Ask about the knee before the invoice.",
        due: TODAY,
        owner: "Joris" as MemberName,
        room: "People",
        done: false,
        proposed: false,
        amount: null,
      },
      {
        key: "t5",
        title: "Book the powder coater for week 33",
        detail: "Polderlicht frames need to go out before the 14th.",
        due: THURSDAY,
        owner: "Ruben" as MemberName,
        room: "Work",
        done: false,
        proposed: false,
        amount: null,
      },
      {
        key: "t6",
        title: "Sign off Haarlem method statement",
        detail: null,
        due: FRIDAY,
        owner: "Joris" as MemberName,
        room: "Record",
        done: false,
        proposed: false,
        amount: null,
      },
      {
        key: "t7",
        title: "Order 40mm box section",
        detail: "New rate applies.",
        due: MONDAY,
        owner: "Ruben" as MemberName,
        room: "Ledger",
        done: false,
        proposed: false,
        amount: null,
      },
      {
        key: "t8",
        title: "Send Polderlicht the finish samples",
        detail: null,
        due: YESTERDAY,
        owner: "Marit" as MemberName,
        room: "People",
        done: true,
        proposed: false,
        amount: null,
      },
      {
        key: "t9",
        title: "Close July timesheets",
        detail: null,
        due: "2026-07-31",
        owner: "Marit" as MemberName,
        room: "Ledger",
        done: false,
        proposed: false,
        amount: null,
      },
    ];
    for (const t of taskSeed) {
      let genId: string | null = null;
      if (t.proposed) {
        genId = await insertAiGeneration({ kind: "move", outputText: t.title, status: "pending", targetType: "task" });
      }
      await tx.insert(schema.tasks).values({
        businessId: SEED_BUSINESS_ID,
        title: t.title,
        detail: t.detail,
        dueDate: t.due,
        ownerMemberId: memberId(t.owner),
        room: t.room,
        priority: priorityOf[t.key]!,
        done: t.done,
        proposed: t.proposed,
        amount: t.amount,
        aiGenerationId: genId,
      });
    }

    // -- Calendar events --------------------------------------------------
    // Unifies mock `upcoming`, `workCalendar` (work.ts) and `contentCalendar`
    // (reach.ts). Entries from workCalendar that duplicate an `upcoming`
    // entry (same event, calendar-grid annotation vs list view) are not
    // re-inserted.
    const calendarEventSeed = [
      {
        title: "Haarlem site measure",
        category: "work" as const,
        startsAt: tsAt(2026, 8, 4, 8, 0),
        endsAt: null as Date | null,
        who: "Joris, Ruben",
        whereLocation: "Spaarne bridge",
        tone: "neutral" as const,
        campaign: null as string | null,
      },
      {
        title: "Powder coater collection",
        category: "work" as const,
        startsAt: tsAt(2026, 8, 7, 9, 0),
        endsAt: null,
        who: "Ruben",
        whereLocation: "Van Egmond",
        tone: "neutral" as const,
        campaign: null,
      },
      {
        title: "Polderlicht delivery",
        category: "work" as const,
        startsAt: tsAt(2026, 8, 13, 9, 0),
        endsAt: null,
        who: "Marit",
        whereLocation: "Distelweg",
        tone: "neutral" as const,
        campaign: null,
      },
      {
        title: "Workshop closed",
        category: "work" as const,
        startsAt: tsAt(2026, 8, 2, 0, 0),
        endsAt: tsAt(2026, 8, 9, 23, 59),
        who: "Everyone",
        whereLocation: null,
        tone: "neutral" as const,
        campaign: null,
      },
      {
        title: "September newsletter goes out",
        category: "marketing" as const,
        startsAt: tsAt(2026, 8, 18, 7, 30),
        endsAt: null,
        who: "Joris",
        whereLocation: "412 people",
        tone: "neutral" as const,
        campaign: "c1",
      },
      {
        title: "Requotes due",
        category: "work" as const,
        startsAt: tsAt(2026, 8, 6, 9, 0),
        endsAt: null,
        who: null,
        whereLocation: null,
        tone: "machine" as const,
        campaign: null,
      },
      {
        title: "Roest kickoff",
        category: "work" as const,
        startsAt: tsAt(2026, 8, 26, 9, 0),
        endsAt: null,
        who: null,
        whereLocation: null,
        tone: "neutral" as const,
        campaign: null,
      },
      {
        title: "Workshop photo set",
        category: "marketing" as const,
        startsAt: tsAt(2026, 8, 4, 9, 0),
        endsAt: null,
        who: null,
        whereLocation: null,
        tone: "machine" as const,
        campaign: "c2",
      },
      {
        title: "Haarlem railing",
        category: "marketing" as const,
        startsAt: tsAt(2026, 8, 11, 9, 0),
        endsAt: null,
        who: null,
        whereLocation: null,
        tone: "neutral" as const,
        campaign: null,
      },
      {
        title: "Newsletter 1",
        category: "marketing" as const,
        startsAt: tsAt(2026, 8, 18, 9, 0),
        endsAt: null,
        who: null,
        whereLocation: null,
        tone: "sent" as const,
        campaign: "c1",
      },
      {
        title: "Behind the weld",
        category: "marketing" as const,
        startsAt: tsAt(2026, 8, 20, 9, 0),
        endsAt: null,
        who: null,
        whereLocation: null,
        tone: "machine" as const,
        campaign: null,
      },
      {
        title: "Newsletter 2",
        category: "marketing" as const,
        startsAt: tsAt(2026, 8, 26, 9, 0),
        endsAt: null,
        who: null,
        whereLocation: null,
        tone: "neutral" as const,
        campaign: null,
      },
    ];
    await tx.insert(schema.calendarEvents).values(
      calendarEventSeed.map((e) => ({
        businessId: SEED_BUSINESS_ID,
        category: e.category,
        title: e.title,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        who: e.who,
        whereLocation: e.whereLocation,
        campaignId: e.campaign ? campaignIdByKey.get(e.campaign)! : null,
        tone: e.tone,
      })),
    );

    // -- Activities (unifies mock threads + conversations) -----------------
    type ActivitySeed = {
      person: string;
      kind: (typeof schema.activityKindEnum.enumValues)[number];
      at: string;
      title: string;
      detail?: string | null;
      amount?: string | null;
      direction?: "in" | "out" | null;
      unanswered?: boolean | null;
      byMachine?: boolean;
    };
    const activitySeed: ActivitySeed[] = [
      // kessler thread
      { person: "kessler", kind: "note", at: "28 Jul", title: "Draft chase written", detail: "Warm, references the September job. Waiting for you.", byMachine: true },
      { person: "kessler", kind: "invoice", at: "28 May", title: "Invoice VC-2026-118 issued", amount: "4260.00", detail: "Balustrade, Oberkassel — 30-day terms" },
      { person: "kessler", kind: "invoice", at: "12 May", title: "Invoice VC-2026-109 issued", amount: "3150.00", detail: "Handrail extension, stair core" },
      { person: "kessler", kind: "call", at: "13 Jun", title: "You called Martin", detail: "Said payment run was moved to July. Knee surgery on the 20th." },
      { person: "kessler", kind: "payment", at: "02 Mar", title: "Paid VC-2026-071", amount: "9800.00", detail: "Six days after a phone call" },
      { person: "kessler", kind: "job", at: "14 Feb", title: "Oberkassel balustrade accepted", amount: "9800.00" },
      // ansems thread
      { person: "ansems", kind: "note", at: "29 Jul", title: "Three of five new customers traced to Ansems", detail: "Polderlicht, Vermeer and Haarlem all name Wies in first contact.", byMachine: true },
      { person: "ansems", kind: "email", at: "20 Jul", title: "Wies sent the Polderlicht drawings" },
      { person: "ansems", kind: "job", at: "11 Jun", title: "Herengracht screens delivered", amount: "22400.00" },
      { person: "ansems", kind: "payment", at: "14 Jun", title: "Paid in full", amount: "22400.00" },
      // brouwer thread
      { person: "brouwer", kind: "note", at: "29 Jul", title: "Dormant for 16 months", detail: "Last order 12 March 2025. Previously ordered every 4–6 weeks for four years.", byMachine: true },
      { person: "brouwer", kind: "invoice", at: "12 Mar 25", title: "Invoice VC-2025-044 issued", amount: "1980.00" },
      { person: "brouwer", kind: "payment", at: "19 Mar 25", title: "Paid VC-2025-044", amount: "1980.00" },
      // conversations
      { person: "kessler", kind: "email", at: "12 Jun", title: "Re: VC-2026-109", detail: "Payment run moved to July, I will confirm the week.", direction: "in" },
      { person: "kessler", kind: "call", at: "13 Jun", title: "Called Martin, 9 minutes", detail: "Knee surgery on the 20th. Asked to be chased by phone, not email.", direction: "out" },
      { person: "kessler", kind: "email", at: "02 Jul", title: "September frames — provisional dates", detail: "Sent the slot options. No reply.", direction: "out", unanswered: true },
      { person: "ansems", kind: "meeting", at: "20 Jul", title: "Polderlicht walkthrough", detail: "Wies brought the drawings and introduced Sanne directly.", direction: "in" },
      { person: "ansems", kind: "email", at: "22 Jul", title: "Herengracht photographs", detail: "Asked whether she may use our workshop photos in her portfolio.", direction: "in", unanswered: true },
      { person: "vermeer", kind: "email", at: "25 Jul", title: "Javastraat counter frame", detail: "Approved the drawing, asked for the finish sample first.", direction: "in" },
      { person: "haarlem", kind: "email", at: "08 Jul", title: "Spaarne railing — tender clarification", detail: "Procurement confirmed 60-day terms are contractual, not negotiable.", direction: "in" },
      { person: "brouwer", kind: "email", at: "12 Mar 25", title: "Order 44 confirmed", detail: "The last message either side sent.", direction: "out" },
      { person: "polder", kind: "call", at: "27 Jul", title: "Called Sanne, 4 minutes", detail: "Frames due before the 14th. She asked about a second run in October.", direction: "out" },
    ];
    const activityRows: (typeof schema.activities.$inferInsert)[] = [];
    for (const a of activitySeed) {
      const occurredAt = parseThreadDate(a.at);
      let genId: string | null = null;
      if (a.byMachine) {
        const owner = ownerOf.get(a.person) ?? "Joris";
        genId = await insertAiGeneration({
          kind: "draft",
          outputText: a.detail ?? a.title,
          status: "accepted",
          acceptedAt: occurredAt,
          acceptedByMemberId: memberId(owner),
          targetType: "activity",
        });
      }
      activityRows.push({
        businessId: SEED_BUSINESS_ID,
        personId: personId.get(a.person)!,
        kind: a.kind,
        occurredAt,
        title: a.title,
        detail: a.detail ?? null,
        amount: a.amount ?? null,
        direction: a.direction ?? null,
        unanswered: a.unanswered ?? null,
        byMachine: a.byMachine ?? false,
        aiGenerationId: genId,
        createdByMemberId: null,
      });
    }
    await tx.insert(schema.activities).values(activityRows);

    // -- Notes -------------------------------------------------------------
    const noteSeed = [
      {
        key: "n1",
        kind: "process" as const,
        title: "How we quote balustrades",
        body: "Metre rate plus fixings, plus 12% for site measure on anything above the second floor. Never quote a balustrade from drawings alone — Oberkassel cost us €2,100 in rework.",
        usedBy: "Quotes, The Table",
        byMachine: false,
      },
      {
        key: "n2",
        kind: "supplier" as const,
        title: "Dijkman price behaviour",
        body: "Raises in July and January, usually 4–6%. Gives no notice. Holds the old rate for orders already confirmed in writing.",
        usedBy: "Signals, Work",
        byMachine: true,
      },
      {
        key: "n3",
        kind: "pricing" as const,
        title: "The 2026 rate change",
        body: "Raised 8% across all fabrication in March. Explained by letter first, email second. No customer left. Revenue per job rose 11% by June.",
        usedBy: "Reach, The Long View",
        byMachine: false,
      },
      {
        key: "n4",
        kind: "decision" as const,
        title: "Why we stopped taking domestic gates",
        body: "Margin below 14% on every job in 2025, and they consume the small bay. Decision: refer to Brouwer, keep the relationship.",
        usedBy: "The Table",
        byMachine: false,
      },
      {
        key: "n5",
        kind: "person" as const,
        title: "Martin Kessler",
        body: "Pays late, always pays. Responds to a phone call, not an email. Knee surgery 20 June 2026. Ask before you invoice.",
        usedBy: "People, Moves",
        byMachine: false,
      },
      {
        key: "n6",
        kind: "supplier" as const,
        title: "Powder coating lead times",
        body: "Van Egmond needs 6 working days in summer, 9 in November. Book before the job is welded, not after.",
        usedBy: null,
        byMachine: false,
      },
    ];
    const insertedNotes: { id: string }[] = [];
    for (const n of noteSeed) {
      let genId: string | null = null;
      if (n.byMachine) {
        genId = await insertAiGeneration({
          kind: "insight",
          outputText: n.body,
          status: "accepted",
          acceptedAt: tsAt(2026, 7, 29),
          acceptedByMemberId: memberId("Joris"),
          targetType: "note",
        });
      }
      const [row] = await tx
        .insert(schema.notes)
        .values({
          businessId: SEED_BUSINESS_ID,
          title: n.title,
          kind: n.kind,
          body: n.body,
          usedBy: n.usedBy,
          byMachine: n.byMachine,
          aiGenerationId: genId,
        })
        .returning();
      insertedNotes.push(row!);
    }
    const noteIdByKey = new Map(noteSeed.map((n, i) => [n.key, insertedNotes[i]!.id]));

    // -- Documents + document links -----------------------------------------
    const docSeed = [
      {
        key: "d1",
        kind: "playbook" as const,
        title: "Balustrade quoting playbook",
        owner: "Joris" as MemberName,
        pinned: true,
        body: "Metre rate plus fixings, plus 12% for site measure above the second floor. Never quote from drawings alone. Confirm steel in writing on the day of quoting so the supplier holds the rate.",
        links: [{ note: "n2" }, { note: "n3" }] as ({ note: string } | { doc: string })[],
      },
      {
        key: "d2",
        kind: "process" as const,
        title: "Site measure method statement",
        owner: "Ruben" as MemberName,
        pinned: false,
        body: "Two people, always. Laser plus tape as a check. Photograph every fixing face. Anything above 6m needs the tower booked the week before.",
        links: [{ doc: "d1" }] as ({ note: string } | { doc: string })[],
      },
      {
        key: "d3",
        kind: "meeting" as const,
        title: "Monday production meeting — 28 July",
        owner: "Marit" as MemberName,
        pinned: false,
        body: "Polderlicht frames must reach Van Egmond by Thursday. Ruben flagged the 40mm box section is down to four lengths. Joris to requote the three open jobs at the new rate.",
        links: [{ note: "n6" }] as ({ note: string } | { doc: string })[],
      },
      {
        key: "d4",
        kind: "meeting" as const,
        title: "Monday production meeting — 21 July",
        owner: "Marit" as MemberName,
        pinned: false,
        body: "Herengracht signed off. Agreed to close 2–9 August. Marit to send the closure notice before the 1st.",
        links: [] as ({ note: string } | { doc: string })[],
      },
      {
        key: "d5",
        kind: "playbook" as const,
        title: "How we handle a late delivery",
        owner: "Joris" as MemberName,
        pinned: true,
        body: "Phone the customer the day we know, not the day it slips. Name the new date once and hold it. Never discount before being asked; if asked, discount the next job, not this one.",
        links: [] as ({ note: string } | { doc: string })[],
      },
      {
        key: "d6",
        kind: "document" as const,
        title: "Powder coating specification",
        owner: "Ruben" as MemberName,
        pinned: false,
        body: "RAL 7016 semi-matt as house standard. Zinc primer on anything exterior. Van Egmond needs 6 working days in summer, 9 in November.",
        links: [{ note: "n6" }] as ({ note: string } | { doc: string })[],
      },
      {
        key: "d7",
        kind: "document" as const,
        title: "Insurance and site cover",
        owner: "Marit" as MemberName,
        pinned: false,
        body: "Public liability to €2.5m, renewed each January. Tender work above €50k needs the certificate attached at submission.",
        links: [] as ({ note: string } | { doc: string })[],
      },
    ];
    const insertedDocs: { id: string }[] = [];
    for (const d of docSeed) {
      const [row] = await tx
        .insert(schema.documents)
        .values({
          businessId: SEED_BUSINESS_ID,
          title: d.title,
          kind: d.kind,
          ownerMemberId: memberId(d.owner),
          body: d.body,
          pinned: d.pinned,
        })
        .returning();
      insertedDocs.push(row!);
    }
    const docIdByKey = new Map(docSeed.map((d, i) => [d.key, insertedDocs[i]!.id]));

    const linkRows: (typeof schema.documentLinks.$inferInsert)[] = [];
    for (const d of docSeed) {
      for (const link of d.links) {
        linkRows.push({
          documentId: docIdByKey.get(d.key)!,
          linkedNoteId: "note" in link ? noteIdByKey.get(link.note)! : null,
          linkedDocumentId: "doc" in link ? docIdByKey.get(link.doc)! : null,
        });
      }
    }
    if (linkRows.length) {
      await tx.insert(schema.documentLinks).values(linkRows);
    }

    // -- Today signals/moves/marginNote + analytics insights ---------------
    // All standalone ai_generations rows (kind: signal/move/insight) — not
    // yet acted on in the fixture, so status stays "pending". No domain
    // fact exists for these until a user accepts one (Milestone D).
    const signalSeed = [
      { text: "Two invoices over 60 days now total €7,410. Both are Kessler Bau.", emphasis: ["€7,410"], room: "Ledger", href: "/ledger", at: "06:40" },
      { text: "Dijkman raised steel 6% on the 12th. Three open quotes still use the old rate.", emphasis: ["6%"], room: "Work", href: "/work", at: "06:41" },
      { text: "Workshop hours booked for next week are 18% below the same week last year.", emphasis: ["18%"], room: "The Long View", href: "/long-view", at: "06:41" },
      { text: "The September newsletter draft has been waiting since Thursday.", emphasis: null, room: "Reach", href: "/reach", at: "06:42" },
    ];
    for (const s of signalSeed) {
      await insertAiGeneration({
        kind: "signal",
        outputText: s.text,
        outputJson: { emphasis: s.emphasis, room: s.room, href: s.href, at: s.at },
        status: "pending",
        targetType: "today",
      });
    }

    const moveSeed = [
      {
        title: "Chase Kessler Bau for €7,410",
        why: "62 days over terms. They paid within a week the last two times you called, and a new job starts in September.",
        action: "Read the draft",
        href: "/people/kessler",
        amount: "7410.00",
        confidence: "known" as Confidence,
        primary: false,
      },
      {
        title: "Requote the three open jobs at the new steel rate",
        why: "Ansems, Vermeer and the Haarlem balustrade were quoted before the 12th. €2,840 of margin at risk if they are accepted as written.",
        action: "Open the quotes",
        href: "/work",
        amount: "2840.00",
        confidence: "estimated" as Confidence,
        primary: false,
      },
      {
        title: "Send the September newsletter",
        why: "Last September the second email produced 70% of the month's enquiries. The draft is written from your Voice and waiting.",
        action: "Read the draft",
        href: "/reach",
        amount: null,
        confidence: "known" as Confidence,
        primary: true,
      },
    ];
    for (const m of moveSeed) {
      await insertAiGeneration({
        kind: "move",
        outputText: m.title,
        outputJson: { why: m.why, action: m.action, href: m.href, amount: m.amount, primary: m.primary },
        confidence: m.confidence,
        status: "pending",
        targetType: "today",
      });
    }

    await insertAiGeneration({
      kind: "insight",
      outputText: "Three of your last five new customers came from Ansems Architecten. You have never thanked them.",
      outputJson: {
        actions: [
          { label: "Draft a note", href: "/table?seed=ansems-thanks" },
          { label: "Show me why", href: "/people/ansems" },
        ],
        quiet: "Nothing else worth saying this morning.",
      },
      confidence: "known",
      status: "pending",
      targetType: "today_margin",
    });

    const analyticsInsights = [
      { text: "Revenue per job rose 11% within three months of the March rate change, and no customer left.", confidence: "known" as Confidence },
      { text: "Balustrades take 41% of the workshop and return 38% of the margin. Shopfitting takes 22% and returns 9%.", confidence: "known" as Confidence },
      { text: "September is your strongest month three years running. Booked hours for next week are the softest since 2023.", confidence: "estimated" as Confidence },
      { text: "If the last four weeks hold, cash lands between €58k and €64k at month end.", confidence: "guessing" as Confidence },
    ];
    for (const i of analyticsInsights) {
      await insertAiGeneration({ kind: "insight", outputText: i.text, confidence: i.confidence, status: "pending", targetType: "analytics" });
    }
  });

  // -- Verification: row counts against the known mock totals --------------
  const counts = await Promise.all([
    db.$count(schema.people),
    db.$count(schema.invoices),
    db.$count(schema.campaigns),
    db.$count(schema.tasks),
    db.$count(schema.notes),
    db.$count(schema.documents),
    db.$count(schema.activities),
    db.$count(schema.aiGenerations),
  ]);
  const [people, invoices, campaigns, tasksCount, notes, documents, activities, aiGenerations] = counts;
  console.log("Seed complete:");
  console.log(`  people:          ${people} (expected 8)`);
  console.log(`  invoices:        ${invoices} (expected 8)`);
  console.log(`  campaigns:       ${campaigns} (expected 6)`);
  console.log(`  tasks:           ${tasksCount} (expected 9)`);
  console.log(`  notes:           ${notes} (expected 6)`);
  console.log(`  documents:       ${documents} (expected 7)`);
  console.log(`  activities:      ${activities} (expected 22 = 13 thread entries + 9 conversations)`);
  console.log(`  ai_generations:  ${aiGenerations}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await queryClient.end();
  });
