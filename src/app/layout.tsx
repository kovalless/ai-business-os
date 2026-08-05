import type { Metadata } from "next";
import "./globals.css";
import { Frame } from "@/components/shell";
import { getLedgerFigures } from "@/lib/actions/ledger";
import { getBusinessSettings } from "@/lib/actions/settings";
import { getCurrentMember } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "AI Business OS",
  description: "The daily workspace for a small business.",
};

// Frame (and the Rail inside it) renders on every route, including
// unauthenticated ones like /login — so this fetch is session-aware
// rather than assuming a business exists. getCurrentMember() is the
// non-throwing lookup (same one /login itself uses) precisely because
// this layout must not redirect.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember();
  const rail = member
    ? await (async () => {
        const [business, figures] = await Promise.all([
          getBusinessSettings(member.businessId),
          getLedgerFigures(member.businessId),
        ]);
        return { businessName: business?.name ?? null, standing: figures.standing };
      })()
    : null;

  return (
    <html lang="en">
      <body>
        <a
          href="#field"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-raise focus:px-rise focus:py-step"
        >
          Skip to the field
        </a>
        <Frame rail={rail}>{children}</Frame>
      </body>
    </html>
  );
}
