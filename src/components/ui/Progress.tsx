import { cx } from "@/lib/utils";

export function Progress({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-caption text-ink-3">{label}</span>
        <span className="num text-caption text-ink-2">{clamped}%</span>
      </div>
      <div className="mt-step h-px w-full bg-hair">
        <div
          className={cx("h-px bg-ledger-60")}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
