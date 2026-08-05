import { getBusinessSettings, listConnectedSources } from "@/lib/actions/settings";
import { requireSession } from "@/lib/auth/session";
import { SettingsView } from "./settings-view";

export default async function SettingsPage() {
  const { businessId } = await requireSession();
  const [business, sources] = await Promise.all([
    getBusinessSettings(businessId),
    listConnectedSources(businessId),
  ]);

  return <SettingsView business={business} sources={sources} />;
}
