import type { Metadata } from "next";
import "./globals.css";
import { Frame } from "@/components/shell";
import type { ApertureData } from "@/components/shell/ApertureProvider";
import { getLedgerFigures, listInvoices } from "@/lib/actions/ledger";
import { listCampaigns } from "@/lib/actions/reach";
import { listPeople } from "@/lib/actions/people";
import { getKnowledgeBase } from "@/lib/actions/record";
import { listTasks } from "@/lib/actions/work";
import { getBusinessSettings } from "@/lib/actions/settings";
import { getCurrentMember } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "AI Business OS",
  description: "The daily workspace for a small business.",
};

// Extracts a settled promise's value, or a safe fallback if that one
// query failed — so one bad query (e.g. a transient Neon hiccup) only
// degrades the specific piece of shell UI it feeds, instead of failing
// the whole Promise.all and taking down every route in the app with it.
function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  if (result.status === "fulfilled") return result.value;
  console.error("Root layout: shell data fetch failed", result.reason);
  return fallback;
}

// Frame (Rail and the Aperture command palette inside it) renders on
// every route, including unauthenticated ones like /login — so this
// fetch is session-aware rather than assuming a business exists.
// getCurrentMember() is the non-throwing lookup (same one /login itself
// uses) precisely because this layout must not redirect.
//
// The Aperture search index is fetched eagerly here (not lazily when
// the palette opens) so its filtering stays instant and client-side,
// matching the mock's original feel exactly. Fine at Phase 1's
// per-business row counts; worth moving to an on-open fetch once a
// business's data actually grows.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember();

  let rail = null;
  let apertureData: ApertureData = { people: [], invoices: [], campaigns: [], notes: [], tasks: [] };

  if (member) {
    const [businessResult, figuresResult, peopleResult, invoicesResult, campaignsResult, knowledgeBaseResult, tasksResult] =
      await Promise.allSettled([
        getBusinessSettings(member.businessId),
        getLedgerFigures(member.businessId),
        listPeople(member.businessId),
        listInvoices(member.businessId),
        listCampaigns(member.businessId),
        getKnowledgeBase(member.businessId),
        listTasks(member.businessId),
      ]);

    const business = settled(businessResult, null);
    const figures = settled(figuresResult, { standing: null, supporting: [] });
    const people = settled(peopleResult, []);
    const invoices = settled(invoicesResult, []);
    const campaigns = settled(campaignsResult, []);
    const knowledgeBase = settled(knowledgeBaseResult, { documents: [], notes: [] });
    const tasks = settled(tasksResult, []);

    rail = { businessName: business?.name ?? null, standing: figures.standing };
    apertureData = { people, invoices, campaigns, notes: knowledgeBase.notes, tasks };
  }

  return (
    <html lang="en">
      <body>
        <a
          href="#field"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-raise focus:px-rise focus:py-step"
        >
          Skip to the field
        </a>
        <Frame rail={rail} apertureData={apertureData}>
          {children}
        </Frame>
      </body>
    </html>
  );
}
