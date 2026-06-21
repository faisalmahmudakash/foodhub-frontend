"use client";

import { RevenuePoint } from "@/types/dashboard.type";

interface Props {
  points: RevenuePoint[];
}

export default function RevenueChart({ points }: Props) {
  const max = Math.max(1, ...points.map((p) => p.revenue));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">
        Revenue — last 14 days
      </h3>
      <div className="mt-4 flex h-36 items-end gap-1.5">
        {points.map((p) => {
          const heightPct =
            p.revenue === 0
              ? 2
              : Math.max(4, Math.round((p.revenue / max) * 100));
          return (
            <div key={p.date} className="group relative flex-1">
              <div
                className="w-full rounded-t bg-slate-900/80 transition group-hover:bg-slate-900"
                style={{ height: `${heightPct}%` }}
              />
              <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                ৳{p.revenue.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>{formatShortDate(points[0]?.date)}</span>
        <span>{formatShortDate(points[points.length - 1]?.date)}</span>
      </div>
    </div>
  );
}

function formatShortDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
