"use client";

import { cx } from "@/lib/utils";

export function Lintel({
  title,
  meta,
  actions,
  className,
}: {
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cx(
        "flex h-14 shrink-0 items-center justify-between gap-stride px-stride md:px-court",
        className,
      )}
    >
      <h1 className="text-title font-medium text-ink">{title}</h1>
      <div className="flex items-center gap-rise">
        {meta ? <span className="hidden text-caption text-ink-3 sm:inline">{meta}</span> : null}
        {actions}
      </div>
    </header>
  );
}
