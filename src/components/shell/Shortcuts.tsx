"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { rooms } from "@/lib/rooms";
import { D } from "@/lib/motion";
import { useMargin } from "./MarginProvider";

const GO: Record<string, string> = {
  t: "/today",
  a: "/table",
  c: "/people",
  m: "/reach",
  w: "/work",
  l: "/ledger",
  k: "/record",
  v: "/long-view",
  s: "/settings",
};

export function Shortcuts() {
  const router = useRouter();
  const { toggle } = useMargin();
  const [help, setHelp] = useState(false);
  const [pendingGo, setPendingGo] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing) return;

      if (e.key === "?") {
        e.preventDefault();
        setHelp((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setHelp(false);
        setPendingGo(false);
        return;
      }
      if (e.key.toLowerCase() === "m" && !pendingGo) {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key.toLowerCase() === "g" && !pendingGo) {
        setPendingGo(true);
        window.setTimeout(() => setPendingGo(false), 1400);
        return;
      }
      if (pendingGo) {
        const href = GO[e.key.toLowerCase()];
        setPendingGo(false);
        if (href) {
          e.preventDefault();
          router.push(href);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingGo, router, toggle]);

  return (
    <AnimatePresence>
      {pendingGo ? (
        <motion.div
          key="pending"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: D.instant }}
          className="fixed bottom-stride left-1/2 z-50 -translate-x-1/2 rounded-control border border-hair bg-raise px-rise py-step text-caption text-ink-3 shelf"
        >
          Go to&#8230; press a room letter
        </motion.div>
      ) : null}

      {help ? (
        <motion.div
          key="help"
          className="fixed inset-0 z-50 flex items-center justify-center px-stride"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: D.quick }}
        >
          <button
            aria-label="Close"
            onClick={() => setHelp(false)}
            className="absolute inset-0 bg-shutter-100/8"
          />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: D.travel, ease: [0.32, 0, 0.24, 1] }}
            className="sheet relative z-10 w-full max-w-[520px] rounded-sheet border border-hair bg-raise p-bay"
          >
            <p className="text-label uppercase text-ink-3">Keyboard</p>
            <div className="mt-stride h-px bg-hair" />
            <dl className="mt-stride grid grid-cols-[110px_1fr] gap-x-stride gap-y-step text-bodysm">
              <dt className="font-mono text-caption text-ink-3">&#8984;K</dt>
              <dd className="text-ink-body">Open the Aperture</dd>
              <dt className="font-mono text-caption text-ink-3">g then key</dt>
              <dd className="text-ink-body">
                {rooms.map((r) => r.name).join(", ")}, Settings
              </dd>
              <dt className="font-mono text-caption text-ink-3">m</dt>
              <dd className="text-ink-body">Show or hide the margin</dd>
              <dt className="font-mono text-caption text-ink-3">/</dt>
              <dd className="text-ink-body">Filter within a surface</dd>
              <dt className="font-mono text-caption text-ink-3">esc</dt>
              <dd className="text-ink-body">Close one layer</dd>
              <dt className="font-mono text-caption text-ink-3">?</dt>
              <dd className="text-ink-body">This list</dd>
            </dl>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
