"use client";

import { motion } from "framer-motion";

export function Breath({ narration }: { narration?: string }) {
  return (
    <div className="flex items-center gap-[9px]" aria-live="polite">
      <motion.span
        className="block h-[6px] w-[6px] rounded-full bg-filament-60"
        animate={{ opacity: [0.35, 0.85, 0.35] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
      {narration ? <span className="text-caption text-ink-3">{narration}</span> : null}
    </div>
  );
}
