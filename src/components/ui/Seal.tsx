"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cx } from "@/lib/utils";
import { D } from "@/lib/motion";

export function Seal({
  open,
  onClose,
  onConfirm,
  consequence,
  label,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  consequence: string;
  label: string;
}) {
  const [held, setHeld] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef(0);

  useEffect(() => {
    if (!open) setHeld(0);
  }, [open]);

  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  function begin() {
    start.current = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - start.current) / 320);
      setHeld(p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else {
        onConfirm();
        onClose();
      }
    };
    raf.current = requestAnimationFrame(tick);
  }

  function end() {
    if (raf.current) cancelAnimationFrame(raf.current);
    setHeld(0);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-stride"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: D.quick }}
        >
          <button aria-label="Cancel" onClick={onClose} className="absolute inset-0 bg-shutter-100/8" />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: D.travel, ease: [0.32, 0, 0.24, 1] }}
            className="sheet relative z-10 w-full max-w-[420px] rounded-sheet border border-hair bg-raise p-bay"
          >
            <p className="text-bodysm text-ink-body">{consequence}</p>
            <div className="mt-bay flex items-center gap-rise">
              <button
                type="button"
                onMouseDown={begin}
                onMouseUp={end}
                onMouseLeave={end}
                onTouchStart={begin}
                onTouchEnd={end}
                onKeyDown={(e) => {
                  if (e.key === " ") begin();
                }}
                onKeyUp={end}
                className={cx(
                  "relative h-10 overflow-hidden rounded-control bg-ledger-80 px-stride text-body font-medium text-vitrine-00",
                )}
              >
                <span className="relative z-10">{label}</span>
                <span
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-filament-40 transition-none"
                  style={{ width: `${held * 100}%` }}
                />
              </button>
              <button type="button" onClick={onClose} className="text-caption text-ink-2 hover:underline">
                Cancel
              </button>
            </div>
            <p className="mt-rise text-caption text-ink-3">Hold the button to seal.</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
