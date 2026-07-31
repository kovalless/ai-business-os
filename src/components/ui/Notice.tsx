"use client";

import { motion } from "framer-motion";
import { FALL } from "@/lib/motion";
import { cx } from "@/lib/utils";
import { Actuator } from "./Actuator";

export function Notice({
  what,
  means,
  action,
  onAction,
  tone = "neutral",
  className,
}: {
  what: string;
  means?: string;
  action?: string;
  onAction?: () => void;
  tone?: "neutral" | "money" | "machine";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={FALL}
      role="status"
      className={cx(
        "rounded-surface p-stride",
        tone === "machine" ? "bg-filament-10 border-l border-filament-60 rounded-l-none" : "bg-recess",
        className,
      )}
    >
      <p className={cx("text-bodysm", tone === "money" ? "text-rustdeep" : "text-ink-body")}>
        {what}
      </p>
      {means ? <p className="mt-tick text-caption text-ink-3">{means}</p> : null}
      {action ? (
        <div className="mt-rise">
          <Actuator size="dense" onClick={onAction}>
            {action}
          </Actuator>
        </div>
      ) : null}
    </motion.div>
  );
}
