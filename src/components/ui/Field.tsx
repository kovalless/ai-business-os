"use client";

import { cx } from "@/lib/utils";
import { Label } from "./Label";
import { Whisper } from "./Whisper";

export function Field({
  label,
  whisper,
  error,
  value,
  onChange,
  placeholder,
  type = "text",
  numeric,
  readOnly,
  disabled,
  className,
  id,
}: {
  label?: string;
  whisper?: string;
  error?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  numeric?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  if (readOnly) {
    return (
      <div className={className}>
        {label ? <Label>{label}</Label> : null}
        <p className={cx("mt-step text-body text-ink-body", numeric && "num")}>{value}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="block">
          <Label>{label}</Label>
        </label>
      ) : null}
      <input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={cx(
          "mt-step h-10 w-full rounded-control border bg-raise px-rise text-body text-ink-body",
          "placeholder:text-ink-4 transition-colors duration-[90ms]",
          error ? "border-rust" : "border-hair hover:border-vitrine-30",
          "focus:border-ledger-60 focus:outline-none focus:ring-2 focus:ring-ledger-60/0",
          disabled && "bg-recess text-ink-4",
          numeric && "num",
        )}
      />
      {error ? (
        <Whisper tone="error" className="mt-tick">
          {error}
        </Whisper>
      ) : whisper ? (
        <Whisper className="mt-tick">{whisper}</Whisper>
      ) : null}
    </div>
  );
}
