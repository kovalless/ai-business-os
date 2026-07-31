"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Check,
  Coins,
  LineChart,
  PenLine,
  Send,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import { business, rooms } from "@/lib/data";
import { cx, money } from "@/lib/utils";
import { Mark } from "./Mark";

const ICONS: Record<string, React.ElementType> = {
  sun: Sun,
  pen: PenLine,
  users: Users,
  send: Send,
  check: Check,
  coins: Coins,
  book: BookOpen,
  chart: LineChart,
};

export function Rail() {
  const path = usePathname();

  return (
    <nav
      aria-label="Rooms"
      className="hidden h-full w-16 shrink-0 flex-col items-center border-r border-hair bg-recess py-stride md:flex xl:w-[232px] xl:items-stretch xl:px-rise"
    >
      <Link
        href="/today"
        className="mb-bay flex h-8 items-center gap-rise px-[6px] text-ink xl:px-step"
      >
        <Mark size={20} />
        <span className="hidden text-bodysm font-medium text-ink xl:inline">{business.name}</span>
      </Link>

      <ul className="flex w-full flex-col gap-[2px]">
        {rooms.map((room) => {
          const Icon = ICONS[room.icon] ?? Sun;
          const active = path === room.href || path.startsWith(`${room.href}/`);
          return (
            <li key={room.key}>
              <Link
                href={room.href}
                aria-current={active ? "page" : undefined}
                title={room.name}
                className={cx(
                  "relative flex h-10 items-center justify-center gap-rise rounded-control transition-colors duration-[90ms] xl:justify-start xl:px-rise",
                  active ? "text-ledger-80" : "text-ink-3 hover:bg-lift hover:text-ink-2",
                )}
              >
                {active ? (
                  <span className="absolute left-0 top-[6px] bottom-[6px] w-[2px] rounded-full bg-ledger-80" />
                ) : null}
                <Icon size={19} strokeWidth={1.5} />
                <span
                  className={cx(
                    "hidden text-bodysm xl:inline",
                    active ? "font-medium" : "font-normal",
                  )}
                >
                  {room.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto w-full">
        <div className="hidden px-rise xl:block">
          <p className="text-label uppercase text-ink-3">{business.pinned.label}</p>
          <p className="num mt-tick text-fm font-medium text-ink">{money(business.pinned.value)}</p>
        </div>
        <Link
          href="/settings"
          title="Settings"
          className={cx(
            "mt-bay flex h-10 items-center justify-center gap-rise rounded-control text-ink-3 transition-colors duration-[90ms] hover:bg-lift hover:text-ink-2 xl:justify-start xl:px-rise",
            path.startsWith("/settings") && "text-ledger-80",
          )}
        >
          <Settings size={19} strokeWidth={1.5} />
          <span className="hidden text-bodysm xl:inline">Settings</span>
        </Link>
      </div>
    </nav>
  );
}

export function BottomRail() {
  const path = usePathname();
  const five = rooms.slice(0, 5);
  return (
    <nav
      aria-label="Rooms"
      className="fixed inset-x-0 bottom-0 z-30 flex h-[56px] items-stretch border-t border-hair bg-recess md:hidden"
    >
      {five.map((room) => {
        const Icon = ICONS[room.icon] ?? Sun;
        const active = path === room.href || path.startsWith(`${room.href}/`);
        return (
          <Link
            key={room.key}
            href={room.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "flex flex-1 flex-col items-center justify-center gap-[3px]",
              active ? "text-ledger-80" : "text-ink-3",
            )}
          >
            <Icon size={19} strokeWidth={1.5} />
            <span className="text-label">{room.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
