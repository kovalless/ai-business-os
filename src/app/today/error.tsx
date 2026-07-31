"use client";

import { Empty } from "@/components/ui";

export default function TodayError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-stride py-court md:px-court">
      <Empty
        kind="blocked"
        title="Today could not be assembled."
        body="Your figures are safe and unchanged. Nothing was sent and nothing was filed while this was failing."
        action="Try again"
      />
      <button type="button" onClick={reset} className="mt-stride text-caption text-ink-2 underline">
        Reload the room
      </button>
    </div>
  );
}
