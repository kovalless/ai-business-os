"use client";

import { Empty } from "@/components/ui";

export default function RoomError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-stride py-court md:px-court">
      <Empty
        kind="blocked"
        title="This room did not open."
        body="Nothing was changed and nothing was sent. Your figures are unchanged."
      />
      <button type="button" onClick={reset} className="mt-stride text-caption text-ink-2 underline">
        Try again
      </button>
    </div>
  );
}
