"use client";

import { useState } from "react";
import type { Confidence } from "@/lib/types";
import { cx } from "@/lib/utils";
import { Actuator, Gauge, Whisper } from "@/components/ui";

export function Proposal({
  children,
  confidence = "estimated",
  method,
  onAccept,
  onDismiss,
  acceptLabel = "Use this",
  className,
}: {
  children: React.ReactNode;
  confidence?: Confidence;
  method?: string;
  onAccept?: () => void;
  onDismiss?: () => void;
  acceptLabel?: string;
  className?: string;
}) {
  const [accepted, setAccepted] = useState(false);
  const [gone, setGone] = useState(false);

  if (gone) return null;

  return (
    <div
      className={cx(
        "rounded-surface rounded-l-none border-l p-stride",
        "transition-[background-color,border-color] duration-[240ms] ease-[cubic-bezier(0.32,0,0.24,1)]",
        accepted ? "border-hair bg-recess" : "border-filament-60 bg-filament-10",
        className,
      )}
    >
      <div className="text-bodysm text-ink-body">{children}</div>

      {method && !accepted ? <Whisper className="mt-step">{method}</Whisper> : null}

      <div className="mt-rise flex flex-wrap items-center gap-rise">
        {accepted ? (
          <span className="text-caption text-ink-3">Yours now. Filed at 09:14.</span>
        ) : (
          <>
            <Actuator
              size="dense"
              onClick={() => {
                setAccepted(true);
                onAccept?.();
              }}
            >
              {acceptLabel}
            </Actuator>
            <button
              type="button"
              onClick={() => {
                setGone(true);
                onDismiss?.();
              }}
              className="text-caption text-ink-2 underline-offset-2 hover:underline"
            >
              Not this
            </button>
            <Gauge level={confidence} className="ml-auto" />
          </>
        )}
      </div>
    </div>
  );
}
