"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Order } from "@/types/order.type";
import { fetchOrdersByCustomer } from "@/helpers/orderApi";
import { fmt } from "@/helpers/cartHelpers";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-[#fef3c7] text-[#92400e]",
  CONFIRMED: "bg-[#dbeafe] text-[#1e40af]",
  PREPARING: "bg-[#fde8d8] text-[#e85d04]",
  READY: "bg-[#ede9fe] text-[#6d28d9]",
  DELIVERED: "bg-[#dcfce7] text-[#15803d]",
  CANCELLED: "bg-[#fee2e2] text-[#b91c1c]",
};

export default function OrderTrackListPage() {
  const { data: session, isPending } = authClient.useSession();
  const customerId = session?.user?.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!customerId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await fetchOrdersByCustomer(customerId);
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [customerId, isPending]);

  if (isPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3.5 px-4 py-10 text-[#7a6a55]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
        <p>Loading your orders…</p>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center text-[#7a6a55]">
        <p>Please log in to track your orders.</p>
        <Link
          href="/auth/login"
          className="rounded-full bg-[#e85d04] px-5 py-2 text-sm font-bold text-white"
        >
          Log in
        </Link>
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

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center text-[#7a6a55]">
        <span className="text-4xl">🧾</span>
        <p>You haven&apos;t placed any orders yet.</p>
        <Link
          href="/menu"
          className="rounded-full bg-[#e85d04] px-5 py-2 text-sm font-bold text-white"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-0">
      <h1 className="mb-5 text-xl font-extrabold text-[#1a1208]">
        Your Orders
      </h1>

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <Link
            key={order.orderId}
            href={`/orderTrack/${order.orderId}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#ede5d8] bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            <div>
              <div className="font-mono text-xs text-[#8a7460]">
                Order #{order.orderId.slice(0, 8)}
              </div>
              <div className="mt-1 text-sm text-[#7a6a55]">
                {order.orderItems.length} item
                {order.orderItems.length !== 1 ? "s" : ""} •{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#e85d04]">
                {fmt(order.totalAmount ?? 0)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {order.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
