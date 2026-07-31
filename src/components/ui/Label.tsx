import { cx } from "@/lib/utils";

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("text-label font-medium uppercase text-ink-3", className)}>{children}</div>
  );
}
