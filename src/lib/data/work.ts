import type { Task } from "@/lib/types";

export const tasks: Task[] = [
  { id: "t1", title: "Requote Ansems \u2014 Herengracht phase two", detail: "Quoted 04 Jul at the old steel rate.", due: "Today", owner: "Joris", room: "Ledger", done: false, proposed: true, amount: 1180 },
  { id: "t2", title: "Requote Vermeer \u2014 Javastraat counter frame", detail: "Quoted 08 Jul at the old steel rate.", due: "Today", owner: "Joris", room: "Ledger", done: false, proposed: true, amount: 640 },
  { id: "t3", title: "Requote Haarlem balustrade", detail: "Public tender. Check whether the quote can still be amended.", due: "Tomorrow", owner: "Joris", room: "Ledger", done: false, proposed: true, amount: 1020 },
  { id: "t4", title: "Call Martin Kessler", detail: "Ask about the knee before the invoice.", due: "Today", owner: "Joris", room: "People", done: false },
  { id: "t5", title: "Book the powder coater for week 33", detail: "Polderlicht frames need to go out before the 14th.", due: "Thursday", owner: "Ruben", room: "Work", done: false },
  { id: "t6", title: "Sign off Haarlem method statement", due: "Friday", owner: "Joris", room: "Record", done: false },
  { id: "t7", title: "Order 40mm box section", detail: "New rate applies.", due: "Monday", owner: "Ruben", room: "Ledger", done: false },
  { id: "t8", title: "Send Polderlicht the finish samples", due: "Yesterday", owner: "Marit", room: "People", done: true },
  { id: "t9", title: "Close July timesheets", due: "31 Jul", owner: "Marit", room: "Ledger", done: false },
];

export type Priority = "now" | "soon" | "whenever";

export const priorityOf: Record<string, Priority> = {
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

export const upcoming = [
  { id: "u1", title: "Haarlem site measure", when: "Mon 4 Aug, 08:00", who: "Joris, Ruben", where: "Spaarne bridge" },
  { id: "u2", title: "Powder coater collection", when: "Thu 7 Aug", who: "Ruben", where: "Van Egmond" },
  { id: "u3", title: "Polderlicht delivery", when: "Wed 13 Aug", who: "Marit", where: "Distelweg" },
  { id: "u4", title: "Workshop closed", when: "2\u20139 Aug", who: "Everyone", where: "\u2014" },
  { id: "u5", title: "September newsletter goes out", when: "Tue 18 Aug, 07:30", who: "Joris", where: "412 people" },
];

export const workCalendar = [
  { day: 4, label: "Haarlem measure" },
  { day: 6, label: "Requotes due", tone: "machine" as const },
  { day: 7, label: "Van Egmond" },
  { day: 13, label: "Polderlicht out" },
  { day: 18, label: "Newsletter", tone: "machine" as const },
  { day: 2, label: "Closed" },
  { day: 5, label: "Closed" },
  { day: 8, label: "Closed" },
  { day: 26, label: "Roest kickoff" },
];
