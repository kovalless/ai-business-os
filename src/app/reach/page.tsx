"use client";

import { useState } from "react";
import { Room } from "@/components/shell";
import {
  Actuator,
  Calendar,
  DataTable,
  Empty,
  Label,
  Panel,
  Row,
  Seal,
  Sill,
  Tabs,
  Token,
  Whisper,
} from "@/components/ui";
import type { Column } from "@/components/ui";
import { Proposal } from "@/components/ai/Proposal";
import { business, campaigns, contentCalendar, ideas, reachPerformance, seasons } from "@/lib/data";
import { money, num } from "@/lib/utils";

type View = "seasons" | "calendar" | "ideas" | "performance";

const STATUS_TONE = {
  sent: "neutral",
  scheduled: "good",
  draft: "machine",
  proposed: "machine",
} as const;

type Perf = (typeof reachPerformance)[number] & { id: string };

export default function ReachPage() {
  const [view, setView] = useState<View>("seasons");
  const [sealing, setSealing] = useState(false);
  const [sent, setSent] = useState(false);
  const [day, setDay] = useState<number | undefined>(undefined);

  const perfRows: Perf[] = reachPerformance.map((r) => ({ ...r, id: r.label }));
  const perfColumns: Column<Perf>[] = [
    { key: "label", head: "Season", render: (r) => <span className="text-ink-body">{r.label}</span> },
    { key: "sent", head: "Sends", numeric: true, render: (r) => num(r.sent) },
    { key: "opened", head: "Opened", numeric: true, render: (r) => `${r.opened}%` },
    { key: "enq", head: "Enquiries", numeric: true, render: (r) => num(r.enquiries) },
    { key: "jobs", head: "Jobs", numeric: true, render: (r) => num(r.jobs) },
    { key: "value", head: "Value", numeric: true, render: (r) => <span className="text-ink">{money(r.value)}</span> },
  ];

  return (
    <Room
      title="Marketing"
      meta={`${seasons.length} seasons`}
      margin={
        <div className="flex flex-col gap-bay">
          <Proposal confidence="estimated" method="Based on the same week in the last three years.">
            The first September send has landed best on a Tuesday morning. 18 August, 07:30 is the
            closest match.
          </Proposal>
          <div>
            <Label>Your voice</Label>
            <ul className="mt-step flex flex-col gap-step">
              {business.voice.map((v) => (
                <li key={v} className="text-caption text-ink-3">
                  {v}
                </li>
              ))}
            </ul>
            <Whisper className="mt-rise">Every draft is written from this. Edit it once.</Whisper>
          </div>
        </div>
      }
    >
      <div id="field" className="pt-step" />

      <Tabs
        value={view}
        onChange={setView}
        items={[
          { key: "seasons" as const, label: "Seasons", count: seasons.length },
          { key: "calendar" as const, label: "Calendar" },
          { key: "ideas" as const, label: "Ideas", count: ideas.length },
          { key: "performance" as const, label: "Performance" },
        ]}
      />

      {view === "seasons" ? (
        <div className="mt-bay">
          {seasons.map((season) => {
            const items = campaigns.filter((c) => c.season === season.id);
            return (
              <section key={season.id} className="mb-atrium">
                <div className="flex flex-wrap items-baseline justify-between gap-step">
                  <h2 className="text-head font-medium text-ink">{season.name}</h2>
                  <span className="text-caption text-ink-3">{season.dates}</span>
                </div>
                <p className="mt-step max-w-[520px] text-bodysm text-ink-2">{season.intent}</p>
                <Sill className="mt-rise" animate={false} />
                <div className="mt-rise flex flex-col">
                  {items.length === 0 ? (
                    <Empty kind="unfilled" title="Nothing planned in this season yet." />
                  ) : (
                    items.map((c) => (
                      <Row key={c.id}>
                        <div className="flex flex-wrap items-center gap-step">
                          <span className="text-bodysm text-ink-body">{c.name}</span>
                          <Token tone={STATUS_TONE[c.status]}>{c.status}</Token>
                          {c.audience ? (
                            <span className="num text-caption text-ink-3">
                              {num(c.audience)} people
                            </span>
                          ) : null}
                        </div>
                        {c.result ? (
                          <p className="mt-tick text-caption text-ink-3">{c.result}</p>
                        ) : null}
                      </Row>
                    ))
                  )}
                </div>
              </section>
            );
          })}

          <section className="pb-court">
            <Label>The send gate</Label>
            <Panel tone="outline" className="mt-rise">
              {sent ? (
                <div>
                  <p className="text-bodysm text-ink-body">
                    Scheduled for 18 August, 07:30. Recallable until 07:25.
                  </p>
                  <p className="mt-step text-caption text-ink-3">
                    Yours now. The draft cooled when you sealed it.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-bodysm text-ink-body">
                    September newsletter, first send. It is written from your Voice and has not left
                    the building.
                  </p>
                  <div className="mt-stride flex flex-wrap items-center gap-rise">
                    <Actuator rank="primary" size="dense" onClick={() => setSealing(true)}>
                      Send it
                    </Actuator>
                    <Whisper>412 people. Nothing leaves without your hand on it.</Whisper>
                  </div>
                </div>
              )}
            </Panel>
          </section>
        </div>
      ) : null}

      {view === "calendar" ? (
        <div className="mt-bay pb-court">
          <Calendar
            month="August 2026"
            days={31}
            firstWeekday={5}
            entries={contentCalendar}
            selected={day}
            onSelect={setDay}
          />
          {day ? (
            <div className="mt-stride">
              <Label>{`August ${day}`}</Label>
              <div className="mt-step flex flex-col gap-step">
                {contentCalendar.filter((e) => e.day === day).length === 0 ? (
                  <p className="text-caption text-ink-3">Nothing planned on this day.</p>
                ) : (
                  contentCalendar
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
          <p className="mt-bay text-caption text-ink-3">
            Warm entries were proposed by the machine and have not been approved.
          </p>
        </div>
      ) : null}

      {view === "ideas" ? (
        <div className="mt-bay flex flex-col gap-rise pb-court">
          {ideas.map((i) => (
            <Proposal key={i.id} confidence="guessing" method={i.why} acceptLabel="Put it in September">
              {i.title}
            </Proposal>
          ))}
        </div>
      ) : null}

      {view === "performance" ? (
        <div className="mt-bay pb-court">
          <p className="text-bodysm text-ink-body">
            Two sends a season is the pattern. The second send has produced more work than the first
            in each of the last three seasons.
          </p>
          <div className="mt-stride">
            <DataTable columns={perfColumns} rows={perfRows} />
          </div>
          <p className="mt-rise font-mono text-caption text-ink-3">
            Sends &middot; enquiry log &middot; invoices &middot; 09:12
          </p>
        </div>
      ) : null}

      <Seal
        open={sealing}
        onClose={() => setSealing(false)}
        onConfirm={() => setSent(true)}
        label="Hold to send"
        consequence="This sends the September newsletter to 412 people. It cannot be recalled once it leaves."
      />
    </Room>
  );
}
