export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const eur = new Intl.NumberFormat("nl-NL", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function money(value: number, opts?: { sign?: boolean }) {
  const sign = opts?.sign && value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}\u20AC${eur.format(Math.abs(Math.round(value)))}`;
}

export function num(value: number, digits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function pct(value: number, digits = 1) {
  return `${Math.abs(value).toFixed(digits)}%`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function dayPhase(d = new Date()): "dawn" | "trading" | "golden" | "night" {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 5 && h < 8.5) return "dawn";
  if (h >= 8.5 && h < 16) return "trading";
  if (h >= 16 && h < 19.5) return "golden";
  return "night";
}

export function relativeDays(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

// "28 Jul" for the current year, "12 Mar 25" for any other year — the
// short in-line date format the UI already expects on thread/invoice rows.
//
// Uses UTC getters deliberately, not local ones: date-only DB columns
// (invoice due dates, etc.) parse as UTC midnight, and reading that back
// with local getters rolls the displayed day back by one in any timezone
// behind UTC. There's no real "local time" for a calendar date anyway.
export const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function formatShortDate(date: Date, now = new Date()) {
  const day = date.getUTCDate();
  const month = SHORT_MONTHS[date.getUTCMonth()];
  if (date.getUTCFullYear() === now.getUTCFullYear()) return `${day} ${month}`;
  return `${day} ${month} ${String(date.getUTCFullYear()).slice(-2)}`;
}

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Monday-first month grid (unlike Date.getUTCDay()'s Sunday-first,
// 0=Sun) for the Work and Reach rooms' Calendar tabs. Was defined
// identically in both work-view.tsx and reach-view.tsx; shared here.
export function getMonthGrid(now: Date): { monthLabel: string; days: number; firstWeekday: number } {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  return { monthLabel: `${FULL_MONTHS[month]} ${year}`, days, firstWeekday };
}
