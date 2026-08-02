"use client";

import { useState } from "react";
import { Room } from "@/components/shell";
import { Actuator, Avatar, DataTable, Empty, Label, Sill, Tabs, Timeline, Token } from "@/components/ui";
import type { Column } from "@/components/ui";
import { MarginNote } from "@/components/ai/MarginNote";
import type { ConversationEntry, PersonDetail } from "@/lib/actions/people";
import type { Invoice } from "@/lib/types";
import { money, relativeDays } from "@/lib/utils";

type View = "thread" | "conversations" | "invoices" | "company";

const TONE = { paid: "good", open: "neutral", "over terms": "bad", draft: "machine" } as const;

export function PersonDetailView({ person, companyInfo: info, thread, conversations: talks, invoices: bills }: PersonDetail) {
  const [view, setView] = useState<View>("thread");
  const unanswered = talks.filter((c) => c.unanswered);

  const columns: Column<Invoice>[] = [
    { key: "ref", head: "Invoice", render: (r) => <span className="num">{r.ref}</span> },
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
    { key: "amount", head: "Amount", numeric: true, render: (r) => money(r.amount) },
  ];

  return (
    <Room
      title={person.name}
      meta={`Client since ${person.since}`}
      actions={
        <Actuator size="dense" href="/table">
          Write to them
        </Actuator>
      }
      margin={
        <div className="flex flex-col gap-bay">
          {unanswered.length ? (
            <MarginNote
              text={`${unanswered.length} message${unanswered.length > 1 ? "s have" : " has"} gone unanswered here. The oldest is from ${unanswered[0]!.at}.`}
              confidence="known"
            />
          ) : null}
          {person.attention ? (
            <div>
              <Label>Remember</Label>
              <p className="mt-step text-caption text-ink-3">{person.attention}</p>
            </div>
          ) : null}
        </div>
      }
    >
      <div id="field" className="pt-step" />

      <div className="flex items-start gap-stride">
        <Avatar name={person.name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-bodysm text-ink-body">{person.relationship}</p>
          <div className="mt-step flex flex-wrap gap-step">
            {person.tags.map((t) => (
              <Token key={t}>{t}</Token>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-bay flex flex-wrap gap-court">
        <div>
          <Label>Lifetime</Label>
          <p className="num mt-tick text-fm font-medium text-ink">{money(person.lifetime)}</p>
        </div>
        <div>
          <Label>Outstanding</Label>
          <p className="num mt-tick text-fm font-medium text-ink">
            {person.outstanding ? money(person.outstanding) : "—"}
          </p>
        </div>
        <div>
          <Label>Last contact</Label>
          <p className="mt-tick text-fm font-medium text-ink">
            {person.lastContactDays !== null ? relativeDays(person.lastContactDays) : "no contact on file"}
          </p>
        </div>
      </div>

      <Sill className="mt-bay" />

      <section className="mt-rise">
        <Label>Where this stands</Label>
        <ul className="mt-rise flex flex-col gap-step">
          <li className="text-bodysm text-ink-2">
            Standing is <span className="text-ink">{person.standing}</span>.{" "}
            {info?.terms ? `Terms are ${info.terms}.` : ""}
          </li>
          <li className="text-bodysm text-ink-2">Rhythm: {info?.rhythm || "not established yet"}.</li>
          <li className="text-bodysm text-ink-2">
            Last spoken {person.lastContactDays !== null ? relativeDays(person.lastContactDays) : "— no contact on file"}
            {unanswered.length ? `, and ${unanswered.length} message is waiting on you` : ""}.
          </li>
        </ul>
      </section>

      <div className="mt-court">
        <Tabs
          value={view}
          onChange={setView}
          items={[
            { key: "thread" as const, label: "Thread", count: thread.length },
            { key: "conversations" as const, label: "Conversations", count: talks.length },
            { key: "invoices" as const, label: "Invoices", count: bills.length },
            { key: "company" as const, label: "Company" },
          ]}
        />
      </div>

      <div className="mt-bay pb-court">
        {view === "thread" ? (
          thread.length ? (
            <Timeline entries={thread} />
          ) : (
            <Empty
              kind="unfilled"
              title={`Nothing has happened with ${person.name} yet.`}
              body="Invoices, calls and notes will collect here in one column, oldest at the bottom."
            />
          )
        ) : null}

        {view === "conversations" ? (
          talks.length ? (
            <div className="flex flex-col">
              {talks.map((c: ConversationEntry) => (
                <div key={c.id} className="border-b border-hair/60 py-rise">
                  <div className="flex flex-wrap items-baseline gap-step">
                    <span className="text-bodysm text-ink-body">{c.subject}</span>
                    <Token tone={c.unanswered ? "caution" : "neutral"}>
                      {c.unanswered ? "unanswered" : c.channel}
                    </Token>
                    <span className="ml-auto text-caption text-ink-3">{c.at}</span>
                  </div>
                  <p className="mt-tick text-caption text-ink-2">{c.excerpt}</p>
                </div>
              ))}
            </div>
          ) : (
            <Empty kind="unfilled" title="No conversations on file." body="Email and calls logged here will appear in time order." />
          )
        ) : null}

        {view === "invoices" ? (
          bills.length ? (
            <DataTable columns={columns} rows={bills} emptyLine="No invoices yet." />
          ) : (
            <Empty kind="unfilled" title="Never invoiced." body="This is a supplier or a referrer, not a customer." />
          )
        ) : null}

        {view === "company" && info ? (
          <dl className="max-w-[520px]">
            {[
              ["Address", info.address],
              ["VAT", info.vat],
              ["Terms", info.terms],
              ["Rhythm", info.rhythm],
              ["Owner here", info.owner],
              ["On file since", person.since],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-rise border-b border-hair/60 py-rise">
                <dt className="text-caption text-ink-3">{k}</dt>
                <dd className="text-right text-bodysm text-ink-body">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </Room>
  );
}
