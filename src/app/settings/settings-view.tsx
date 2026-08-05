"use client";

import { useState } from "react";
import { Room } from "@/components/shell";
import { useNight } from "@/components/shell/NightProvider";
import { Actuator, Empty, Field, Label, Row, Sill, Toggle, Token, Whisper } from "@/components/ui";
import type { BusinessSettings, ConnectedSource } from "@/lib/actions/settings";

export function SettingsView({
  business,
  sources,
}: {
  business: BusinessSettings | null;
  sources: ConnectedSource[];
}) {
  const { phase, setPhase, auto, setAuto } = useNight();
  const [dense, setDense] = useState(false);
  const [sound, setSound] = useState(false);
  const [name, setName] = useState(business?.name ?? "");

  return (
    <Room
      title="Settings"
      margin={
        <div>
          <Label>What the machine may do</Label>
          <p className="mt-step text-caption text-ink-3">
            It drafts anywhere. It sends nothing. Sending rights are granted one class at a time,
            with a limit, and can be withdrawn without notice.
          </p>
        </div>
      }
    >
      <div id="field" className="pt-step" />

      <section>
        <Label>The business</Label>
        <div className="mt-rise flex flex-col gap-stride">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Trade" value={business?.trade ?? ""} readOnly />
          <Field label="Standing figure" value={business?.standingFigureLabel ?? ""} readOnly />
          <Whisper>
            The standing figure is the one number on every screen. Changing it changes what you see
            first every morning.
          </Whisper>
        </div>
      </section>

      <Sill className="mt-court" />

      <section className="mt-court">
        <Label>Sources</Label>
        <div className="mt-rise flex flex-col">
          {sources.length === 0 ? (
            <Empty
              kind="unfilled"
              title="No accounts connected yet."
              body="Connect a bank, card processor, or invoicing tool to bring real balances and syncs into this screen."
            />
          ) : (
            sources.map((s) => (
              <Row
                key={s.id}
                actions={
                  s.ok ? null : (
                    <Actuator size="dense" rank="primary">
                      Reconnect
                    </Actuator>
                  )
                }
              >
                <div className="flex items-center gap-step">
                  <span className="text-bodysm text-ink-body">{s.name}</span>
                  {s.ok ? null : <Token tone="bad">expired</Token>}
                  <span className="ml-auto text-caption text-ink-3">{s.detail}</span>
                </div>
              </Row>
            ))
          )}
        </div>
      </section>

      <section className="mt-court">
        <Label>The room</Label>
        <div className="mt-rise flex flex-col gap-stride">
          <SettingRow
            title="Opening hours"
            detail="The ground shifts temperature across the working day. Turn it off and it holds at Trading."
          >
            <Toggle checked={auto} onChange={setAuto} label="Follow opening hours" />
          </SettingRow>

          {!auto ? (
            <div className="flex flex-wrap gap-step">
              {(["dawn", "trading", "golden", "night"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPhase(p)}
                  className={
                    p === phase
                      ? "rounded-control border border-hair bg-recess px-rise py-step text-caption text-ink"
                      : "rounded-control border border-transparent px-rise py-step text-caption text-ink-3 hover:text-ink-2"
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          ) : null}

          <SettingRow title="Close density" detail="Row heights drop from 40 to 32.">
            <Toggle checked={dense} onChange={setDense} label="Close density" />
          </SettingRow>

          <SettingRow
            title="Sound"
            detail="Three sounds exist: seal, arrive, close. Off by default."
          >
            <Toggle checked={sound} onChange={setSound} label="Sound" />
          </SettingRow>
        </div>
      </section>

      <section className="mt-court pb-court">
        <Label>Keyboard</Label>
        <p className="mt-rise text-bodysm text-ink-2">
          Press <span className="font-mono text-caption">?</span> anywhere for the full list.
        </p>
      </section>
    </Room>
  );
}

function SettingRow({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-stride">
      <div className="min-w-0">
        <p className="text-bodysm text-ink-body">{title}</p>
        <p className="mt-tick max-w-[420px] text-caption text-ink-3">{detail}</p>
      </div>
      <div className="mt-[2px] shrink-0">{children}</div>
    </div>
  );
}
