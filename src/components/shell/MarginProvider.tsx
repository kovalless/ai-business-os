"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useIsDesktop } from "@/lib/hooks";

type Ctx = { open: boolean; setOpen: (v: boolean) => void; toggle: () => void };
const MarginCtx = createContext<Ctx | null>(null);

export function MarginProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const desktop = useIsDesktop();

  useEffect(() => {
    if (!desktop) setOpen(false);
  }, [desktop]);

  const value = useMemo(
    () => ({ open, setOpen, toggle: () => setOpen(!open) }),
    [open],
  );

  return <MarginCtx.Provider value={value}>{children}</MarginCtx.Provider>;
}

export function useMargin() {
  const ctx = useContext(MarginCtx);
  if (!ctx) throw new Error("useMargin must be used inside MarginProvider");
  return ctx;
}
