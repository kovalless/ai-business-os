import { getLedgerFigures, getLedgerSignals, listInvoices } from "@/lib/actions/ledger";
import { requireSession } from "@/lib/auth/session";
import { LedgerView } from "./ledger-view";

export default async function LedgerPage() {
  const { businessId } = await requireSession();
  const [{ standing, supporting }, invoices, signals] = await Promise.all([
    getLedgerFigures(businessId),
    listInvoices(businessId),
    getLedgerSignals(businessId),
  ]);

  return <LedgerView standing={standing} supporting={supporting} invoices={invoices} signals={signals} />;
}
