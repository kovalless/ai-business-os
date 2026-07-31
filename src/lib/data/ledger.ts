import type { Invoice, FigureData, SeriesPoint } from "@/lib/types";

export const invoices: Invoice[] = [
  { id: "i1", ref: "VC-2026-118", personId: "kessler", person: "Kessler Bau", issued: "28 May", due: "27 Jun", amount: 4260, status: "over terms", daysOver: 62, job: "Balustrade, Oberkassel" },
  { id: "i2", ref: "VC-2026-109", personId: "kessler", person: "Kessler Bau", issued: "12 May", due: "11 Jun", amount: 3150, status: "over terms", daysOver: 78, job: "Handrail extension" },
  { id: "i3", ref: "VC-2026-141", personId: "haarlem", person: "Gemeente Haarlem", issued: "02 Jul", due: "31 Aug", amount: 12160, status: "open", job: "Bridge railing, Spaarne" },
  { id: "i4", ref: "VC-2026-147", personId: "vermeer", person: "Vermeer Interieur", issued: "18 Jul", due: "17 Aug", amount: 4180, status: "open", job: "Shopfront frame, Kinkerstraat" },
  { id: "i5", ref: "VC-2026-149", personId: "polder", person: "Polderlicht BV", issued: "24 Jul", due: "23 Aug", amount: 3900, status: "open", job: "14 pendant frames" },
  { id: "i6", ref: "VC-2026-136", personId: "ansems", person: "Ansems Architecten", issued: "11 Jun", due: "11 Jul", amount: 22400, status: "paid", job: "Herengracht screens" },
  { id: "i7", ref: "VC-2026-128", personId: "roest", person: "Roest Vastgoed", issued: "27 May", due: "26 Jun", amount: 18900, status: "paid", job: "Stair cores, Katendrecht" },
  { id: "i8", ref: "VC-2026-151", personId: "vermeer", person: "Vermeer Interieur", issued: "\u2014", due: "\u2014", amount: 2740, status: "draft", job: "Counter frame, Javastraat" },
];

export const standing: FigureData = {
  id: "cash",
  label: "Cash on hand",
  value: 62480,
  currency: true,
  period: "as of this morning",
  delta: { pct: -4.2, basis: "vs 30 days ago" },
  reading: "Most of the drop is the Dijkman steel order you paid on the 14th. Without it, cash is flat.",
  confidence: "known",
  receipt: {
    definition: "Cleared balance across all connected accounts",
    sources: ["Bunq", "ING", "Stripe"],
    window: "as of 29 Jul, 09:12",
    excluded: "2 pending card holds",
    syncedAt: "29 Jul, 06:40",
  },
};

export const supporting: FigureData[] = [
  {
    id: "invoiced",
    label: "Invoiced, 30 days",
    value: 48320,
    currency: true,
    period: "last 30 days",
    delta: { pct: 12.4, basis: "vs prior 30 days" },
    confidence: "known",
    receipt: { definition: "Sum of issued invoices, excluding drafts and credit notes", sources: ["Invoices"], window: "30 Jun \u2013 29 Jul", syncedAt: "29 Jul, 09:12" },
  },
  {
    id: "owed",
    label: "Owed to you",
    value: 19740,
    currency: true,
    period: "outstanding now",
    reading: "2 invoices over terms",
    confidence: "known",
    receipt: { definition: "Issued and unpaid, all ages", sources: ["Invoices", "Bunq"], window: "as of 29 Jul, 09:12", syncedAt: "29 Jul, 09:12" },
  },
  {
    id: "committed",
    label: "Committed out, 14 days",
    value: 23110,
    currency: true,
    period: "next 14 days",
    reading: "payroll, Dijkman, rent",
    confidence: "estimated",
    receipt: { definition: "Scheduled payments plus recurring commitments", sources: ["Bunq", "Payroll", "Standing orders"], window: "29 Jul \u2013 12 Aug", excluded: "variable material orders", syncedAt: "29 Jul, 06:40" },
  },
];

export const cashSeries: SeriesPoint[] = [
  { label: "Feb", value: 41200 },
  { label: "Mar", value: 47800 },
  { label: "Apr", value: 52400, annotation: "raised rates 8%" },
  { label: "May", value: 58900 },
  { label: "Jun", value: 65200 },
  { label: "Jul", value: 62480, annotation: "Dijkman order paid" },
];

export const revenueSeries: SeriesPoint[] = [
  { label: "Feb", value: 31400 },
  { label: "Mar", value: 38900 },
  { label: "Apr", value: 36200, annotation: "raised rates 8%" },
  { label: "May", value: 44100 },
  { label: "Jun", value: 43000 },
  { label: "Jul", value: 48320 },
];

export const priorYearSeries: SeriesPoint[] = [
  { label: "Feb", value: 28900 },
  { label: "Mar", value: 31200 },
  { label: "Apr", value: 33800 },
  { label: "May", value: 35600 },
  { label: "Jun", value: 39400 },
  { label: "Jul", value: 37100 },
];
