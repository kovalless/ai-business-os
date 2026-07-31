import type { ThreadEntry } from "@/lib/types";
import { cx, money } from "@/lib/utils";
import { Gauge } from "./Gauge";

const KIND: Record<ThreadEntry["kind"], string> = {
  invoice: "Invoice",
  email: "Email",
  call: "Call",
  note: "Note",
  job: "Job",
  payment: "Payment",
  quote: "Quote",
};

export function Timeline({ entries }: { entries: ThreadEntry[] }) {
  return (
    <ol className="relative">
      <span className="absolute left-[68px] top-1 bottom-1 w-px bg-hair" aria-hidden="true" />
      {entries.map((e) => (
        <li key={e.id} className="relative flex gap-stride py-rise">
          <time className="w-[60px] shrink-0 pt-[2px] text-right text-caption text-ink-3">
            {e.at}
          </time>
          <span
            className={cx(
              "relative z-10 mt-[6px] h-[7px] w-[7px] shrink-0 rounded-full",
              e.byMachine ? "bg-filament-60" : "bg-vitrine-30",
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1 pl-[2px]">
            <div className="flex flex-wrap items-baseline gap-step">
              <span className="text-bodysm text-ink-body">{e.title}</span>
              {e.amount ? <span className="num text-bodysm text-ink">{money(e.amount)}</span> : null}
              <span className="text-label uppercase tracking-[0.08em] text-ink-4">{KIND[e.kind]}</span>
              {e.byMachine ? <Gauge level="known" /> : null}
            </div>
            {e.detail ? <p className="mt-tick text-caption text-ink-3">{e.detail}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
