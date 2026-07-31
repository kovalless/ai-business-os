"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FigureData } from "@/lib/types";
import { cx, num, pct } from "@/lib/utils";
import { FALL } from "@/lib/motion";
import { Label } from "./Label";
import { Gauge } from "./Gauge";
import { Sill } from "./Sill";

const SIZES = {
  xl: { value: "text-fxl", gutter: "w-[34px] -ml-[34px]" },
  l: { value: "text-fl", gutter: "w-[22px] -ml-[22px]" },
  m: { value: "text-fm", gutter: "w-[15px] -ml-[15px]" },
  s: { value: "text-fs", gutter: "w-[11px] -ml-[11px]" },
} as const;

export function Figure({
  data,
  size = "m",
  sill = false,
  className,
}: {
  data: FigureData;
  size?: keyof typeof SIZES;
  sill?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const s = SIZES[size];
  const up = (data.delta?.pct ?? 0) > 0;

  return (
    <div className={cx("min-w-0", className)}>
      <Label>{data.label}</Label>

      <div className="mt-tick flex items-baseline">
        {data.currency ? (
          <span className={cx("num shrink-0 text-right font-medium text-ink-4", s.value, s.gutter)}>
            &euro;
          </span>
        ) : null}
        <span className={cx("num font-medium text-ink", s.value)}>
          {num(Math.abs(data.value))}
        </span>
        {data.unit ? <span className="ml-thread text-caption text-ink-3">{data.unit}</span> : null}
      </div>

      {data.confidence === "estimated" ? (
        <div className="mt-[3px] h-px w-full max-w-[180px] bg-filament-60" />
      ) : null}

      <div className="mt-[9px] flex flex-wrap items-center gap-step text-caption">
        {data.delta ? (
          <span className={up ? "text-ledger-50" : "text-rust"}>
            {up ? "\u25B2" : "\u25BC"} {pct(data.delta.pct)}{" "}
            <span className="text-ink-3">{data.delta.basis}</span>
          </span>
        ) : (
          <span className="text-ink-3">{data.period}</span>
        )}
        {data.confidence ? <Gauge level={data.confidence} /> : null}
      </div>

      {sill ? (
        <>
          <Sill className="mt-rise" />
          {data.reading ? (
            <p className="mt-rise max-w-[480px] text-bodysm text-ink-2">{data.reading}</p>
          ) : null}
        </>
      ) : data.reading ? (
        <p className="mt-step text-caption text-ink-3">{data.reading}</p>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-step block text-left font-mono text-caption text-ink-3 hover:text-ink-2"
        aria-expanded={open}
      >
        {`${data.receipt.sources.join(" \u00B7 ")} \u00B7 ${data.receipt.window.split(", ").pop()}`}
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={FALL}
            className="overflow-hidden"
          >
            <dl className="mt-rise max-w-[420px] rounded-surface bg-recess p-stride text-caption">
              <ReceiptRow k="Definition" v={data.receipt.definition} />
              <ReceiptRow k="Sources" v={data.receipt.sources.join(", ")} />
              <ReceiptRow k="Window" v={data.receipt.window} />
              {data.receipt.excluded ? <ReceiptRow k="Excluded" v={data.receipt.excluded} /> : null}
              <ReceiptRow k="Last full sync" v={data.receipt.syncedAt} />
            </dl>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ReceiptRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-rise py-[3px]">
      <dt className="text-ink-3">{k}</dt>
      <dd className="text-right text-ink-body">{v}</dd>
    </div>
  );
}
