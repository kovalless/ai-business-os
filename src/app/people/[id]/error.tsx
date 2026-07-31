"use client";

import { Empty } from "@/components/ui";

export default function PersonError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-stride py-court md:px-court">
      <Empty
        kind="blocked"
        title="This customer's record did not open."
        body="Nothing was changed and nothing was sent. Their invoices and thread are untouched on file."
        action="Back to Customers"
        href="/people"
      />
      <button type="button" onClick={reset} className="mt-stride text-caption text-ink-2 underline">
        Try loading it again
      </button>
    </div>
  );
}
