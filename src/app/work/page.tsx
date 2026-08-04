import { getWorkSignals, listTasks, listUpcoming, listWorkCalendar } from "@/lib/actions/work";
import { requireSession } from "@/lib/auth/session";
import { WorkView } from "./work-view";

export default async function WorkPage() {
  const { businessId } = await requireSession();
  const [tasks, upcoming, workCalendar] = await Promise.all([
    listTasks(businessId),
    listUpcoming(businessId),
    listWorkCalendar(businessId),
  ]);
  const signals = getWorkSignals(tasks);

  return <WorkView tasks={tasks} upcoming={upcoming} workCalendar={workCalendar} signals={signals} />;
}
