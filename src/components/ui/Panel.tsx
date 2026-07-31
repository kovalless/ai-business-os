import { cx } from "@/lib/utils";

export function Panel({
  children,
  className,
  tone = "recess",
  as: As = "div",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "recess" | "outline" | "machine";
  as?: React.ElementType;
}) {
  return (
    <As
      className={cx(
        "rounded-surface p-bay",
        tone === "recess" && "bg-recess",
        tone === "outline" && "bg-raise border border-hair",
        tone === "machine" && "bg-filament-10 border-l border-filament-60 rounded-l-none",
        className,
      )}
    >
      {children}
    </As>
  );
}
