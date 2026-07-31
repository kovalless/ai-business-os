"use client";

import { cx } from "@/lib/utils";

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { key: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cx("flex items-end gap-bay border-b border-hair", className)} role="tablist">
      {items.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(t.key)}
            className={cx(
              "relative -mb-px flex items-baseline gap-step pb-rise text-bodysm transition-colors duration-[90ms]",
              active ? "font-medium text-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {t.label}
            {typeof t.count === "number" ? (
              <span className="num text-caption text-ink-4">{t.count}</span>
            ) : null}
            {active ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-ledger-80" /> : null}
          </button>
        );
      })}
    </div>
  );
}
