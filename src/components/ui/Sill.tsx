"use client";

import { motion } from "framer-motion";
import { DRAW } from "@/lib/motion";
import { cx } from "@/lib/utils";

export function Sill({ className, animate = true }: { className?: string; animate?: boolean }) {
  if (!animate) return <div className={cx("h-px bg-hair", className)} />;
  return (
    <motion.div
      className={cx("h-px bg-hair origin-left", className)}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ ...DRAW, delay: 0.16 }}
    />
  );
}
