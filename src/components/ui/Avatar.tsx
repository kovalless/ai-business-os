import { cx, initials } from "@/lib/utils";

export function Avatar({ name, size = 32 }: { name: string; size?: 24 | 32 | 40 }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-vitrine-10 font-medium text-ink-3",
        size === 24 ? "text-label" : "text-caption",
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
