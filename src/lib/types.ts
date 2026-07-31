export type Confidence = "known" | "estimated" | "guessing";

export type Room = {
  key: string;
  href: string;
  name: string;
  icon: string;
  hint: string;
};

export type Receipt = {
  definition: string;
  sources: string[];
  window: string;
  excluded?: string;
  syncedAt: string;
};

export type FigureData = {
  id: string;
  label: string;
  value: number;
  currency?: boolean;
  unit?: string;
  period: string;
  delta?: { pct: number; basis: string };
  reading?: string;
  receipt: Receipt;
  confidence?: Confidence;
};

export type Signal = {
  id: string;
  text: string;
  emphasis?: string[];
  room: string;
  href: string;
  at: string;
};

export type Move = {
  id: string;
  title: string;
  why: string;
  action: string;
  href: string;
  primary?: boolean;
  amount?: number;
  confidence: Confidence;
};

export type Person = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  since: string;
  lifetime: number;
  outstanding: number;
  lastContactDays: number;
  standing: "current" | "over terms" | "drifting" | "new";
  relationship: string;
  tags: string[];
  attention?: string;
};

export type ThreadEntry = {
  id: string;
  kind: "invoice" | "email" | "call" | "note" | "job" | "payment" | "quote";
  at: string;
  title: string;
  detail?: string;
  amount?: number;
  byMachine?: boolean;
};

export type Invoice = {
  id: string;
  ref: string;
  personId: string;
  person: string;
  issued: string;
  due: string;
  amount: number;
  status: "paid" | "open" | "over terms" | "draft";
  daysOver?: number;
  job: string;
};

export type Campaign = {
  id: string;
  season: string;
  name: string;
  channel: "email" | "post" | "letter";
  status: "sent" | "scheduled" | "draft" | "proposed";
  audience: number;
  sentAt?: string;
  result?: string;
  openRate?: number;
  enquiries?: number;
  byMachine?: boolean;
};

export type Task = {
  id: string;
  title: string;
  detail?: string;
  due: string;
  owner: string;
  room: string;
  done: boolean;
  proposed?: boolean;
  amount?: number;
};

export type Note = {
  id: string;
  title: string;
  kind: "process" | "supplier" | "pricing" | "decision" | "person";
  updated: string;
  body: string;
  usedBy?: string;
  byMachine?: boolean;
};

export type SeriesPoint = { label: string; value: number; annotation?: string };
