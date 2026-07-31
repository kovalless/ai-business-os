"use client";

import Link from "next/link";
import type { Confidence } from "@/lib/types";
import { Gauge } from "@/components/ui";

export function MarginNote({
  text,
  confidence = "known",
  actions = [],
}: {
  text: string;
  confidence?: Confidence;
  actions?: { label: string; href: string }[];
}) {
  return (
    <div>
      <Gauge level={confidence} />
      <p className="mt-rise text-bodysm text-ink-body">{text}</p>
      {actions.length ? (
        <div className="mt-rise flex flex-col items-start gap-step">
          {actions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="text-caption text-ink-2 underline underline-offset-2 hover:text-ink"
            >
              {a.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
