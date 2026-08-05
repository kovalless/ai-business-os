import {
  getBusinessVoice,
  getReachPerformance,
  getSendGate,
  listCampaigns,
  listIdeas,
  listReachCalendar,
  listSeasons,
} from "@/lib/actions/reach";
import { requireSession } from "@/lib/auth/session";
import { ReachView } from "./reach-view";

export default async function ReachPage() {
  const { businessId } = await requireSession();
  const [seasons, campaigns, calendar, ideas, voice, performance, sendGate] = await Promise.all([
    listSeasons(businessId),
    listCampaigns(businessId),
    listReachCalendar(businessId),
    listIdeas(businessId),
    getBusinessVoice(businessId),
    getReachPerformance(businessId),
    getSendGate(businessId),
  ]);

  return (
    <ReachView
      seasons={seasons}
      campaigns={campaigns}
      calendar={calendar}
      ideas={ideas}
      voice={voice}
      performance={performance}
      sendGate={sendGate}
    />
  );
}
