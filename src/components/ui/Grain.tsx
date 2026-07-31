"use client";

import { cx } from "@/lib/utils";

export const GRAINS = ["Day", "Week", "Month", "Quarter", "Year"] as const;
export type GrainValue = (typeof GRAINS)[number];

export function Grain({
  value,
  onChange,
  options = GRAINS as unknown as GrainValue[],
}: {
  value: GrainValue;
  onChange: (v: GrainValue) => void;
  options?: GrainValue[];
}) {
  return (
    <div className="inline-flex items-center rounded-control border border-hair bg-raise p-[2px]">
      {options.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={cx(
            "h-7 rounded-[4px] px-rise text-caption transition-colors duration-[90ms]",
            g === value ? "bg-recess text-ink" : "text-ink-3 hover:text-ink-2",
          )}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
