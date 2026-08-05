"use client";

import { createContext, useContext } from "react";
import type { PersonSummary } from "@/lib/actions/people";
import type { ReachCampaign } from "@/lib/actions/reach";
import type { WorkspaceNote } from "@/lib/actions/record";
import type { WorkTask } from "@/lib/actions/work";
import type { Invoice } from "@/lib/types";

export type ApertureData = {
  people: PersonSummary[];
  invoices: Invoice[];
  campaigns: ReachCampaign[];
  notes: WorkspaceNote[];
  tasks: WorkTask[];
};

const EMPTY: ApertureData = { people: [], invoices: [], campaigns: [], notes: [], tasks: [] };
const ApertureCtx = createContext<ApertureData>(EMPTY);

// The command palette (Aperture) is rendered once per room via Room.tsx,
// not once at the Frame level — a plain prop would mean threading this
// through every room's Room usage. A context, populated once from the
// root layout's session-aware fetch, keeps every existing <Aperture />
// call site (inside Room.tsx) unchanged.
export function ApertureProvider({ data, children }: { data: ApertureData; children: React.ReactNode }) {
  return <ApertureCtx.Provider value={data}>{children}</ApertureCtx.Provider>;
}

export function useApertureData() {
  return useContext(ApertureCtx);
}
