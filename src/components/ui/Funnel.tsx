import { num, pct } from "@/lib/utils";

export function Funnel({
  sentence,
  steps,
}: {
  sentence: string;
  steps: { label: string; value: number; note?: string }[];
}) {
  const top = steps[0]?.value ?? 1;
  return (
    <figure>
      <figcaption className="text-bodysm text-ink-body">{sentence}</figcaption>
      <div className="mt-stride flex flex-col gap-stride">
        {steps.map((s, i) => {
          const share = (s.value / top) * 100;
          const prev = i === 0 ? null : steps[i - 1]!.value;
          return (
            <div key={s.label}>
              <div className="flex items-baseline justify-between gap-rise">
                <span className="text-bodysm text-ink-body">{s.label}</span>
                <span className="num text-bodysm text-ink">{num(s.value)}</span>
              </div>
              <div className="mt-step h-[2px] w-full bg-hair">
                <div className="h-[2px] bg-ledger-60" style={{ width: `${share}%` }} />
              </div>
              <div className="mt-step flex justify-between gap-rise">
                <span className="text-caption text-ink-3">{s.note}</span>
                {prev ? (
                  <span className="num text-caption text-ink-3">
                    {pct((s.value / prev) * 100, 0)} of the step above
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
