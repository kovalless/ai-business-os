import type { Confidence } from "@/lib/types";
import { cx } from "@/lib/utils";

const FILLED: Record<Confidence, number> = { known: 3, estimated: 2, guessing: 1 };
const WORD: Record<Confidence, string> = {
  known: "Known",
  estimated: "Estimated",
  guessing: "Guessing",
};

export function Gauge({ level, className }: { level: Confidence; className?: string }) {
  const filled = FILLED[level];
  return (
    <span
      className={cx("inline-flex items-center gap-thread align-middle", className)}
      role="img"
      aria-label={`Confidence: ${WORD[level]}`}
      title={WORD[level]}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cx("block h-[2px] w-[9px]", i < filled ? "bg-filament-60" : "bg-hair")}
        />
      ))}
    </span>
  );
}
