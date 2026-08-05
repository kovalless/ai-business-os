"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { rooms } from "@/lib/rooms";
import { cx, money } from "@/lib/utils";
import { D } from "@/lib/motion";
import { Gauge } from "@/components/ui";
import { useApertureData, type ApertureData } from "./ApertureProvider";

type Kind = "Go" | "Do" | "Ask" | "Make";
type Item = { id: string; kind: Kind; label: string; sub?: string; href?: string; answer?: string };

function buildIndex(data: ApertureData): Item[] {
  const go: Item[] = rooms.map((r) => ({
    id: `go-${r.key}`,
    kind: "Go",
    label: r.name,
    sub: r.hint,
    href: r.href,
  }));

  const persons: Item[] = data.people.map((p) => ({
    id: `go-p-${p.id}`,
    kind: "Go",
    label: p.name,
    sub: `${p.contact} \u00B7 ${p.standing}`,
    href: `/people/${p.id}`,
  }));

  const inv: Item[] = data.invoices.map((i) => ({
    id: `go-i-${i.id}`,
    kind: "Go",
    label: i.ref,
    sub: `${i.person} \u00B7 ${money(i.amount)} \u00B7 ${i.status}`,
    href: "/ledger",
  }));

  const camp: Item[] = data.campaigns.map((c) => ({
    id: `go-c-${c.id}`,
    kind: "Go",
    label: c.name,
    sub: `Reach \u00B7 ${c.status}`,
    href: "/reach",
  }));

  const note: Item[] = data.notes.map((n) => ({
    id: `go-n-${n.id}`,
    kind: "Go",
    label: n.title,
    sub: `Record \u00B7 ${n.kind}`,
    href: "/record",
  }));

  const task: Item[] = data.tasks
    .filter((t) => !t.done)
    .map((t) => ({ id: `go-t-${t.id}`, kind: "Go", label: t.title, sub: `Work \u00B7 due ${t.due}`, href: "/work" }));

  const doItems: Item[] = [
    { id: "do-1", kind: "Do", label: "Chase unpaid invoices", sub: "2 over terms, \u20AC7,410", href: "/ledger" },
    { id: "do-2", kind: "Do", label: "Requote the three open jobs", sub: "New steel rate", href: "/work" },
    { id: "do-3", kind: "Do", label: "Close the day", sub: "Available after 16:00", href: "/today?close=1" },
  ];

  const ask: Item[] = [
    { id: "ask-1", kind: "Ask", label: "Am I making more than last year?", answer: "Yes. \u20AC48,320 invoiced in the last 30 days, 30% above the same 30 days last year." },
    { id: "ask-2", kind: "Ask", label: "Who owes me money?", answer: "Four customers, \u20AC19,740 in total. \u20AC7,410 of it is Kessler Bau and over 60 days." },
    { id: "ask-3", kind: "Ask", label: "Which work makes the most margin?", answer: "Balustrades: 41% of hours, 38% of margin. Shopfitting is 22% of hours and 9% of margin." },
  ];

  const make: Item[] = [
    { id: "make-1", kind: "Make", label: "New quote", href: "/table?seed=quote" },
    { id: "make-2", kind: "Make", label: "New customer", href: "/people" },
    { id: "make-3", kind: "Make", label: "New note in the Record", href: "/record" },
  ];

  return [...go, ...persons, ...inv, ...camp, ...note, ...task, ...doItems, ...ask, ...make];
}

export function Aperture() {
  const data = useApertureData();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const [answer, setAnswer] = useState<Item | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const index = useMemo(() => buildIndex(data), [data]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const pool = term
      ? index.filter(
          (i) =>
            i.label.toLowerCase().includes(term) || (i.sub ?? "").toLowerCase().includes(term),
        )
      : index.filter((i) => i.kind !== "Go" || rooms.some((r) => r.name === i.label));
    return pool.slice(0, 9);
  }, [q, index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setAnswer(null);
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function choose(item: Item) {
    if (item.kind === "Ask") {
      setAnswer(item);
      return;
    }
    if (item.href) {
      router.push(item.href);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-step rounded-control border border-hair bg-raise px-rise text-caption text-ink-3 transition-colors hover:bg-lift"
      >
        <Search size={14} strokeWidth={1.5} />
        <span className="hidden sm:inline">Search or ask</span>
        <kbd className="ml-step hidden font-mono text-label text-ink-4 sm:inline">&#8984;K</kbd>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center px-stride pt-[16vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: D.quick }}
          >
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-shutter-100/8"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Aperture"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: D.travel, ease: [0.32, 0, 0.24, 1] }}
              className="sheet relative z-10 h-fit w-full max-w-[640px] overflow-hidden rounded-surface border border-hair bg-raise"
            >
              <div className="flex items-center gap-rise border-b border-hair px-stride">
                <Search size={16} strokeWidth={1.5} className="text-ink-3" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setAnswer(null);
                    setCursor(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setCursor((c) => Math.min(c + 1, results.length - 1));
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setCursor((c) => Math.max(c - 1, 0));
                    }
                    if (e.key === "Enter" && results[cursor]) choose(results[cursor]!);
                  }}
                  placeholder="Kessler, requote, am I making more than last year"
                  className="h-12 flex-1 bg-transparent text-body text-ink-body outline-none placeholder:text-ink-4"
                />
              </div>

              {answer ? (
                <div className="border-b border-hair bg-filament-10 px-stride py-stride">
                  <div className="flex items-center gap-step">
                    <Gauge level="known" />
                    <span className="text-label uppercase text-filament-80">Answer</span>
                  </div>
                  <p className="mt-step text-bodysm text-ink-body">{answer.answer}</p>
                  <p className="mt-step font-mono text-caption text-ink-3">
                    Invoices &middot; Bunq &middot; 09:12
                  </p>
                </div>
              ) : null}

              <ul className="max-h-[46vh] overflow-y-auto p-tick">
                {results.length === 0 ? (
                  <li className="px-rise py-stride text-caption text-ink-3">
                    Nothing matches that. Try a customer, an invoice number, or a question.
                  </li>
                ) : (
                  results.map((item, i) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setCursor(i)}
                        onClick={() => choose(item)}
                        className={cx(
                          "flex h-10 w-full items-center gap-rise rounded-control px-rise text-left",
                          i === cursor ? "bg-recess" : "",
                        )}
                      >
                        <span className="w-[38px] shrink-0 text-label uppercase text-ink-4">
                          {item.kind}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-bodysm text-ink-body">
                          {item.label}
                        </span>
                        {item.sub ? (
                          <span className="hidden shrink-0 text-caption text-ink-3 sm:inline">
                            {item.sub}
                          </span>
                        ) : null}
                        {i === cursor ? (
                          item.kind === "Ask" ? (
                            <CornerDownLeft size={14} strokeWidth={1.5} className="text-ink-4" />
                          ) : (
                            <ArrowRight size={14} strokeWidth={1.5} className="text-ink-4" />
                          )
                        ) : null}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
