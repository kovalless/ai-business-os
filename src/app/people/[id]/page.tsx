import { notFound } from "next/navigation";
import { getPersonDetail } from "@/lib/actions/people";
import { requireSession } from "@/lib/auth/session";
import { PersonDetailView } from "./person-detail";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { businessId } = await requireSession();
  const detail = await getPersonDetail(businessId, id);
  if (!detail) notFound();

  return <PersonDetailView {...detail} />;
}
