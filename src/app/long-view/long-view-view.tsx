"use client";

import { useState } from "react";
import { Room } from "@/components/shell";
import { Empty, Gauge, Grain, Label, LineChart, Row, Shelf, Sill } from "@/components/ui";
import type { GrainValue } from "@/components/ui";
import type { AnalyticsInsight, AnalyticsQuestion, AnalyticsSeries, GrowthRow, QuietCustomer } from "@/lib/actions/analytics";
import type { ReachPerformanceRow } from "@/lib/actions/reach";
import { money, num, pct } from "@/lib/utils";

type View = "revenue" | "growth" | "cash" | "customers" | "conversion" | "marketing";

const VIEWS: { key: View; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "growth", label: "Growth" },
  { key: "cash", label: "Cash flow" },
  { key: "customers", label: "Customers" },
  { key: "conversion", label: "Conversion" },
  { key: "marketing", label: "Marketing" },
];

export function LongViewView({
  series,
  insights,
  growthRows,
  quiet,
  marketingPerformance,
  questions,
  revenueSentence,
  hoursSentence,
  customersSentence,
  cashflowSentence,
}: {
  series: AnalyticsSeries;
  insights: AnalyticsInsight[];
  growthRows: GrowthRow[];
  quiet: QuietCustomer;
  marketingPerformance: ReachPerformanceRow[];
  questions: AnalyticsQuestion[];
  revenueSentence: string;
  hoursSentence: string;
  customersSentence: string;
  cashflowSentence: string;
}) {
  const [grain, setGrain] = useState<GrainValue>("Month");
  const [view, setView] = useState<View>("revenue");
  const [asked, setAsked] = useState<string | null>(null);

  return (
    <Room
      title="Analytics"
      wide
      actions={
        <div className="flex items-center gap-rise">
          <Shelf
            label="Revenue"
            value={view}
            onChange={(v) => setView(v as View)}
            align="right"
            items={VIEWS.map((v) => ({ key: v.key, label: v.label }))}
          />
          <Grain value={grain} onChange={setGrain} />
        </div>
      }
      margin={
        <div className="flex flex-col gap-bay">
          <Label>What stands out</Label>
          {insights.map((i) => (
            <div key={i.id}>
              <Gauge level={i.confidence} />
              <p className="mt-step text-bodysm text-ink-body">{i.text}</p>
            </div>
          ))}
        </div>
      }
    >
      <div id="field" className="pt-step" />

      <Label>Questions this business asks</Label>
      <div className="mt-rise flex max-w-[680px] flex-col">
        {questions.map((q) => (
          <div key={q.id} className="border-b border-hair/60">
            <Row onClick={() => setAsked(asked === q.id ? null : q.id)}>
              <span className="text-bodysm text-ink-body">{q.q}</span>
            </Row>
            {asked === q.id ? (
              <p className="px-rise pb-rise text-bodysm text-ink-2">{q.answer}</p>
            ) : null}
          </div>
        ))}
      </div>

      <Sill className="mt-court" />

      {view === "revenue" ? (
        <section className="mt-court max-w-[720px]">
          <LineChart sentence={revenueSentence} primary={series.revenue} comparison={series.priorYear} />
          <p className="mt-rise font-mono text-caption text-ink-3">
            Invoices &middot; 30 Jan &ndash; 29 Jul &middot; 09:12
          </p>
        </section>
      ) : null}

      {view === "growth" ? (
        <section className="mt-court max-w-[680px]">
          <p className="text-bodysm text-ink-body">
            Compared to the same twelve-month window a year earlier.
          </p>
          <div className="mt-stride flex flex-col">
            {growthRows.map((r) => {
              const change = r.then > 0 ? ((r.now - r.then) / r.then) * 100 : null;
              const isMoney = r.now > 1000;
              return (
                <div
                  key={r.label}
                  className="flex items-baseline justify-between gap-rise border-b border-hair/60 py-rise"
                >
                  <span className="text-bodysm text-ink-body">{r.label}</span>
                  <span className="flex items-baseline gap-stride">
                    <span className="num text-bodysm text-ink">
                      {isMoney ? money(r.now) : num(r.now)}
                    </span>
                    <span className="num w-[92px] text-right text-caption text-ledger-50">
                      {change === null ? "—" : <>&#9650; {pct(change)}</>}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {view === "cash" ? (
        <section className="mt-court max-w-[720px]">
          <LineChart sentence={cashflowSentence} primary={series.cashflow} forecastFrom={5} />
          <p className="mt-rise text-caption text-ink-3">
            The shaded months are a forecast, not a record.
          </p>
        </section>
      ) : null}

      {view === "customers" ? (
        <section className="mt-court max-w-[720px]">
          <LineChart sentence={customersSentence} primary={series.customerCounts} currency={false} />
          {quiet ? (
            <p className="mt-court text-bodysm text-ink-body">
              One customer went quiet: {quiet.name} &mdash; {quiet.note}
            </p>
          ) : null}
        </section>
      ) : null}

      {view === "conversion" ? (
        <section className="mt-court max-w-[560px]">
          <Empty
            kind="unfilled"
            title="Not tracked yet."
            body="Enquiries, site measures and quotes aren't recorded as their own steps yet, so there's no honest funnel to show."
          />
        </section>
      ) : null}

      {view === "marketing" ? (
        <section className="mt-court max-w-[720px]">
          <div className="mt-stride flex flex-col">
            {marketingPerformance.map((r) => (
              <div
                key={r.id}
                className="flex items-baseline justify-between gap-rise border-b border-hair/60 py-rise"
              >
                <span className="text-bodysm text-ink-body">{r.label}</span>
                <span className="flex items-baseline gap-stride">
                  <span className="num text-caption text-ink-3">{r.enquiries} enquiries</span>
                  <span className="num text-bodysm text-ink">
                    {r.opened === null ? "—" : `${r.opened}% opened`}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-atrium max-w-[720px] pb-court">
        <LineChart
          sentence={hoursSentence}
          primary={series.hoursBooked}
          comparison={series.hoursLastYear}
          currency={false}
          forecastFrom={3}
        />
      </section>
    </Room>
  );
}
