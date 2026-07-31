import type { Room } from "@/lib/types";

export const business = {
  name: "Vaneck & Co",
  trade: "Architectural metalwork",
  city: "Amsterdam-Noord",
  since: 2014,
  people: 11,
  owner: "Joris Vaneck",
  pinned: { label: "Cash on hand", value: 62480 },
  voice: [
    "Short sentences. First person plural.",
    "Never uses the word premium.",
    "Names the maker on every job.",
    "Sells on tolerance and finish, not on price.",
    "Apologises directly when a delivery slips.",
  ],
};

export const rooms: Room[] = [
  { key: "today", href: "/today", name: "Today", icon: "sun", hint: "Where you stand" },
  { key: "table", href: "/table", name: "The Table", icon: "pen", hint: "Work with the machine" },
  { key: "people", href: "/people", name: "Customers", icon: "users", hint: "Everyone you know" },
  { key: "reach", href: "/reach", name: "Marketing", icon: "send", hint: "What goes out" },
  { key: "work", href: "/work", name: "Tasks", icon: "check", hint: "What is owed and by whom" },
  { key: "ledger", href: "/ledger", name: "Ledger", icon: "coins", hint: "Money in and out" },
  { key: "record", href: "/record", name: "Knowledge Base", icon: "book", hint: "What the business knows" },
  { key: "long-view", href: "/long-view", name: "Analytics", icon: "chart", hint: "Time and trend" },
];
