"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dayPhase } from "@/lib/utils";

type Phase = "dawn" | "trading" | "golden" | "night";
type Ctx = { phase: Phase; setPhase: (p: Phase) => void; auto: boolean; setAuto: (v: boolean) => void };

const NightCtx = createContext<Ctx | null>(null);

export function NightProvider({ children }: { children: React.ReactNode }) {
  const [auto, setAuto] = useState(true);
  const [phase, setPhase] = useState<Phase>("trading");

  useEffect(() => {
    if (!auto) return;
    const apply = () => setPhase(dayPhase());
    apply();
    const t = window.setInterval(apply, 60_000);
    return () => window.clearInterval(t);
  }, [auto]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("night", phase === "night");
    root.dataset.phase = phase;
    const warm = phase === "golden" ? "3%" : "0%";
    root.style.setProperty("--golden", warm);
  }, [phase]);

  const value = useMemo(() => ({ phase, setPhase, auto, setAuto }), [phase, auto]);
  return <NightCtx.Provider value={value}>{children}</NightCtx.Provider>;
}

export function useNight() {
  const ctx = useContext(NightCtx);
  if (!ctx) throw new Error("useNight must be used inside NightProvider");
  return ctx;
}
