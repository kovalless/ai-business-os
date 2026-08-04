"use client";

import { useMemo, useState } from "react";
import { Room } from "@/components/shell";
import { Empty, Field, Label, Row, Sill, Tabs, Token } from "@/components/ui";
import { Proposal } from "@/components/ai/Proposal";
import type { WorkspaceDoc, WorkspaceNote } from "@/lib/actions/record";

type View = "pinned" | "documents" | "playbooks" | "meetings";

const KIND_TONE = {
  document: "neutral",
  playbook: "good",
  meeting: "caution",
  process: "neutral",
} as const;

export function RecordView({ documents: docs, notes }: { documents: WorkspaceDoc[]; notes: WorkspaceNote[] }) {
  const [q, setQ] = useState("");
  const [view, setView] = useState<View>("pinned");
  const [openId, setOpenId] = useState<string | null>(docs[0]?.id ?? null);

  const machineNotes = useMemo(() => notes.filter((n) => n.byMachine), [notes]);
  // Notes are already ordered most-recently-updated first (see the query
  // layer), so this is the most recent machine-filed note — replaces the
  // original mock-up's hardcoded Dijkman-specific Proposal text with
  // whichever note is actually most current.
  const featured = machineNotes[0] ?? null;

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base =
      view === "pinned"
        ? docs.filter((d) => d.pinned)
        : view === "documents"
          ? docs.filter((d) => d.kind === "document" || d.kind === "process")
          : view === "playbooks"
            ? docs.filter((d) => d.kind === "playbook")
            : docs.filter((d) => d.kind === "meeting");
    if (!term) return base;
    return docs.filter((d) => d.title.toLowerCase().includes(term) || d.body.toLowerCase().includes(term));
  }, [q, view, docs]);

  return (
    <Room
      title="Knowledge Base"
      meta={`${docs.length + notes.length} entries`}
      margin={
        <div className="flex flex-col gap-bay">
          {featured ? <Proposal confidence="known">{featured.body}</Proposal> : null}
          <div>
            <Label>What links to what</Label>
            <ul className="mt-step flex flex-col gap-step">
              {docs
                .filter((d) => d.links.length)
                .map((d) => (
                  <li key={d.id} className="text-caption text-ink-3">
                    {d.title} &rarr; {d.links.join(", ")}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      }
    >
      <div id="field" className="pt-step" />

      <Field
        label="Search the company memory"
        placeholder="Balustrades, Dijkman, late delivery, powder coating"
        value={q}
        onChange={setQ}
      />
      {q ? <p className="mt-step text-caption text-ink-3">Searching every entry, not just this tab.</p> : null}

      <div className="mt-bay">
        <Tabs
          value={view}
          onChange={setView}
          items={[
            { key: "pinned" as const, label: "Pinned", count: docs.filter((d) => d.pinned).length },
            { key: "documents" as const, label: "Documents" },
            { key: "playbooks" as const, label: "Playbooks" },
            { key: "meetings" as const, label: "Meetings" },
          ]}
        />
      </div>

      <div className="mt-bay flex flex-col">
        {list.length === 0 ? (
          <Empty
            kind="unfilled"
            title="Nothing filed under that yet."
            body="The Knowledge Base holds how you quote, who your suppliers are, what was decided in meetings, and why."
            action="Write the first entry"
            href="/table"
          />
        ) : (
          list.map((d) => (
            <div key={d.id} className="border-b border-hair/60 py-rise">
              <Row onClick={() => setOpenId(openId === d.id ? null : d.id)}>
                <div className="flex flex-wrap items-center gap-step">
                  <span className="text-bodysm text-ink-body">{d.title}</span>
                  <Token tone={KIND_TONE[d.kind]}>{d.kind}</Token>
                  {d.pinned ? <Token tone="machine">pinned</Token> : null}
                  <span className="ml-auto text-caption text-ink-3">
                    {d.owner} &middot; {d.updated}
                  </span>
                </div>
              </Row>
              {openId === d.id ? (
                <div className="px-rise pt-step">
                  <p className="max-w-[560px] text-bodysm text-ink-2">{d.body}</p>
                  {d.links.length ? (
                    <p className="mt-step font-mono text-caption text-ink-3">Linked to {d.links.join(", ")}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <Sill className="mt-court" animate={false} />

      <section className="mt-rise pb-court">
        <Label>Noticed and filed by the machine</Label>
        <div className="mt-rise flex flex-col">
          {machineNotes.map((n) => (
            <Row key={n.id}>
              <div className="flex flex-wrap items-baseline gap-step">
                <span className="text-bodysm text-ink-body">{n.title}</span>
                <span className="ml-auto text-caption text-ink-3">{n.updated}</span>
              </div>
              <p className="mt-tick text-caption text-ink-3">{n.body}</p>
            </Row>
          ))}
        </div>
      </section>
    </Room>
  );
}
