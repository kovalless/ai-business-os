"use client";

import { useState } from "react";
import { Room } from "@/components/shell";
import { Actuator, Breath, Field, Label, Sill, Token } from "@/components/ui";
import { Proposal } from "@/components/ai/Proposal";

// This scenario (drafting a chase email to Martin Kessler) is a fixed
// illustration of what the AI drafting surface looks like mid-use, not
// a live document. There's no schema for an in-progress, per-scenario
// AI draft (that would be a new feature, out of scope here) — only the
// Voice list below is real, sourced from the business's own
// voice_rules. Kept intentionally mocked; see the migration summary.
const SEED = `Martin,

The balustrade at Oberkassel has been in use since February and the handrail extension since May. Two invoices are still open, VC-2026-109 and VC-2026-118, together €7,410.

I know the payment run moved to July. Could you tell me which week it lands so I can plan the September frames around it?

Hope the knee is behaving.

Joris`;

export function TableView({ voice }: { voice: string[] }) {
  const [draft, setDraft] = useState(SEED);
  const [working, setWorking] = useState(false);
  const [instruction, setInstruction] = useState("");

  return (
    <Room
      title="The Table"
      meta="Chase — Kessler Bau"
      actions={<Actuator size="dense">File this</Actuator>}
      margin={
        <div className="flex flex-col gap-bay">
          {working ? <Breath narration="Reading the last four payment runs" /> : null}

          <Proposal
            confidence="known"
            method="Both previous payments landed within 6 days of a phone call, not an email."
            acceptLabel="Use this line"
          >
            Add a sentence naming the September job. Last two times, a named upcoming job moved the
            payment inside a week.
          </Proposal>

          <Proposal confidence="guessing" acceptLabel="Soften it">
            The opening is slightly cool for a five-year customer. Want it warmer?
          </Proposal>

          <div>
            <Label>Working from</Label>
            <p className="mt-step text-caption text-ink-3">
              18 months of invoices, 340 customers, your Voice, the September calendar.
            </p>
          </div>
        </div>
      }
    >
      <div id="field" className="pt-step" />

      <div className="flex flex-wrap items-center gap-step">
        <Token tone="machine">Draft</Token>
        <span className="text-caption text-ink-3">Written from your Voice &middot; not sent</span>
      </div>

      <div className="mt-stride">
        <Label>Email to Martin Kessler</Label>
        <Sill className="mt-rise" />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={16}
          className="mt-stride w-full resize-none bg-transparent text-body leading-[23px] text-ink-body outline-none"
        />
      </div>

      <div className="mt-court">
        <Label>Your voice</Label>
        <ul className="mt-rise flex flex-col gap-step">
          {voice.map((v) => (
            <li key={v} className="text-caption text-ink-3">
              {v}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-court border-t border-hair pt-bay">
        <Field
          label="Direction"
          placeholder="Make it shorter and mention the September dates"
          value={instruction}
          onChange={setInstruction}
        />
        <div className="mt-rise flex flex-wrap items-center gap-rise">
          <Actuator
            rank="primary"
            size="dense"
            onClick={() => {
              setWorking(true);
              window.setTimeout(() => setWorking(false), 2600);
            }}
          >
            Rewrite
          </Actuator>
          <span className="text-caption text-ink-3">Changed 4 times today &middot; see the versions</span>
        </div>
      </div>
    </Room>
  );
}
