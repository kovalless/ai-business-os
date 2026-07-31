"use client";

import { cx } from "@/lib/utils";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-5 w-8 rounded-mark transition-colors duration-[160ms]",
        checked ? "bg-ledger-80" : "bg-vitrine-20",
      )}
    >
      <span
        className={cx(
          "absolute top-[2px] h-4 w-4 rounded-[3px] bg-vitrine-00 transition-transform duration-[160ms] ease-[cubic-bezier(0.32,0,0.24,1)]",
          checked ? "translate-x-[14px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}
