"use client";

import { cx } from "@/lib/utils";

export type CalendarEntry = {
  day: number;
  label: string;
  tone?: "neutral" | "machine" | "sent";
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function Calendar({
  month,
  days,
  firstWeekday,
  entries,
  selected,
  onSelect,
}: {
  month: string;
  days: number;
  firstWeekday: number;
  entries: CalendarEntry[];
  selected?: number;
  onSelect?: (day: number) => void;
}) {
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-bodysm font-medium text-ink">{month}</span>
        <span className="text-caption text-ink-3">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      <div className="mt-rise h-px bg-hair" />
      <div className="mt-rise grid grid-cols-7 gap-px">
        {WEEKDAYS.map((d) => (
          <div key={d} className="pb-step text-label uppercase text-ink-4">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="min-h-[64px]" />;
          const dayEntries = entries.filter((e) => e.day === day);
          const active = selected === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect?.(day)}
              className={cx(
                "min-h-[44px] border-t border-hair/60 p-[3px] text-left align-top transition-colors duration-[90ms] sm:min-h-[64px] sm:p-step",
                active ? "bg-ledger-10" : "hover:bg-recess",
              )}
            >
              <span className={cx("num text-caption", active ? "text-ink" : "text-ink-3")}>
                {day}
              </span>
              <span className="mt-step hidden flex-col gap-[3px] sm:flex">
                {dayEntries.slice(0, 2).map((e) => (
                  <span
                    key={e.label}
                    className={cx(
                      "truncate text-label",
                      e.tone === "machine" ? "text-filament-80" : "text-ink-2",
                    )}
                  >
                    {e.label}
                  </span>
                ))}
                {dayEntries.length > 2 ? (
                  <span className="text-label text-ink-4">+{dayEntries.length - 2}</span>
                ) : null}
              </span>
              {dayEntries.length ? (
                <span className="mt-step flex gap-[3px] sm:hidden" aria-hidden="true">
                  {dayEntries.slice(0, 3).map((e) => (
                    <span
                      key={e.label}
                      className={cx(
                        "block h-[3px] w-[3px] rounded-full",
                        e.tone === "machine" ? "bg-filament-60" : "bg-vitrine-30",
                      )}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
