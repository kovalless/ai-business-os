"use client";

import "./globals.css";
import { Actuator } from "@/components/ui";

// Next.js only routes errors thrown inside app/layout.tsx itself here,
// not to app/error.tsx (which can't catch failures in its own parent).
// Since it replaces the entire document, it needs its own <html>/<body>
// and its own stylesheet import — nothing from the root layout (Frame,
// providers, Rail) is available if this is rendering.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-dvh w-full items-center justify-center bg-ground px-court">
          <div className="max-w-[460px]">
            <div className="h-px w-full bg-rust" />
            <p className="mt-rise text-head text-ink">The workspace did not open.</p>
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
      </body>
    </html>
  );
}
