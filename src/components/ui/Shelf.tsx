"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/utils";
import { QUICK } from "@/lib/motion";

export type ShelfItem = { key: string; label: string; onSelect?: () => void };

export function Shelf({
  label,
  items,
  value,
  onChange,
  align = "left",
  className,
}: {
  label?: string;
  items: ShelfItem[];
  value?: string;
  onChange?: (key: string) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function away(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const current = items.find((i) => i.key === value);

  return (
    <div ref={ref} className={cx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-step rounded-control border border-hair bg-raise px-rise text-bodysm text-ink-body transition-colors duration-[90ms] hover:bg-lift"
      >
        <span>{current?.label ?? label}</span>
        <ChevronDown size={14} strokeWidth={1.5} className="text-ink-3" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={QUICK}
            className={cx(
              "shelf absolute z-40 mt-step min-w-[200px] rounded-surface border border-hair bg-raise p-tick",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {items.map((item) => (
              <button
                key={item.key}
                role="menuitem"
                onClick={() => {
                  item.onSelect?.();
                  onChange?.(item.key);
                  setOpen(false);
                }}
                className={cx(
                  "flex h-8 w-full items-center rounded-control px-rise text-left text-bodysm transition-colors duration-[90ms]",
                  item.key === value ? "text-ink" : "text-ink-2",
                  "hover:bg-recess",
                )}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
