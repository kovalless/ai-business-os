import {
  buildQuestions,
  getAnalyticsInsights,
  getAnalyticsSeries,
  getCustomersSentence,
  getGrowthRows,
  getHoursSentence,
  getQuietCustomer,
  getRevenueSentence,
} from "@/lib/actions/analytics";
import { getReachPerformance } from "@/lib/actions/reach";
import { requireSession } from "@/lib/auth/session";
import { LongViewView } from "./long-view-view";

export default async function LongViewPage() {
  const { businessId } = await requireSession();
  const [series, insights, growthRows, quiet, marketingPerformance] = await Promise.all([
    getAnalyticsSeries(businessId),
    getAnalyticsInsights(businessId),
    getGrowthRows(businessId),
    getQuietCustomer(businessId),
    getReachPerformance(businessId),
  ]);

  const questions = buildQuestions(series, insights, quiet);
  const revenueSentence = getRevenueSentence(series);
  const hoursSentence = getHoursSentence(series);
  const customersSentence = getCustomersSentence(series);

  return (
    <LongViewView
      series={series}
      insights={insights}
      growthRows={growthRows}
      quiet={quiet}
      marketingPerformance={marketingPerformance}
      questions={questions}
      revenueSentence={revenueSentence}
      hoursSentence={hoursSentence}
      customersSentence={customersSentence}
    />
  );
}
