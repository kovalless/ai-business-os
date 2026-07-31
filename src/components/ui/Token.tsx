import { cx } from "@/lib/utils";

type Tone = "neutral" | "good" | "caution" | "bad" | "machine";

const TONES: Record<Tone, string> = {
  neutral: "bg-vitrine-10 text-ink-2",
  good: "bg-ledger-10 text-ledger-80",
  caution: "bg-[#F4EEE1] text-[#7A5F2E]",
  bad: "bg-[#F4E7E3] text-rustdeep",
  machine: "bg-filament-10 text-filament-80",
};

export function Token({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex h-5 items-center rounded-mark px-[6px] text-label font-medium uppercase",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
