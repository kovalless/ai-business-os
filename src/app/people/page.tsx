import { getPeopleRoomSignals, listPeople } from "@/lib/actions/people";
import { requireSession } from "@/lib/auth/session";
import { PeopleList } from "./people-list";

export default async function PeoplePage() {
  const { businessId } = await requireSession();
  const people = await listPeople(businessId);
  const signals = await getPeopleRoomSignals(businessId, people);

  return <PeopleList people={people} signals={signals} />;
}
