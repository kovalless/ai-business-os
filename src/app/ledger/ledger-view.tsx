"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Room } from "@/components/shell";
import { DataTable, Empty, Figure, Grain, Label, Sill, Token } from "@/components/ui";
import type { Column, GrainValue } from "@/components/ui";
import { Proposal } from "@/components/ai/Proposal";
import type { LedgerSignals } from "@/lib/actions/ledger";
import type { FigureData, Invoice } from "@/lib/types";
import { money } from "@/lib/utils";

const TONE = {
  paid: "good",
  open: "neutral",
  "over terms": "bad",
  draft: "machine",
} as const;

export function LedgerView({
  standing,
  supporting,
  invoices,
  signals,
}: {
  standing: FigureData | null;
  supporting: FigureData[];
  invoices: Invoice[];
  signals: LedgerSignals;
}) {
  const [grain, setGrain] = useState<GrainValue>("Month");
  const [filter, setFilter] = useState<"all" | "open" | "over terms">("all");
  const [blocked, setBlocked] = useState(false);

  const rows = useMemo(
    () => invoices.filter((i) => (filter === "all" ? true : i.status === filter)),
    [filter, invoices],
  );

  const columns: Column<Invoice>[] = [
    {
      key: "ref",
      head: "Invoice",
      render: (r) => <span className="num text-ink-body">{r.ref}</span>,
    },
    {
      key: "person",
      head: "Customer",
      render: (r) => (
        <Link href={`/people/${r.personId}`} className="text-ink-body hover:underline">
          {r.person}
        </Link>
      ),
    },
    { key: "job", head: "Job", render: (r) => <span className="text-ink-3">{r.job}</span> },
    { key: "due", head: "Due", render: (r) => <span className="text-ink-3">{r.due}</span> },
    {
      key: "status",
      head: "Standing",
      render: (r) => (
        <span className="flex items-center gap-step">
          <Token tone={TONE[r.status]}>{r.status}</Token>
          {r.daysOver ? <span className="num text-caption text-rust">{r.daysOver}d</span> : null}
        </span>
      ),
    },
    {
      key: "amount",
      head: "Amount",
      numeric: true,
      render: (r) => <span className="text-ink">{money(r.amount)}</span>,
    },
  ];

  if (blocked) {
    return (
      <Room title="Ledger" margin={<p className="text-caption text-ink-3">Waiting for the feed.</p>}>
        <Empty
          kind="blocked"
          title="Your cash figure is 46 days old."
          body="The Bunq connection expired on 12 June. Everything below it is from before that date."
          action="Reconnect Bunq"
          href="/settings"
        />
        <button
          type="button"
          onClick={() => setBlocked(false)}
          className="mt-stride text-caption text-ink-3 underline underline-offset-2"
        >
          Pretend it reconnected
        </button>
      </Room>
    );
  }

  return (
    <Room
      title="Ledger"
      wide
      actions={<Grain value={grain} onChange={setGrain} options={["Week", "Month", "Quarter"]} />}
      margin={
        <div className="flex flex-col gap-bay">
          {signals.mostOverdue ? (
            <Proposal confidence="known" acceptLabel={signals.mostOverdue.count > 1 ? "Chase all" : "Chase"}>
              {signals.mostOverdue.personName} has {signals.mostOverdue.count} invoice
              {signals.mostOverdue.count > 1 ? "s" : ""} past {signals.mostOverdue.maxDaysOver} days,{" "}
              {money(signals.mostOverdue.totalOverdue)} together.
            </Proposal>
          ) : null}
        </div>
      }
    >
      <div id="field" className="pt-step" />

      {standing ? (
        <div className="max-w-[680px]">
          <Figure data={standing} size="l" sill />
        </div>
      ) : (
        <Empty kind="unfilled" title="No cash figure on file." body="Connect a source in Settings to see cash on hand." />
      )}

      <div className="mt-bay flex flex-wrap gap-court">
        {supporting.map((f) => (
          <Figure key={f.id} data={f} size="m" className="min-w-[150px]" />
        ))}
      </div>

      <div className="mt-court flex flex-wrap items-center gap-rise">
        <Label>Invoices</Label>
        <div className="flex gap-step">
          {(["all", "open", "over terms"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                f === filter
                  ? "text-caption text-ink underline underline-offset-4"
                  : "text-caption text-ink-3 hover:text-ink-2"
              }
            >
              {f}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setBlocked(true)}
          className="ml-auto text-caption text-ink-4 underline underline-offset-2"
        >
          Show the blocked state
        </button>
      </div>

      <div className="mt-rise pb-court">
        <DataTable columns={columns} rows={rows} emptyLine="No invoices in this filter." />
      </div>
      <Sill animate={false} className="opacity-0" />
    </Room>
  );
}
