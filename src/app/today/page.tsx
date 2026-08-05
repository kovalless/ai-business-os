import { getLedgerFigures } from "@/lib/actions/ledger";
import { getMarginNote, getTodayMeta, getTodayStatement, listMoves, listSignals } from "@/lib/actions/today";
import { requireSession } from "@/lib/auth/session";
import { TodayView } from "./today-view";

export default async function TodayPage() {
  const { businessId } = await requireSession();
  const [figures, signals, moves, marginNote] = await Promise.all([
    getLedgerFigures(businessId),
    listSignals(businessId),
    listMoves(businessId),
    getMarginNote(businessId),
  ]);
  const now = new Date();

  return (
    <TodayView
      meta={getTodayMeta(now)}
      statement={getTodayStatement(now)}
      standing={figures.standing}
      supporting={figures.supporting}
      signals={signals}
      moves={moves}
      marginNote={marginNote}
    />
  );
}
