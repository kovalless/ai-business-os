import type { Room } from "@/lib/types";

// Static navigation config, not tenant data — there's no "rooms" table
// and there shouldn't be one; this is app chrome structure, the same
// category as a constant like SHORT_MONTHS. Moved out of the mock
// @/lib/data barrel so the shell (Rail, Shortcuts, Aperture) can drop
// its last dependency on mock fixtures without pretending this needs a
// database query.
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
