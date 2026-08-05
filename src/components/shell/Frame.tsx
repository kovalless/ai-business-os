"use client";

import { Rail, BottomRail, type RailData } from "./Rail";
import { MarginProvider } from "./MarginProvider";
import { Shortcuts } from "./Shortcuts";
import { NightProvider } from "./NightProvider";

export function Frame({ children, rail }: { children: React.ReactNode; rail: RailData | null }) {
  return (
    <NightProvider>
      <MarginProvider>
        <div className="flex h-dvh w-full overflow-hidden bg-ground">
          <Rail data={rail} />
          <div className="flex min-w-0 flex-1">{children}</div>
        </div>
        <BottomRail />
        <Shortcuts />
      </MarginProvider>
    </NightProvider>
  );
}
