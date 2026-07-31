import type { Signal, Move } from "@/lib/types";

export const statement = "Since you closed on Monday evening \u2014";

export const signals: Signal[] = [
  { id: "s1", text: "Two invoices over 60 days now total \u20AC7,410. Both are Kessler Bau.", emphasis: ["\u20AC7,410"], room: "Ledger", href: "/ledger", at: "06:40" },
  { id: "s2", text: "Dijkman raised steel 6% on the 12th. Three open quotes still use the old rate.", emphasis: ["6%"], room: "Work", href: "/work", at: "06:41" },
  { id: "s3", text: "Workshop hours booked for next week are 18% below the same week last year.", emphasis: ["18%"], room: "The Long View", href: "/long-view", at: "06:41" },
  { id: "s4", text: "The September newsletter draft has been waiting since Thursday.", room: "Reach", href: "/reach", at: "06:42" },
];

export const moves: Move[] = [
  {
    id: "m1",
    title: "Chase Kessler Bau for \u20AC7,410",
    why: "62 days over terms. They paid within a week the last two times you called, and a new job starts in September.",
    action: "Read the draft",
    href: "/people/kessler",
    amount: 7410,
    confidence: "known",
  },
  {
    id: "m2",
    title: "Requote the three open jobs at the new steel rate",
    why: "Ansems, Vermeer and the Haarlem balustrade were quoted before the 12th. \u20AC2,840 of margin at risk if they are accepted as written.",
    action: "Open the quotes",
    href: "/work",
    amount: 2840,
    confidence: "estimated",
  },
  {
    id: "m3",
    title: "Send the September newsletter",
    why: "Last September the second email produced 70% of the month's enquiries. The draft is written from your Voice and waiting.",
    action: "Read the draft",
    href: "/reach",
    primary: true,
    confidence: "known",
  },
];

export const marginNote = {
  text: "Three of your last five new customers came from Ansems Architecten. You have never thanked them.",
  confidence: "known" as const,
  actions: [
    { label: "Draft a note", href: "/table?seed=ansems-thanks" },
    { label: "Show me why", href: "/people/ansems" },
  ],
  quiet: "Nothing else worth saying this morning.",
};
