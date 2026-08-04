import { getKnowledgeBase } from "@/lib/actions/record";
import { requireSession } from "@/lib/auth/session";
import { RecordView } from "./record-view";

export default async function RecordPage() {
  const { businessId } = await requireSession();
  const { documents, notes } = await getKnowledgeBase(businessId);

  return <RecordView documents={documents} notes={notes} />;
}
