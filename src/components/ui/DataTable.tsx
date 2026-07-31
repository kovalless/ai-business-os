"use client";

import { cx } from "@/lib/utils";
import { Label } from "./Label";

export type Column<T> = {
  key: string;
  head: string;
  numeric?: boolean;
  width?: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  selectedId,
  emptyLine = "Nothing in this range.",
  dense,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  selectedId?: string;
  emptyLine?: string;
  dense?: boolean;
}) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <table className="w-full min-w-[560px] border-collapse text-bodysm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={cx("pb-step align-bottom", c.numeric ? "text-right" : "text-left")}
              >
                <Label>{c.head}</Label>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length} className="p-0">
              <div className="h-px w-full bg-hair" />
            </td>
          </tr>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-stride text-caption text-ink-3">
                {emptyLine}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cx(
                  "group transition-colors duration-[90ms]",
                  onRowClick && "cursor-pointer",
                  selectedId === row.id ? "bg-ledger-10" : "hover:bg-recess",
                )}
              >
                {columns.map((c, i) => (
                  <td
                    key={c.key}
                    className={cx(
                      dense ? "h-8" : "h-10",
                      "align-middle text-ink-body",
                      i === 0 ? "pl-0 pr-rise" : "px-rise",
                      i === columns.length - 1 && "pr-0",
                      c.numeric && "num text-right",
                      "border-b border-hair/60",
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
