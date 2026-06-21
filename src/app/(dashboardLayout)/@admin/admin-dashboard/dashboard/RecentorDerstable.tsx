import { OrderStatus, RecentOrder } from "@/types/dashboard.type";

interface Props {
  orders: RecentOrder[];
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PREPARING: "bg-purple-50 text-purple-700",
  READY: "bg-cyan-50 text-cyan-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function RecentOrdersTable({ orders }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">Recent orders</h3>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No orders yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.orderId}>
                  <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">
                    {o.orderId.slice(0, 8)}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-900">
                    {o.customer?.name ?? "Unknown"}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-slate-900">
                    ৳{o.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
