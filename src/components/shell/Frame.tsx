"use client";

import { Rail, BottomRail } from "./Rail";
import { MarginProvider } from "./MarginProvider";
import { Shortcuts } from "./Shortcuts";
import { NightProvider } from "./NightProvider";

export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <NightProvider>
      <MarginProvider>
        <div className="flex h-dvh w-full overflow-hidden bg-ground">
          <Rail />
          <div className="flex min-w-0 flex-1">{children}</div>
        </div>
        <BottomRail />
        <Shortcuts />
      </MarginProvider>
    </NightProvider>
  );
}
