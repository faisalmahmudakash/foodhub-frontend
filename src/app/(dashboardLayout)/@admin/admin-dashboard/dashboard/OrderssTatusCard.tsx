import { OrdersByStatus, OrderStatus } from "@/types/dashboard.type";

interface Props {
  data: OrdersByStatus[];
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-blue-400",
  PREPARING: "bg-purple-400",
  READY: "bg-cyan-400",
  DELIVERED: "bg-emerald-500",
  CANCELLED: "bg-red-400",
};

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
];

export default function OrdersStatusCard({ data }: Props) {
  const counts = new Map(data.map((d) => [d.status, d.count]));
  const total = Math.max(
    1,
    data.reduce((sum, d) => sum + d.count, 0),
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">Orders by status</h3>
      <div className="mt-4 space-y-2.5">
        {ALL_STATUSES.map((status) => {
          const count = counts.get(status) ?? 0;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={status} className="flex items-center gap-3 text-sm">
              <span className="w-20 shrink-0 text-slate-600">
                {STATUS_LABEL[status]}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${STATUS_COLOR[status]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-medium text-slate-900">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
