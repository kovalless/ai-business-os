import type { SeriesPoint } from "@/lib/types";

export const questions = [
  { id: "q1", q: "Am I making more than last year?", answer: "Yes. Invoiced \u20AC48,320 in the last 30 days, 30% above the same 30 days last year." },
  { id: "q2", q: "Which work actually makes money?", answer: "Balustrades and stair cores. Shopfitting is 22% of hours and 9% of margin." },
  { id: "q3", q: "What happened after the rate change?", answer: "No customer left. Revenue per job rose 11% within three months." },
  { id: "q4", q: "Which customers are quietly leaving?", answer: "One. Brouwer & Zn ordered monthly for four years and has not ordered since March." },
];

export const hoursBooked: SeriesPoint[] = [
  { label: "W28", value: 342 },
  { label: "W29", value: 358 },
  { label: "W30", value: 331 },
  { label: "W31", value: 296 },
  { label: "W32", value: 271, annotation: "next week" },
];

export const hoursLastYear: SeriesPoint[] = [
  { label: "W28", value: 318 },
  { label: "W29", value: 344 },
  { label: "W30", value: 352 },
  { label: "W31", value: 339 },
  { label: "W32", value: 331 },
];

export const marginByWork = [
  { label: "Balustrades", hours: 41, margin: 38 },
  { label: "Stair cores", hours: 24, margin: 31 },
  { label: "Screens", hours: 13, margin: 22 },
  { label: "Shopfitting", hours: 22, margin: 9 },
];

export const cashflowSeries: SeriesPoint[] = [
  { label: "Feb", value: 41200 },
  { label: "Mar", value: 47800 },
  { label: "Apr", value: 52400, annotation: "raised rates 8%" },
  { label: "May", value: 58900 },
  { label: "Jun", value: 65200 },
  { label: "Jul", value: 62480, annotation: "Dijkman order" },
  { label: "Aug", value: 66100 },
  { label: "Sep", value: 71400 },
];

export const customerCounts: SeriesPoint[] = [
  { label: "Feb", value: 19 },
  { label: "Mar", value: 20 },
  { label: "Apr", value: 20 },
  { label: "May", value: 22 },
  { label: "Jun", value: 23 },
  { label: "Jul", value: 24 },
];

export const funnelSteps = [
  { label: "Enquiries", value: 46, note: "12 months, all channels" },
  { label: "Site measures", value: 31, note: "we decline roughly a third at this point" },
  { label: "Quotes issued", value: 28, note: "3 never left the workshop" },
  { label: "Jobs won", value: 17, note: "average value \u20AC14,900" },
];

export const growthRows = [
  { label: "Invoiced, 12 months", now: 412800, then: 318400 },
  { label: "Average job value", now: 14900, then: 11200 },
  { label: "Customers who ordered twice", now: 11, then: 8 },
  { label: "Hours sold per week", now: 331, then: 318 },
];

export const insights = [
  { id: "ins1", text: "Revenue per job rose 11% within three months of the March rate change, and no customer left.", confidence: "known" as const },
  { id: "ins2", text: "Balustrades take 41% of the workshop and return 38% of the margin. Shopfitting takes 22% and returns 9%.", confidence: "known" as const },
  { id: "ins3", text: "September is your strongest month three years running. Booked hours for next week are the softest since 2023.", confidence: "estimated" as const },
  { id: "ins4", text: "If the last four weeks hold, cash lands between \u20AC58k and \u20AC64k at month end.", confidence: "guessing" as const },
];
