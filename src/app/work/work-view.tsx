"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Room } from "@/components/shell";
import { Actuator, Calendar, Empty, Field, Label, Row, Shelf, Tabs, Token } from "@/components/ui";
import type { CalendarEntry } from "@/components/ui";
import { Proposal } from "@/components/ai/Proposal";
import type { UpcomingItem, WorkSignals, WorkTask } from "@/lib/actions/work";
import { cx, getMonthGrid, money } from "@/lib/utils";
import { D, descend, stagger } from "@/lib/motion";

type View = "today" | "upcoming" | "done";

const PRIORITY_LABEL = { now: "Now", soon: "Soon", whenever: "Whenever" } as const;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function WorkView({
  tasks,
  upcoming,
  workCalendar,
  signals,
}: {
  tasks: WorkTask[];
  upcoming: UpcomingItem[];
  workCalendar: CalendarEntry[];
  signals: WorkSignals;
}) {
  const [items, setItems] = useState<WorkTask[]>(tasks);
  const [view, setView] = useState<View>("today");
  const [owner, setOwner] = useState("all");
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [day, setDay] = useState<number | undefined>(undefined);

  const { monthLabel, days, firstWeekday } = useMemo(() => getMonthGrid(new Date()), []);
  const ownerNames = useMemo(() => [...new Set(tasks.map((t) => t.owner))].sort(), [tasks]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key.toLowerCase() === "f") setFocus((v) => !v);
      if (e.key === "Escape") setFocus(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(
      (t) =>
        (owner === "all" || t.owner === owner) &&
        (!term || t.title.toLowerCase().includes(term) || (t.detail ?? "").toLowerCase().includes(term)),
    );
  }, [items, owner, q]);

  const open = filtered.filter((t) => !t.done);
  const done = filtered.filter((t) => t.done);
  const groups = (["now", "soon", "whenever"] as const).map((p) => ({
    p,
    list: open.filter((t) => t.priority === p),
  }));
  const nowList = groups[0]!.list;

  function toggle(id: string) {
    setItems((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <Room
      title="Tasks"
      meta={`${open.length} open · press f to focus`}
      actions={
        <div className="flex items-center gap-rise">
          <Actuator size="dense" onClick={() => setFocus(true)}>
            Focus
          </Actuator>
          <Shelf
            label="Everyone"
            value={owner}
            onChange={setOwner}
            align="right"
            items={[{ key: "all", label: "Everyone" }, ...ownerNames.map((n) => ({ key: n, label: n }))]}
          />
        </div>
      }
      margin={
        <div className="flex flex-col gap-bay">
          {signals.proposedCount > 0 ? (
            <Proposal confidence="estimated">
              The {signals.proposedCount} task{signals.proposedCount > 1 ? "s" : ""} with money attached
              {signals.proposedCount > 1 ? " are" : " is"} the only one{signals.proposedCount > 1 ? "s" : ""} today.
              Together they total {money(signals.proposedTotal)}.
            </Proposal>
          ) : null}
          <div>
            <Label>Suggested order</Label>
            <ol className="mt-step flex flex-col gap-step">
              {nowList.slice(0, 3).map((t, i) => (
                <li key={t.id} className="text-caption text-ink-3">
                  {i + 1}. {t.title}
                </li>
              ))}
            </ol>
          </div>
        </div>
      }
    >
      <div id="field" className="pt-step" />

      <Tabs
        value={view}
        onChange={setView}
        items={[
          { key: "today" as const, label: "Today", count: open.length },
          { key: "upcoming" as const, label: "Upcoming", count: upcoming.length },
          { key: "done" as const, label: "Settled", count: done.length },
        ]}
      />

      <div className="mt-bay">
        <Field label="Search" placeholder="Requote, Kessler, powder coater" value={q} onChange={setQ} />
      </div>

      {view === "today" ? (
        <div className="mt-bay pb-court">
          {open.length === 0 ? (
            <Empty kind="cleared" title="Nothing is open. The floor is clear until Thursday." />
          ) : (
            groups.map(({ p, list }) =>
              list.length === 0 ? null : (
                <section key={p} className="mb-court">
                  <Label>{PRIORITY_LABEL[p]}</Label>
                  <motion.div variants={stagger(0.05)} initial="hidden" animate="show" className="mt-rise flex flex-col">
                    {list.map((t) => (
                      <motion.div key={t.id} variants={descend} layout>
                        <Row
                          actions={
                            <Actuator size="dense" rank="quiet" onClick={() => toggle(t.id)}>
                              Done
                            </Actuator>
                          }
                        >
                          <div className="flex items-start gap-rise">
                            <button
                              type="button"
                              onClick={() => toggle(t.id)}
                              aria-label={`Mark ${t.title} done`}
                              className="mt-[3px] h-4 w-4 shrink-0 rounded-mark border border-vitrine-30 transition-colors hover:border-ledger-60"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-step">
                                <span className="text-bodysm text-ink-body">{t.title}</span>
                                {t.proposed ? <Token tone="machine">proposed</Token> : null}
                                {t.amount ? (
                                  <span className="num text-caption text-ink-3">{money(t.amount)}</span>
                                ) : null}
                              </div>
                              {t.detail ? (
                                <p className="mt-tick text-caption text-ink-3">{t.detail}</p>
                              ) : null}
                            </div>
                            <span
                              className={cx(
                                "shrink-0 text-caption",
                                t.due === "Yesterday" ? "text-rust" : "text-ink-3",
                              )}
                            >
                              {t.due}
                            </span>
                          </div>
                        </Row>
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              ),
            )
          )}
        </div>
      ) : null}

      {view === "upcoming" ? (
        <div className="mt-bay pb-court">
          <div className="flex flex-col">
            {upcoming.map((u) => (
              <Row key={u.id}>
                <div className="flex flex-wrap items-baseline gap-step">
                  <span className="text-bodysm text-ink-body">{u.title}</span>
                  <span className="text-caption text-ink-3">{u.who}</span>
                  <span className="ml-auto text-caption text-ink-2">{u.when}</span>
                </div>
                <p className="mt-tick text-caption text-ink-3">{u.where}</p>
              </Row>
            ))}
          </div>
          <div className="mt-court">
            <Calendar
              month={monthLabel}
              days={days}
              firstWeekday={firstWeekday}
              entries={workCalendar}
              selected={day}
              onSelect={setDay}
            />
            {day ? (
              <div className="mt-stride">
                <Label>{`${MONTH_NAMES[new Date().getUTCMonth()]} ${day}`}</Label>
                <div className="mt-step flex flex-col gap-step">
                  {workCalendar.filter((e) => e.day === day).length === 0 ? (
                    <p className="text-caption text-ink-3">Nothing on this day.</p>
                  ) : (
                    workCalendar
                      .filter((e) => e.day === day)
                      .map((e) => (
                        <p key={e.label} className="text-bodysm text-ink-body">
                          {e.label}
                        </p>
                      ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {view === "done" ? (
        <div className="mt-bay pb-court">
          {done.length === 0 ? (
            <Empty
              kind="unfilled"
              title="Nothing settled yet today."
              body="Finished work collects here so the open list stays honest."
            />
          ) : (
            <div className="flex flex-col">
              {done.map((t) => (
                <Row key={t.id} onClick={() => toggle(t.id)}>
                  <div className="flex items-center gap-rise">
                    <span className="h-4 w-4 shrink-0 rounded-mark bg-ledger-80" />
                    <span className="text-bodysm text-ink-3 line-through decoration-ink-4">
                      {t.title}
                    </span>
                    <span className="ml-auto text-caption text-ink-3">{t.owner}</span>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <AnimatePresence>
        {focus ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ground px-stride"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: D.travel }}
          >
            <div className="w-full max-w-[560px]">
              <Label>One thing</Label>
              {nowList[0] ? (
                <>
                  <p className="mt-stride text-title font-medium text-ink">{nowList[0]!.title}</p>
                  {nowList[0]!.detail ? (
                    <p className="mt-rise text-bodysm text-ink-2">{nowList[0]!.detail}</p>
                  ) : null}
                  <div className="mt-court h-px bg-hair" />
                  <div className="mt-bay flex flex-wrap items-center gap-rise">
                    <Actuator
                      rank="primary"
                      onClick={() => {
                        toggle(nowList[0]!.id);
                      }}
                    >
                      Mark it done
                    </Actuator>
                    <button
                      type="button"
                      onClick={() => setFocus(false)}
                      className="text-caption text-ink-2 underline-offset-2 hover:underline"
                    >
                      Leave focus
                    </button>
                    <span className="ml-auto text-caption text-ink-3">
                      {nowList.length - 1} more marked now
                    </span>
                  </div>
                </>
              ) : (
                <p className="voice mt-stride text-head text-ink-2">
                  Nothing is marked now. Leave focus and the day is yours.
                </p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Room>
  );
}
