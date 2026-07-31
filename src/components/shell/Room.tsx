"use client";

import { motion } from "framer-motion";
import { Lintel } from "./Lintel";
import { Margin } from "./Margin";
import { Aperture } from "./Aperture";
import { D } from "@/lib/motion";

export function Room({
  title,
  meta,
  actions,
  margin,
  children,
  wide,
}: {
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  margin: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col border-l border-hair">
        <Lintel
          title={title}
          meta={meta}
          actions={
            <div className="flex items-center gap-rise">
              {actions}
              <Aperture />
            </div>
          }
        />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: D.quick }}
          className="min-h-0 flex-1 overflow-y-auto px-stride pb-[96px] md:px-court md:pb-court"
        >
          <div className={wide ? "w-full" : "max-w-[680px]"}>{children}</div>
        </motion.main>
      </div>
      <Margin>{margin}</Margin>
    </>
  );
}
