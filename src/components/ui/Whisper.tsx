import { cx } from "@/lib/utils";

export function Whisper({
  children,
  tone = "quiet",
  className,
}: {
  children: React.ReactNode;
  tone?: "quiet" | "error";
  className?: string;
}) {
  return (
    <p
      className={cx(
        "text-caption",
        tone === "error" ? "text-rustdeep" : "text-ink-3",
        className,
      )}
    >
      {children}
    </p>
  );
}
