import type { Campaign } from "@/lib/types";

export const seasons = [
  { id: "sep", name: "The September restart", intent: "Get specifiers thinking about Q4 fabrication slots before the schools go back.", dates: "18 Aug \u2013 30 Sep", state: "planning" },
  { id: "summer", name: "Summer slowdown", intent: "Stay visible without selling. Two posts, no email.", dates: "01 Jul \u2013 17 Aug", state: "running" },
  { id: "spring", name: "Spring rate change", intent: "Explain the 8% rate change before invoices arrived.", dates: "15 Mar \u2013 30 Apr", state: "closed" },
];

export const campaigns: Campaign[] = [
  { id: "c1", season: "sep", name: "September newsletter \u2014 first send", channel: "email", status: "draft", audience: 412, byMachine: true, result: "Written from your Voice. Waiting since Thursday." },
  { id: "c2", season: "sep", name: "Workshop photo set \u2014 Haarlem railing", channel: "post", status: "proposed", audience: 0, byMachine: true, result: "Suggested because last September's build posts drove 31% of enquiries." },
  { id: "c3", season: "summer", name: "Herengracht screens, finished", channel: "post", status: "sent", audience: 0, sentAt: "14 Jul", enquiries: 3, result: "3 enquiries, 1 became Polderlicht." },
  { id: "c4", season: "summer", name: "Closed 2\u20139 August", channel: "email", status: "sent", audience: 412, sentAt: "01 Jul", openRate: 62, enquiries: 0, result: "Informational. No enquiries expected." },
  { id: "c5", season: "spring", name: "Rate change explained", channel: "letter", status: "sent", audience: 74, sentAt: "18 Mar", enquiries: 2, result: "No customer left. Two asked for a call." },
  { id: "c6", season: "spring", name: "Rate change \u2014 follow-up", channel: "email", status: "sent", audience: 412, sentAt: "02 Apr", openRate: 58, enquiries: 6, result: "Six enquiries; four became jobs worth \u20AC31,400." },
];

export const contentCalendar = [
  { day: 4, label: "Workshop photo set", tone: "machine" as const },
  { day: 11, label: "Haarlem railing", tone: "neutral" as const },
  { day: 18, label: "Newsletter 1", tone: "sent" as const },
  { day: 20, label: "Behind the weld", tone: "machine" as const },
  { day: 26, label: "Newsletter 2", tone: "neutral" as const },
];

export const ideas = [
  { id: "id1", title: "The Oberkassel balustrade, two years on", why: "Longevity posts drove the most enquiries in 2025. This one has patina now.", machine: true },
  { id: "id2", title: "How we measure a stair core in 40 minutes", why: "Specifiers ask this on every first call. Answer it once, publicly.", machine: true },
  { id: "id3", title: "Ruben on why we stopped taking gates", why: "Your most-read post of 2025 was also the bluntest one.", machine: true },
  { id: "id4", title: "Thank Ansems publicly", why: "Three of five new customers came through Wies this year.", machine: true },
];

export const reachPerformance = [
  { label: "September 2025", sent: 2, opened: 61, enquiries: 9, jobs: 4, value: 41200 },
  { label: "Spring 2026", sent: 2, opened: 58, enquiries: 8, jobs: 4, value: 31400 },
  { label: "Summer 2026", sent: 2, opened: 62, enquiries: 3, jobs: 1, value: 3900 },
];
