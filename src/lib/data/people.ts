import type { Person, ThreadEntry } from "@/lib/types";

export const people: Person[] = [
  {
    id: "kessler",
    name: "Kessler Bau",
    contact: "Martin Kessler",
    email: "m.kessler@kesslerbau.de",
    phone: "+49 211 664 208",
    since: "2021",
    lifetime: 41200,
    outstanding: 7410,
    lastContactDays: 47,
    standing: "over terms",
    relationship:
      "Client since 2021. Slow to pay, always pays. Two invoices are 62 days over. Ask about Martin's knee.",
    tags: ["balustrades", "Dusseldorf", "repeat"],
    attention: "62 days over terms on \u20AC7,410, and a new job starts in September.",
  },
  {
    id: "ansems",
    name: "Ansems Architecten",
    contact: "Wies Ansems",
    email: "wies@ansems.nl",
    phone: "+31 20 771 4402",
    since: "2019",
    lifetime: 128400,
    outstanding: 0,
    lastContactDays: 9,
    standing: "current",
    relationship:
      "Referred three of your last five customers. Specifies you by name in tender documents. Never been thanked.",
    tags: ["referrer", "architect", "Amsterdam"],
    attention: "Source of three new customers this year. No thank-you has ever been sent.",
  },
  {
    id: "vermeer",
    name: "Vermeer Interieur",
    contact: "Daan Vermeer",
    email: "daan@vermeerinterieur.nl",
    phone: "+31 20 442 9981",
    since: "2022",
    lifetime: 34750,
    outstanding: 4180,
    lastContactDays: 4,
    standing: "current",
    relationship: "Shopfitting. Small, frequent jobs. Pays on the day the invoice arrives.",
    tags: ["shopfitting", "fast payer"],
  },
  {
    id: "haarlem",
    name: "Gemeente Haarlem",
    contact: "Procurement desk",
    email: "inkoop@haarlem.nl",
    phone: "+31 23 511 5115",
    since: "2023",
    lifetime: 61900,
    outstanding: 12160,
    lastContactDays: 21,
    standing: "current",
    relationship:
      "Public tender work. Slow, predictable, 60-day terms by contract. The balustrade quote is still open.",
    tags: ["public", "tender", "60-day terms"],
  },
  {
    id: "dijkman",
    name: "Dijkman Staal",
    contact: "Rien Dijkman",
    email: "verkoop@dijkmanstaal.nl",
    phone: "+31 20 636 1180",
    since: "2014",
    lifetime: 0,
    outstanding: 0,
    lastContactDays: 15,
    standing: "current",
    relationship: "Supplier, not customer. Steel and section. Raised prices 6% on 12 July.",
    tags: ["supplier", "steel"],
  },
  {
    id: "brouwer",
    name: "Brouwer & Zn",
    contact: "Ilse Brouwer",
    email: "ilse@brouwerenzn.nl",
    phone: "+31 72 512 3390",
    since: "2018",
    lifetime: 52300,
    outstanding: 0,
    lastContactDays: 214,
    standing: "drifting",
    relationship:
      "Ordered monthly until March last year, then stopped without a reason. No complaint was ever logged.",
    tags: ["dormant", "Alkmaar"],
    attention: "Ordered monthly for four years, then nothing since March. Nobody asked why.",
  },
  {
    id: "polder",
    name: "Polderlicht BV",
    contact: "Sanne de Wit",
    email: "sanne@polderlicht.nl",
    phone: "+31 20 208 7714",
    since: "2026",
    lifetime: 3900,
    outstanding: 3900,
    lastContactDays: 2,
    standing: "new",
    relationship: "First job: 14 pendant frames, powder-coated. Came through Ansems.",
    tags: ["new", "lighting", "via Ansems"],
  },
  {
    id: "roest",
    name: "Roest Vastgoed",
    contact: "Peter Roest",
    email: "p.roest@roestvastgoed.nl",
    phone: "+31 10 414 2200",
    since: "2020",
    lifetime: 87600,
    outstanding: 0,
    lastContactDays: 63,
    standing: "current",
    relationship: "Property developer. Three buildings a year, always in the second half.",
    tags: ["developer", "Rotterdam", "seasonal"],
  },
];

