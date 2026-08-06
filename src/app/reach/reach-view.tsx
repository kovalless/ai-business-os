"use client";

import { useMemo, useState } from "react";
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
import type { ReachCampaign, ReachIdea, ReachPerformanceRow, ReachSeason, SendGate } from "@/lib/actions/reach";
import type { CalendarEntry } from "@/components/ui";
import { getMonthGrid, num } from "@/lib/utils";

type View = "seasons" | "calendar" | "ideas" | "performance";

const STATUS_TONE = {
  sent: "neutral",
  scheduled: "good",
  draft: "machine",
  proposed: "machine",
} as const;

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

type Perf = ReachPerformanceRow;

export function ReachView({
  seasons,
  campaigns,
  calendar,
  ideas,
  voice,
  performance,
  sendGate,
}: {
  seasons: ReachSeason[];
  campaigns: ReachCampaign[];
  calendar: CalendarEntry[];
  ideas: ReachIdea[];
  voice: string[];
  performance: ReachPerformanceRow[];
  sendGate: SendGate;
}) {
  const [view, setView] = useState<View>("seasons");
  const [sealing, setSealing] = useState(false);
  const [sent, setSent] = useState(false);
  const [day, setDay] = useState<number | undefined>(undefined);

  const { monthLabel, days, firstWeekday } = useMemo(() => getMonthGrid(new Date()), []);

  const perfColumns: Column<Perf>[] = [
    { key: "label", head: "Season", render: (r) => <span className="text-ink-body">{r.label}</span> },
    { key: "sent", head: "Sends", numeric: true, render: (r) => num(r.sent) },
    { key: "opened", head: "Opened", numeric: true, render: (r) => (r.opened === null ? "—" : `${r.opened}%`) },
    { key: "enq", head: "Enquiries", numeric: true, render: (r) => num(r.enquiries) },
  ];

  return (
    <Room
      title="Marketing"
      meta={`${seasons.length} seasons`}
      margin={
        <div className="flex flex-col gap-bay">
          <div>
            <Label>Your voice</Label>
            <ul className="mt-step flex flex-col gap-step">
              {voice.map((v) => (
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
            const items = campaigns.filter((c) => c.seasonId === season.id);
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

          {sendGate ? (
            <section className="pb-court">
              <Label>The send gate</Label>
              <Panel tone="outline" className="mt-rise">
                {sent ? (
                  <div>
                    <p className="text-bodysm text-ink-body">
                      Scheduled for {sendGate.scheduledWhen}. Recallable until {sendGate.recallableUntil}.
                    </p>
                    <p className="mt-step text-caption text-ink-3">
                      Yours now. The draft cooled when you sealed it.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-bodysm text-ink-body">
                      {sendGate.name}. It is written from your Voice and has not left the building.
                    </p>
                    <div className="mt-stride flex flex-wrap items-center gap-rise">
                      <Actuator rank="primary" size="dense" onClick={() => setSealing(true)}>
                        Send it
                      </Actuator>
                      <Whisper>{num(sendGate.audience)} people. Nothing leaves without your hand on it.</Whisper>
                    </div>
                  </div>
                )}
              </Panel>
            </section>
          ) : null}
        </div>
      ) : null}

      {view === "calendar" ? (
        <div className="mt-bay pb-court">
          <Calendar
            month={monthLabel}
            days={days}
            firstWeekday={firstWeekday}
            entries={calendar}
            selected={day}
            onSelect={setDay}
          />
          {day ? (
            <div className="mt-stride">
              <Label>{`${MONTH_NAMES[new Date().getUTCMonth()]} ${day}`}</Label>
              <div className="mt-step flex flex-col gap-step">
                {calendar.filter((e) => e.day === day).length === 0 ? (
                  <p className="text-caption text-ink-3">Nothing planned on this day.</p>
                ) : (
                  calendar
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
          <div className="mt-stride">
            <DataTable columns={perfColumns} rows={performance} />
          </div>
        </div>
      ) : null}

      {sendGate ? (
        <Seal
          open={sealing}
          onClose={() => setSealing(false)}
          onConfirm={() => setSent(true)}
          label="Hold to send"
          consequence={`This sends ${sendGate.name} to ${num(sendGate.audience)} people. It cannot be recalled once it leaves.`}
        />
      ) : null}
    </Room>
  );
}
