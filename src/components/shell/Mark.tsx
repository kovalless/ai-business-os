export function Mark({ size = 20, lit = false }: { size?: number; lit?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="AI Business OS" role="img">
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="6"
        fill={lit ? "var(--color-filament-20)" : "transparent"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
