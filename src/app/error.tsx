"use client";

import { Actuator } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center px-court">
      <div className="max-w-[460px]">
        <div className="h-px w-full bg-rust" />
        <p className="mt-rise text-head text-ink">This room did not open.</p>
        <p className="mt-step text-bodysm text-ink-2">
          Nothing was lost and nothing was sent. Your figures are unchanged and still on file.
        </p>
        <div className="mt-stride">
          <Actuator rank="primary" onClick={reset}>
            Try again
          </Actuator>
        </div>
      </div>
    </div>
  );
}
