"use client";

import { useId } from "react";
import type { SeriesPoint } from "@/lib/types";
import { money, num } from "@/lib/utils";

export function LineChart({
  sentence,
  primary,
  comparison,
  height = 200,
  currency = true,
  forecastFrom,
}: {
  sentence: string;
  primary: SeriesPoint[];
  comparison?: SeriesPoint[];
  height?: number;
  currency?: boolean;
  forecastFrom?: number;
}) {
  const id = useId();
  const w = 640;
  const padL = 8;
  const padR = 64;
  const padT = 16;
  const padB = 28;
  const max = Math.max(...primary.map((p) => p.value), ...(comparison ?? []).map((p) => p.value));
  const top = Math.ceil((max * 1.12) / 1000) * 1000;
  const step = (w - padL - padR) / Math.max(1, primary.length - 1);
  const y = (v: number) => padT + (1 - v / top) * (height - padT - padB);
  const path = (pts: SeriesPoint[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${padL + i * step} ${y(p.value)}`).join(" ");

  return (
    <figure className="w-full">
      <figcaption className="text-bodysm text-ink-body">{sentence}</figcaption>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        className="mt-stride w-full"
        role="img"
        aria-label={sentence}
      >
        <line
          x1={padL}
          x2={w - padR}
          y1={height - padB}
          y2={height - padB}
          stroke="var(--v-hair)"
          strokeWidth="1"
        />
        {comparison ? (
          <path
            d={path(comparison)}
            fill="none"
            stroke="var(--color-iron)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        ) : null}
        <path d={path(primary)} fill="none" stroke="var(--color-ledger-60)" strokeWidth="2" />
        {forecastFrom !== undefined ? (
          <rect
            x={padL + forecastFrom * step}
            y={padT}
            width={w - padR - (padL + forecastFrom * step)}
            height={height - padT - padB}
            fill="var(--color-filament-40)"
            opacity="0.16"
          />
        ) : null}
        {primary.map((p, i) => (
          <g key={`${id}-${p.label}`}>
            <text
              x={padL + i * step}
              y={height - 8}
              textAnchor="middle"
              fontSize="11"
              fill="var(--v-ink-3)"
            >
              {p.label}
            </text>
            {p.annotation ? (
              <>
                <line
                  x1={padL + i * step}
                  x2={padL + i * step}
                  y1={padT}
                  y2={height - padB}
                  stroke="var(--v-hair)"
                  strokeWidth="1"
                />
                <text
                  x={padL + i * step + 4}
                  y={padT + 10}
                  fontSize="11"
                  fill="var(--v-ink-3)"
                >
                  {p.annotation}
                </text>
              </>
            ) : null}
          </g>
        ))}
        <text
          x={w - padR + 8}
          y={y(primary[primary.length - 1]!.value) + 4}
          fontSize="12"
          fill="var(--color-ledger-60)"
        >
          {currency ? money(primary[primary.length - 1]!.value) : num(primary[primary.length - 1]!.value)}
        </text>
        {comparison ? (
          <text
            x={w - padR + 8}
            y={y(comparison[comparison.length - 1]!.value) + 4}
            fontSize="12"
            fill="var(--color-iron)"
          >
            last year
          </text>
        ) : null}
      </svg>
    </figure>
  );
}

export function BarPair({
  sentence,
  rows,
}: {
  sentence: string;
  rows: { label: string; hours: number; margin: number }[];
}) {
  return (
    <figure className="w-full">
      <figcaption className="text-bodysm text-ink-body">{sentence}</figcaption>
      <div className="mt-stride flex flex-col gap-rise">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-bodysm text-ink-body">{r.label}</span>
              <span className="num text-caption text-ink-3">
                {r.hours}% of hours &middot; {r.margin}% of margin
              </span>
            </div>
            <div className="mt-step flex gap-thread">
              <div className="h-[2px] bg-iron" style={{ width: `${r.hours * 2}%` }} />
            </div>
            <div className="mt-[3px] flex gap-thread">
              <div className="h-[2px] bg-ledger-60" style={{ width: `${r.margin * 2}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-stride flex gap-stride">
        <span className="text-caption text-ink-3">
          <span className="mr-step inline-block h-[2px] w-4 align-middle bg-iron" />
          hours
        </span>
        <span className="text-caption text-ink-3">
          <span className="mr-step inline-block h-[2px] w-4 align-middle bg-ledger-60" />
          margin
        </span>
      </div>
    </figure>
  );
}

export function Sparkline({ points }: { points: SeriesPoint[] }) {
  const max = Math.max(...points.map((p) => p.value));
  const min = Math.min(...points.map((p) => p.value));
  const span = Math.max(1, max - min);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * 80} ${20 - ((p.value - min) / span) * 18}`)
    .join(" ");
  return (
    <svg viewBox="0 0 80 22" className="h-[22px] w-20" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--color-ledger-60)" strokeWidth="1.5" />
    </svg>
  );
}
