"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useMargin } from "./MarginProvider";
import { cx } from "@/lib/utils";
import { QUICK, D } from "@/lib/motion";

export function Margin({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useMargin();

  return (
    <>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.aside
            key="margin"
            aria-label="The margin"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 344, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: D.travel, ease: [0.32, 0, 0.24, 1] }}
            className="relative hidden shrink-0 overflow-hidden border-l border-filament-60 bg-recess lg:block"
          >
            <div className="w-[344px] p-bay">
              <div className="flex items-center justify-between">
                <span className="text-label uppercase text-ink-3">The margin</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Collapse the margin"
                  className="text-ink-3 hover:text-ink-2"
                >
                  <PanelRightClose size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="mt-bay">{children}</div>
            </div>
          </motion.aside>
        ) : (
          <motion.button
            key="edge"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open the margin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={QUICK}
            className="hidden w-[12px] shrink-0 border-l border-filament-60 bg-recess lg:block"
          />
        )}
      </AnimatePresence>

      <MobileMargin>{children}</MobileMargin>
    </>
  );
}

function MobileMargin({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useMargin();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the margin"
        className={cx(
          "fixed bottom-[72px] right-stride z-30 flex h-10 items-center gap-step rounded-control border border-filament-60 bg-filament-10 px-rise text-caption text-filament-80 lg:hidden",
          open && "hidden",
        )}
      >
        <PanelRightOpen size={15} strokeWidth={1.5} />
        Margin
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: D.travel, ease: [0.32, 0, 0.24, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 max-h-[62vh] overflow-y-auto rounded-t-sheet border-t border-filament-60 bg-recess p-bay lg:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-label uppercase text-ink-3">The margin</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-caption text-ink-2"
              >
                Close
              </button>
            </div>
            <div className="mt-bay pb-atrium">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