export const threads: Record<string, ThreadEntry[]> = {
  kessler: [
    { id: "k1", kind: "note", at: "28 Jul", title: "Draft chase written", detail: "Warm, references the September job. Waiting for you.", byMachine: true },
    { id: "k2", kind: "invoice", at: "28 May", title: "Invoice VC-2026-118 issued", amount: 4260, detail: "Balustrade, Oberkassel \u2014 30-day terms" },
    { id: "k3", kind: "invoice", at: "12 May", title: "Invoice VC-2026-109 issued", amount: 3150, detail: "Handrail extension, stair core" },
    { id: "k4", kind: "call", at: "13 Jun", title: "You called Martin", detail: "Said payment run was moved to July. Knee surgery on the 20th." },
    { id: "k5", kind: "payment", at: "02 Mar", title: "Paid VC-2026-071", amount: 9800, detail: "Six days after a phone call" },
    { id: "k6", kind: "job", at: "14 Feb", title: "Oberkassel balustrade accepted", amount: 9800 },
  ],
  ansems: [
    { id: "a1", kind: "note", at: "29 Jul", title: "Three of five new customers traced to Ansems", detail: "Polderlicht, Vermeer and Haarlem all name Wies in first contact.", byMachine: true },
    { id: "a2", kind: "email", at: "20 Jul", title: "Wies sent the Polderlicht drawings" },
    { id: "a3", kind: "job", at: "11 Jun", title: "Herengracht screens delivered", amount: 22400 },
    { id: "a4", kind: "payment", at: "14 Jun", title: "Paid in full", amount: 22400 },
  ],
  brouwer: [
    { id: "b1", kind: "note", at: "29 Jul", title: "Dormant for 16 months", detail: "Last order 12 March 2025. Previously ordered every 4\u20136 weeks for four years.", byMachine: true },
    { id: "b2", kind: "invoice", at: "12 Mar 25", title: "Invoice VC-2025-044 issued", amount: 1980 },
    { id: "b3", kind: "payment", at: "19 Mar 25", title: "Paid VC-2025-044", amount: 1980 },
  ],
};

export type Conversation = {
  id: string;
  personId: string;
  channel: "email" | "call" | "meeting";
  at: string;
  subject: string;
  excerpt: string;
  direction: "in" | "out";
  unanswered?: boolean;
};

export const conversations: Conversation[] = [
  { id: "cv1", personId: "kessler", channel: "email", at: "12 Jun", subject: "Re: VC-2026-109", excerpt: "Payment run moved to July, I will confirm the week.", direction: "in" },
  { id: "cv2", personId: "kessler", channel: "call", at: "13 Jun", subject: "Called Martin, 9 minutes", excerpt: "Knee surgery on the 20th. Asked to be chased by phone, not email.", direction: "out" },
  { id: "cv3", personId: "kessler", channel: "email", at: "02 Jul", subject: "September frames \u2014 provisional dates", excerpt: "Sent the slot options. No reply.", direction: "out", unanswered: true },
  { id: "cv4", personId: "ansems", channel: "meeting", at: "20 Jul", subject: "Polderlicht walkthrough", excerpt: "Wies brought the drawings and introduced Sanne directly.", direction: "in" },
  { id: "cv5", personId: "ansems", channel: "email", at: "22 Jul", subject: "Herengracht photographs", excerpt: "Asked whether she may use our workshop photos in her portfolio.", direction: "in", unanswered: true },
  { id: "cv6", personId: "vermeer", channel: "email", at: "25 Jul", subject: "Javastraat counter frame", excerpt: "Approved the drawing, asked for the finish sample first.", direction: "in" },
  { id: "cv7", personId: "haarlem", channel: "email", at: "08 Jul", subject: "Spaarne railing \u2014 tender clarification", excerpt: "Procurement confirmed 60-day terms are contractual, not negotiable.", direction: "in" },
  { id: "cv8", personId: "brouwer", channel: "email", at: "12 Mar 25", subject: "Order 44 confirmed", excerpt: "The last message either side sent.", direction: "out" },
  { id: "cv9", personId: "polder", channel: "call", at: "27 Jul", subject: "Called Sanne, 4 minutes", excerpt: "Frames due before the 14th. She asked about a second run in October.", direction: "out" },
];

export const companyInfo: Record<
  string,
  { address: string; vat: string; terms: string; rhythm: string; owner: string }
> = {
  kessler: { address: "Bilker Allee 214, 40215 D\u00FCsseldorf", vat: "DE 811 204 663", terms: "30 days", rhythm: "3\u20134 jobs a year, always Q1 and Q3", owner: "Joris" },
  ansems: { address: "Prinsengracht 812, 1017 JL Amsterdam", vat: "NL 8221 44 109 B01", terms: "14 days", rhythm: "Specifier, not a buyer. Sends work, rarely orders.", owner: "Joris" },
  vermeer: { address: "Kinkerstraat 141, 1053 DZ Amsterdam", vat: "NL 8598 12 004 B01", terms: "14 days", rhythm: "Small jobs, every 5\u20137 weeks", owner: "Marit" },
  haarlem: { address: "Zijlvest 39, 2011 VB Haarlem", vat: "NL 0023 61 405 B01", terms: "60 days, contractual", rhythm: "One tender a year, awarded in spring", owner: "Joris" },
  dijkman: { address: "Tt. Melillaweg 8, 1046 AK Amsterdam", vat: "NL 8014 22 771 B01", terms: "14 days, ours to them", rhythm: "Supplier. Weekly orders.", owner: "Ruben" },
  brouwer: { address: "Helderseweg 22, 1815 AB Alkmaar", vat: "NL 8102 55 318 B01", terms: "30 days", rhythm: "Was monthly. Nothing since March 2025.", owner: "Marit" },
  polder: { address: "Distelweg 429, 1031 HD Amsterdam", vat: "NL 8677 03 552 B01", terms: "30 days", rhythm: "First job. Asked about a second run in October.", owner: "Marit" },
  roest: { address: "Wilhelminakade 179, 3072 AP Rotterdam", vat: "NL 8199 47 226 B01", terms: "30 days", rhythm: "Three buildings a year, always H2", owner: "Joris" },
};
