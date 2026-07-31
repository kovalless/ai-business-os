"use client";

import Link from "next/link";
import { cx } from "@/lib/utils";

export function Row({
  children,
  href,
  onClick,
  actions,
  selected,
  dense,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  actions?: React.ReactNode;
  selected?: boolean;
  dense?: boolean;
  className?: string;
}) {
  const body = (
    <div
      className={cx(
        "group relative flex w-full items-center gap-stride rounded-control px-rise text-left",
        dense ? "min-h-8" : "min-h-10",
        "py-[6px] transition-colors duration-[90ms]",
        selected ? "bg-ledger-10" : "hover:bg-recess",
        className,
      )}
    >
      {selected ? (
        <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-ledger-80" />
      ) : null}
      <div className="min-w-0 flex-1">{children}</div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-rise opacity-0 transition-opacity duration-[90ms] group-hover:opacity-100 group-focus-within:opacity-100">
          {actions}
        </div>
      ) : null}
    </div>
  );

  if (href) return <Link href={href}>{body}</Link>;
  if (onClick)
    return (
      <button type="button" onClick={onClick} className="w-full">
        {body}
      </button>
    );
  return body;
}
