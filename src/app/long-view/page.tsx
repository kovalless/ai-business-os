"use client";

import { useState } from "react";
import { Room } from "@/components/shell";
import {
  BarPair,
  Funnel,
  Gauge,
  Grain,
  Label,
  LineChart,
  Row,
  Shelf,
  Sill,
} from "@/components/ui";
import type { GrainValue } from "@/components/ui";
import { MarginNote } from "@/components/ai/MarginNote";
import {
  cashflowSeries,
  customerCounts,
  funnelSteps,
  growthRows,
  hoursBooked,
  hoursLastYear,
  insights,
  marginByWork,
  priorYearSeries,
  questions,
  reachPerformance,
  revenueSeries,
} from "@/lib/data";
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

export default function LongViewPage() {
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
          <MarginNote
            text="Next week is the first week in three years where booked hours fall below 280. It is the week after the summer close, so it may simply be the calendar."
            confidence="guessing"
          />
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
          <LineChart
            sentence="Invoiced work is 30% above the same six months last year, and the gap widened after the March rate change."
            primary={revenueSeries}
            comparison={priorYearSeries}
          />
          <p className="mt-rise font-mono text-caption text-ink-3">
            Invoices &middot; 30 Jan &ndash; 29 Jul &middot; 09:12
          </p>
          <div className="mt-court">
            <BarPair
              sentence="Shopfitting takes 22% of the workshop and returns 9% of the margin."
              rows={marginByWork}
            />
          </div>
        </section>
      ) : null}

      {view === "growth" ? (
        <section className="mt-court max-w-[680px]">
          <p className="text-bodysm text-ink-body">
            Every measure of size is up on twelve months ago, and average job value is up most.
          </p>
          <div className="mt-stride flex flex-col">
            {growthRows.map((r) => {
              const change = ((r.now - r.then) / r.then) * 100;
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
                      &#9650; {pct(change)}
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
          <LineChart
            sentence="Cash recovers through August and September if the two open Kessler invoices land."
            primary={cashflowSeries}
            forecastFrom={5}
          />
          <p className="mt-rise text-caption text-ink-3">
            The shaded months are a forecast, not a record.
          </p>
        </section>
      ) : null}

      {view === "customers" ? (
        <section className="mt-court max-w-[720px]">
          <LineChart
            sentence="Twenty-four customers have ordered in the last twelve months, five more than a year ago."
            primary={customerCounts}
            currency={false}
          />
          <p className="mt-court text-bodysm text-ink-body">
            One customer went quiet: Brouwer &amp; Zn, after four years of monthly orders.
          </p>
        </section>
      ) : null}

      {view === "conversion" ? (
        <section className="mt-court max-w-[560px]">
          <Funnel
            sentence="Thirty-seven per cent of enquiries become jobs, and the biggest fall is at the site measure, where you decline work."
            steps={funnelSteps}
          />
        </section>
      ) : null}

      {view === "marketing" ? (
        <section className="mt-court max-w-[720px]">
          <p className="text-bodysm text-ink-body">
            The second send of a season has out-produced the first in each of the last three seasons.
          </p>
          <div className="mt-stride flex flex-col">
            {reachPerformance.map((r) => (
              <div
                key={r.label}
                className="flex items-baseline justify-between gap-rise border-b border-hair/60 py-rise"
              >
                <span className="text-bodysm text-ink-body">{r.label}</span>
                <span className="flex items-baseline gap-stride">
                  <span className="num text-caption text-ink-3">{r.enquiries} enquiries</span>
                  <span className="num text-bodysm text-ink">{money(r.value)}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-atrium max-w-[720px] pb-court">
        <LineChart
          sentence="Booked workshop hours fall to 271 next week, 18% below the same week last year."
          primary={hoursBooked}
          comparison={hoursLastYear}
          currency={false}
          forecastFrom={3}
        />
      </section>
    </Room>
  );
}
