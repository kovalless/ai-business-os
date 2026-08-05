"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Room } from "@/components/shell";
import { Actuator, Empty, Figure, Gauge, Label, Panel, Sill } from "@/components/ui";
import { MarginNote } from "@/components/ai/MarginNote";
import type { Move, Signal } from "@/lib/types";
import type { TodayMarginNote } from "@/lib/actions/today";
import { D, stagger, descend } from "@/lib/motion";
import { cx, money } from "@/lib/utils";
import type { FigureData } from "@/lib/types";

export function TodayView({
  meta,
  statement,
  standing,
  supporting,
  signals,
  moves,
  marginNote,
}: {
  meta: string;
  statement: string;
  standing: FigureData | null;
  supporting: FigureData[];
  signals: Signal[];
  moves: Move[];
  marginNote: TodayMarginNote | null;
}) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const live = moves.filter((m) => !dismissed.includes(m.id));
  const cleared = live.length === 0;

  return (
    <Room
      title="Today"
      meta={meta}
      margin={
        marginNote ? (
          <>
            <MarginNote text={marginNote.text} confidence={marginNote.confidence} actions={marginNote.actions} />
            <div className="mt-atrium h-px bg-hair" />
            <p className="mt-rise text-caption text-ink-3">{marginNote.quiet}</p>
          </>
        ) : null
      }
    >
      <div id="field" />

      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: D.settle, delay: 0.24, ease: [0.32, 0, 0.24, 1] }}
        className="voice pt-step text-head text-ink-2"
      >
        {statement}
      </motion.p>

      {standing ? (
        <div className="mt-stride">
          <Figure data={standing} size="xl" sill />
        </div>
      ) : null}

      <div className="mt-bay flex flex-wrap gap-x-court gap-y-bay">
        {supporting.map((f) => (
          <Figure key={f.id} data={f} size="m" className="min-w-[150px]" />
        ))}
      </div>

      <section className="mt-court" aria-labelledby="signals-head">
        <Label>
          <span id="signals-head">Since Monday</span>
        </Label>
        <ul className="mt-rise">
          {signals.map((s, i) => (
            <li key={s.id}>
              <Link
                href={s.href}
                className={cx(
                  "group flex items-start gap-rise py-[9px] transition-colors",
                  i < signals.length - 1 && "border-b border-hair/60",
                )}
              >
                <span className="min-w-0 flex-1 text-bodysm text-ink-body">{s.text}</span>
                <span className="mt-[2px] hidden shrink-0 items-center gap-step text-caption text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                  {s.room}
                  <ArrowUpRight size={13} strokeWidth={1.5} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-atrium pb-court" aria-labelledby="moves-head">
        <Label>
          <span id="moves-head">{cleared ? "Moves" : "Three moves"}</span>
        </Label>

        {cleared ? (
          <Empty
            kind="cleared"
            title="Everything here is settled. Nothing needs you until Thursday."
            className="mt-stride"
          />
        ) : (
          <motion.div
            variants={stagger(0.38)}
            initial="hidden"
            animate="show"
            className="mt-rise flex flex-col gap-rise"
          >
            {live.map((m) => (
              <motion.div key={m.id} variants={descend} layout>
                <Panel className="p-stride md:p-bay">
                  <div className="flex items-start justify-between gap-rise">
                    <h2 className="text-bodysm font-medium text-ink md:text-body">{m.title}</h2>
                    <Gauge level={m.confidence} className="mt-[6px] shrink-0" />
                  </div>
                  <p className="mt-step text-caption text-ink-2 md:text-bodysm">{m.why}</p>
                  {m.amount ? (
                    <p className="num mt-step text-caption text-ink-3">
                      {money(m.amount)} in play
                    </p>
                  ) : null}
                  <div className="mt-rise flex flex-wrap items-center gap-rise">
                    <Actuator
                      size="dense"
                      rank={m.primary ? "primary" : "secondary"}
                      href={m.href}
                    >
                      {m.action}
                    </Actuator>
                    <button
                      type="button"
                      onClick={() => setDismissed((d) => [...d, m.id])}
                      className="text-caption text-ink-2 underline-offset-2 hover:underline"
                    >
                      Not now
                    </button>
                  </div>
                </Panel>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!cleared && dismissed.length ? (
          <p className="mt-stride text-caption text-ink-3">
            {dismissed.length} move set aside. It is recorded as a decision, not forgotten.
          </p>
        ) : null}
      </section>

      <Sill animate={false} className="opacity-0" />
    </Room>
  );
}
