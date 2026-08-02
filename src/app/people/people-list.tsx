"use client";

import { useMemo, useState } from "react";
import { Room } from "@/components/shell";
import { Avatar, Empty, Field, Row, Shelf, Tabs, Token } from "@/components/ui";
import { MarginNote } from "@/components/ai/MarginNote";
import { Proposal } from "@/components/ai/Proposal";
import type { PersonSummary, RoomSignals } from "@/lib/actions/people";
import { cx, money, relativeDays } from "@/lib/utils";

const STANDING_TONE = {
  current: "neutral",
  "over terms": "bad",
  drifting: "caution",
  new: "good",
} as const;

type View = "attention" | "everyone" | "drifting";

export function PeopleList({ people, signals }: { people: PersonSummary[]; signals: RoomSignals }) {
  const [q, setQ] = useState("");
  const [view, setView] = useState<View>("attention");
  const [sort, setSort] = useState("recent");

  const attention = useMemo(() => people.filter((p) => p.attention), [people]);
  const drifting = useMemo(
    () => people.filter((p) => p.standing === "drifting" || p.lastContactDays === null || p.lastContactDays > 60),
    [people],
  );

  const list = useMemo(() => {
    const base = view === "attention" ? attention : view === "drifting" ? drifting : people;
    const term = q.trim().toLowerCase();
    const filtered = base.filter(
      (p) =>
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.contact.toLowerCase().includes(term) ||
        p.relationship.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term)),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "owed") return b.outstanding - a.outstanding;
      if (sort === "lifetime") return b.lifetime - a.lifetime;
      if (sort === "quiet") return (b.lastContactDays ?? Infinity) - (a.lastContactDays ?? Infinity);
      return (a.lastContactDays ?? Infinity) - (b.lastContactDays ?? Infinity);
    });
  }, [view, q, sort, attention, drifting, people]);

  return (
    <Room
      title="Customers"
      meta={`${people.length} on file`}
      actions={
        <Shelf
          label="Recent contact"
          value={sort}
          onChange={setSort}
          align="right"
          items={[
            { key: "recent", label: "Recent contact" },
            { key: "quiet", label: "Quietest first" },
            { key: "owed", label: "Most owed" },
            { key: "lifetime", label: "Lifetime value" },
          ]}
        />
      }
      margin={
        <div className="flex flex-col gap-bay">
          {signals.drifting ? (
            <MarginNote
              text={
                signals.drifting.attention ??
                `${signals.drifting.name} has gone quiet. ${signals.drifting.relationship}`
              }
              confidence="known"
              actions={[
                { label: `Draft a note to ${signals.drifting.contact || signals.drifting.name}`, href: "/table" },
                { label: "Show me why", href: `/people/${signals.drifting.id}` },
              ]}
            />
          ) : null}
          {signals.unanswered ? (
            <Proposal confidence="estimated" method={`Unanswered since ${signals.unanswered.at}.`}>
              {signals.unanswered.personName} asked about &ldquo;{signals.unanswered.subject}&rdquo; on{" "}
              {signals.unanswered.at}. Nobody has replied.
            </Proposal>
          ) : null}
        </div>
      }
    >
      <div id="field" className="pt-step" />

      <Tabs
        value={view}
        onChange={setView}
        items={[
          { key: "attention" as const, label: "Worth attention", count: attention.length },
          { key: "everyone" as const, label: "Everyone", count: people.length },
          { key: "drifting" as const, label: "Going quiet", count: drifting.length },
        ]}
      />

      <div className="mt-bay">
        <Field
          label="Search"
          placeholder="Name, contact, tag, or a phrase from the relationship"
          value={q}
          onChange={setQ}
        />
      </div>

      <div className="mt-bay flex flex-col">
        {list.length === 0 ? (
          <Empty
            kind="unfilled"
            title="No one matches that."
            body="Try a company name, a contact, or a tag such as referrer."
          />
        ) : (
          list.map((p) => (
            <Row key={p.id} href={`/people/${p.id}`}>
              <div className="flex items-start gap-rise">
                <Avatar name={p.name} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-step">
                    <span className="text-bodysm font-medium text-ink">{p.name}</span>
                    <Token tone={STANDING_TONE[p.standing]}>{p.standing}</Token>
                    <span className="text-caption text-ink-3">{p.contact}</span>
                  </div>
                  <p className="mt-tick text-caption text-ink-2">{p.attention ?? p.relationship}</p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <span className={cx("num block text-bodysm", p.outstanding ? "text-ink" : "text-ink-4")}>
                    {p.outstanding ? money(p.outstanding) : "—"}
                  </span>
                  <span className="block text-caption text-ink-3">
                    {p.lastContactDays !== null ? relativeDays(p.lastContactDays) : "no contact on file"}
                  </span>
                </div>
              </div>
            </Row>
          ))
        )}
      </div>

      <p className="mt-court pb-court text-caption text-ink-3">
        No customer is scored or ranked by value. Reasons are shown instead.
      </p>
    </Room>
  );
}
