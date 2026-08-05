import { getBusinessVoice } from "@/lib/actions/reach";
import { requireSession } from "@/lib/auth/session";
import { TableView } from "./table-view";

export default async function TablePage() {
  const { businessId } = await requireSession();
  const voice = await getBusinessVoice(businessId);

  return <TableView voice={voice} />;
}
