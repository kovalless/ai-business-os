import { Label } from "./Label";

export function Structure({ heads = ["Cash on hand"], columns = ["Invoiced", "Owed"] }: { heads?: string[]; columns?: string[] }) {
  return (
    <div className="border-l border-hair pl-stride" aria-busy="true" aria-live="polite">
      {heads.map((h) => (
        <div key={h}>
          <Label className="text-ink-4">{h}</Label>
          <div className="h-court" />
        </div>
      ))}
      <div className="h-px w-full bg-hair" />
      <div className="h-bay" />
      <div className="flex gap-court">
        {columns.map((c) => (
          <Label key={c} className="text-ink-4">
            {c}
          </Label>
        ))}
      </div>
      <p className="mt-court text-caption text-ink-3">
        Reading your accounts for the first time. Nothing is cached yet.
      </p>
    </div>
  );
}
