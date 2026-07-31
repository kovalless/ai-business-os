"use client";

import Link from "next/link";
import { cx } from "@/lib/utils";
import { Whisper } from "./Whisper";

type Rank = "primary" | "secondary" | "quiet";
type Size = "prominent" | "standard" | "dense";

const RANK: Record<Rank, string> = {
  primary:
    "bg-ledger-80 text-vitrine-00 catch hover:bg-ledger-90 active:translate-y-px active:shadow-none",
  secondary:
    "bg-raise text-ink-body border border-hair hover:bg-lift active:translate-y-px",
  quiet: "text-ink-2 hover:underline underline-offset-2 active:translate-y-px",
};

const SIZE: Record<Size, string> = {
  prominent: "h-12 px-bay text-body",
  standard: "h-10 px-stride text-body",
  dense: "h-8 px-rise text-bodysm",
};

export type ActuatorProps = {
  children: React.ReactNode;
  rank?: Rank;
  size?: Size;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  disabledReason?: string;
  destructive?: boolean;
  className?: string;
  type?: "button" | "submit";
};

export function Actuator({
  children,
  rank = "secondary",
  size = "standard",
  href,
  onClick,
  icon,
  disabled,
  disabledReason,
  destructive,
  className,
  type = "button",
}: ActuatorProps) {
  const base = cx(
    "inline-flex select-none items-center justify-center gap-step rounded-control font-medium",
    "transition-[background-color,color,transform] duration-[90ms] ease-[cubic-bezier(0.32,0,0.24,1)]",
    "min-h-[44px] sm:min-h-0",
    RANK[rank],
    SIZE[size],
    destructive && rank !== "primary" && "text-rust",
    disabled && "cursor-default bg-vitrine-30 text-ink-4 border-transparent hover:bg-vitrine-30",
    className,
  );

  const inner = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  if (disabled) {
    return (
      <span className="inline-flex flex-col gap-tick">
        <span className={base} aria-disabled="true">
          {inner}
        </span>
        {disabledReason ? <Whisper>{disabledReason}</Whisper> : null}
      </span>
    );
  }

  if (href) {
    return (
      <Link href={href} className={base} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} className={base} onClick={onClick}>
      {inner}
    </button>
  );
}
