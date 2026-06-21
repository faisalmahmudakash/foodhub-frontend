"use client";

import React, { useEffect, useState } from "react";
// import { Order, OrderStatus } from "@/types/order.type";
import { fetchAllOrders, updateOrderStatusOnServer } from "@/helpers/orderApi";
import { fmt } from "@/helpers/cartHelpers";
import { Order, OrderStatus } from "@/types/order.type";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-[#fef3c7] text-[#92400e]",
  CONFIRMED: "bg-[#dbeafe] text-[#1e40af]",
  PREPARING: "bg-[#fde8d8] text-[#e85d04]",
  READY: "bg-[#ede9fe] text-[#6d28d9]",
  DELIVERED: "bg-[#dcfce7] text-[#15803d]",
  CANCELLED: "bg-[#fee2e2] text-[#b91c1c]",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminOrderTablePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleExpand = (orderId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const prevOrders = orders;
    setUpdatingId(orderId);
    setRowError((prev) => ({ ...prev, [orderId]: "" }));

    // Optimistic update
    setOrders((curr) =>
      curr.map((o) => (o.orderId === orderId ? { ...o, status } : o)),
    );

    try {
      await updateOrderStatusOnServer(orderId, status);
    } catch (err: any) {
      // Revert on failure
      setOrders(prevOrders);
      setRowError((prev) => ({
        ...prev,
        [orderId]: err.message || "Failed to update status",
      }));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    activeFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  const filterCounts: Record<"ALL" | OrderStatus, number> = {
    ALL: orders.length,
    PENDING: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    READY: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  orders.forEach((o) => {
    filterCounts[o.status] += 1;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3.5 px-4 py-10 text-[#7a6a55]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
        <p>Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center px-4 py-10 text-[#e85d04]">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-5 text-xl font-extrabold text-[#1a1208]">Orders</h1>

      {/* Status Filter Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(["ALL", ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setActiveFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeFilter === s
                ? "bg-[#e85d04] text-white"
                : "border border-[#e0d5c4] text-[#7a6a55] hover:border-[#e85d04] hover:text-[#e85d04]"
            }`}
          >
            {s === "ALL" ? "All" : s} ({filterCounts[s]})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#ede5d8] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#ede5d8] bg-[#faf7f3] text-xs font-bold uppercase tracking-wide text-[#a08060]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const isExpanded = expanded.has(order.orderId);
              const isUpdating = updatingId === order.orderId;
              return (
                <React.Fragment key={order.orderId}>
                  <tr className="border-b border-[#f0e8dc] align-top hover:bg-[#fdfbf8]">
                    <td className="px-4 py-3 font-mono text-xs text-[#8a7460]">
                      #{order.orderId.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#1a1208]">
                        {order.customer?.name ?? "—"}
                      </div>
                      <div className="text-xs text-[#a08060]">
                        {order.customer?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleExpand(order.orderId)}
                        className="text-xs font-semibold text-[#e85d04] underline-offset-2 hover:underline"
                      >
                        {order.orderItems.length} item
                        {order.orderItems.length !== 1 ? "s" : ""}{" "}
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1a1208]">
                      {fmt(order.totalAmount ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleStatusChange(
                              order.orderId,
                              e.target.value as OrderStatus,
                            )
                          }
                          className={`w-fit rounded-full border-0 px-3 py-1 text-xs font-bold outline-none ring-1 ring-inset ring-black/5 ${
                            STATUS_STYLES[order.status]
                          } ${isUpdating ? "opacity-60" : "cursor-pointer"}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {rowError[order.orderId] && (
                          <span className="text-[0.68rem] font-semibold text-[#e85d04]">
                            {rowError[order.orderId]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[#8a7460]">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="border-b border-[#f0e8dc] bg-[#faf7f3]">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.itemId}
                              className="flex items-center justify-between gap-3 rounded-xl border border-[#ede5d8] bg-white px-3 py-2"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#f5ede0]">
                                  {item.product?.images ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.product.images}
                                      alt={item.product.productName}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-base">
                                      🍽️
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-[#1a1208]">
                                    {item.product?.productName ??
                                      "Unknown product"}
                                  </div>
                                  {item.orderItemAddons.length > 0 && (
                                    <div className="text-xs text-[#a08060]">
                                      +{" "}
                                      {item.orderItemAddons
                                        .map((a) => a.addonName)
                                        .join(", ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-[#8a7460]">
                                  ×{item.quantity ?? 1}
                                </div>
                                <div className="font-bold text-[#e85d04]">
                                  {fmt(item.subtotal ?? 0)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-[#7a6a55]"
                >
                  No orders found
                  {activeFilter !== "ALL" ? ` for "${activeFilter}"` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
