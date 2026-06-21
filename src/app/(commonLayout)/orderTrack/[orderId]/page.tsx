// "use client";

// import React, { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Order } from "@/types/order.type";
// import { fetchOrderById } from "@/helpers/orderApi";
// import { fmt } from "@/helpers/cartHelpers";
// import OrderTrackStepper from "@/components/layout/OrderTrackStepper";

// export default function OrderTrackPage() {
//   const params = useParams();
//   const orderId = params.orderId as string;

//   const [order, setOrder] = useState<Order | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!orderId) return;
//     const load = async () => {
//       try {
//         const data = await fetchOrderById(orderId);
//         setOrder(data);
//       } catch (err: any) {
//         setError(err.message || "Failed to load order");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [orderId]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center gap-3.5 px-4 py-10 text-[#7a6a55]">
//         <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
//         <p>Loading order…</p>
//       </div>
//     );
//   }

//   if (error || !order) {
//     return (
//       <div className="flex items-center justify-center px-4 py-10 text-[#e85d04]">
//         ⚠️ {error || "Order not found"}
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-xl px-4 py-6 sm:px-0">
//       {/* Order summary header */}
//       <div className="mb-5 rounded-2xl border border-[#ede5d8] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
//         <div className="flex items-center justify-between">
//           <span className="font-mono text-xs text-[#8a7460]">
//             Order #{order.orderId.slice(0, 8)}
//           </span>
//           <span className="text-xs text-[#a08060]">
//             {new Date(order.createdAt).toLocaleString("en-US", {
//               month: "short",
//               day: "numeric",
//               hour: "2-digit",
//               minute: "2-digit",
//             })}
//           </span>
//         </div>
//         <div className="mt-2 flex items-center justify-between">
//           <span className="text-sm text-[#7a6a55]">
//             {order.orderItems.length} item
//             {order.orderItems.length !== 1 ? "s" : ""}
//           </span>
//           <span className="text-base font-extrabold text-[#e85d04]">
//             {fmt(order.totalAmount ?? 0)}
//           </span>
//         </div>
//       </div>

//       {/* Tracker */}
//       <OrderTrackStepper status={order.status} />

//       {/* Items list */}
//       <div className="mt-5 flex flex-col gap-2">
//         {order.orderItems.map((item) => (
//           <div
//             key={item.itemId}
//             className="flex items-center justify-between gap-3 rounded-xl border border-[#ede5d8] bg-white px-4 py-3"
//           >
//             <div className="flex items-center gap-3">
//               <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f5ede0]">
//                 {item.product?.images ? (
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img
//                     src={item.product.images}
//                     alt={item.product.productName}
//                     className="h-full w-full object-cover"
//                   />
//                 ) : (
//                   <div className="flex h-full w-full items-center justify-center text-lg">
//                     🍽️
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <div className="text-sm font-semibold text-[#1a1208]">
//                   {item.product?.productName ?? "Unknown product"}
//                 </div>
//                 {item.orderItemAddons.length > 0 && (
//                   <div className="text-xs text-[#a08060]">
//                     + {item.orderItemAddons.map((a) => a.addonName).join(", ")}
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="text-right text-sm">
//               <div className="text-[#8a7460]">×{item.quantity ?? 1}</div>
//               <div className="font-bold text-[#e85d04]">
//                 {fmt(item.subtotal ?? 0)}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Order } from "@/types/order.type";
import { fetchOrdersByCustomer, fetchOrderById } from "@/helpers/orderApi";
import { fmt } from "@/helpers/cartHelpers";
import OrderTrackStepper from "@/components/layout/OrderTrackStepper";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-[#fef3c7] text-[#92400e]",
  CONFIRMED: "bg-[#dbeafe] text-[#1e40af]",
  PREPARING: "bg-[#fde8d8] text-[#e85d04]",
  READY: "bg-[#ede9fe] text-[#6d28d9]",
  DELIVERED: "bg-[#dcfce7] text-[#15803d]",
  CANCELLED: "bg-[#fee2e2] text-[#b91c1c]",
};

export default function OrderTrackPage() {
  const { data: session, isPending } = authClient.useSession();
  const customerId = session?.user?.id;

  // ----- order list (left) -----
  const [orders, setOrders] = useState<Order[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  useEffect(() => {
    if (isPending) return;
    if (!customerId) {
      setListLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await fetchOrdersByCustomer(customerId);
        setOrders(data);
      } catch (err: any) {
        setListError(err.message || "Failed to load your orders");
      } finally {
        setListLoading(false);
      }
    };
    load();
  }, [customerId, isPending]);

  // ----- selected order detail (right) -----
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null);
      return;
    }
    setDetailLoading(true);
    setDetailError("");
    const load = async () => {
      try {
        const data = await fetchOrderById(selectedOrderId);
        setSelectedOrder(data);
      } catch (err: any) {
        setDetailError(err.message || "Failed to load order");
      } finally {
        setDetailLoading(false);
      }
    };
    load();
  }, [selectedOrderId]);

  // ----- left panel content -----
  let listContent: React.ReactNode;

  if (isPending || listLoading) {
    listContent = (
      <div className="flex flex-col items-center justify-center gap-3.5 rounded-2xl border border-[#ede5d8] bg-white px-4 py-10 text-[#7a6a55]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
        <p className="text-sm">Loading your orders…</p>
      </div>
    );
  } else if (!customerId) {
    listContent = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#ede5d8] bg-white px-4 py-10 text-center text-[#7a6a55]">
        <p className="text-sm">Please log in to track your orders.</p>
        <Link
          href="/auth/login"
          className="rounded-full bg-[#e85d04] px-5 py-2 text-sm font-bold text-white"
        >
          Log in
        </Link>
      </div>
    );
  } else if (listError) {
    listContent = (
      <div className="flex items-center justify-center rounded-2xl border border-[#ede5d8] bg-white px-4 py-10 text-center text-[#e85d04]">
        ⚠️ {listError}
      </div>
    );
  } else if (orders.length === 0) {
    listContent = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#ede5d8] bg-white px-4 py-10 text-center text-[#7a6a55]">
        <span className="text-4xl">🧾</span>
        <p className="text-sm">You haven&apos;t placed any orders yet.</p>
        <Link
          href="/menu"
          className="rounded-full bg-[#e85d04] px-5 py-2 text-sm font-bold text-white"
        >
          Browse Menu
        </Link>
      </div>
    );
  } else {
    listContent = (
      <div className="flex flex-col gap-2.5">
        {orders.map((order) => {
          const isActive = order.orderId === selectedOrderId;
          return (
            <button
              key={order.orderId}
              type="button"
              onClick={() => setSelectedOrderId(order.orderId)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
                isActive
                  ? "border-[#e85d04] bg-[#fff7ee]"
                  : "border-[#ede5d8] bg-white"
              }`}
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
              <div className="flex flex-col items-end gap-1.5">
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
            </button>
          );
        })}
      </div>
    );
  }

  // ----- right panel content -----
  let detailContent: React.ReactNode;

  if (!selectedOrderId) {
    detailContent = (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#ede5d8] bg-white px-4 py-10 text-center text-[#7a6a55]">
        <span className="text-4xl">📦</span>
        <p className="text-sm">
          Select an order from the list to see its tracking details.
        </p>
      </div>
    );
  } else if (detailLoading) {
    detailContent = (
      <div className="flex flex-col items-center justify-center gap-3.5 rounded-2xl border border-[#ede5d8] bg-white px-4 py-10 text-[#7a6a55]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
        <p>Loading order…</p>
      </div>
    );
  } else if (detailError || !selectedOrder) {
    detailContent = (
      <div className="flex items-center justify-center rounded-2xl border border-[#ede5d8] bg-white px-4 py-10 text-[#e85d04]">
        ⚠️ {detailError || "Order not found"}
      </div>
    );
  } else {
    const order = selectedOrder;
    detailContent = (
      <div>
        {/* Mobile-only back link, since the list is hidden once an order is open */}
        <button
          type="button"
          onClick={() => setSelectedOrderId(null)}
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#8a7460] sm:hidden"
        >
          ← Back to orders
        </button>

        {/* Order summary header */}
        <div className="mb-5 rounded-2xl border border-[#ede5d8] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#8a7460]">
              Order #{order.orderId.slice(0, 8)}
            </span>
            <span className="text-xs text-[#a08060]">
              {new Date(order.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-[#7a6a55]">
              {order.orderItems.length} item
              {order.orderItems.length !== 1 ? "s" : ""}
            </span>
            <span className="text-base font-extrabold text-[#e85d04]">
              {fmt(order.totalAmount ?? 0)}
            </span>
          </div>
        </div>

        {/* Tracker */}
        <OrderTrackStepper status={order.status} />

        {/* Items list */}
        <div className="mt-5 flex flex-col gap-2">
          {order.orderItems.map((item) => (
            <div
              key={item.itemId}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#ede5d8] bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f5ede0]">
                  {item.product?.images ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.images}
                      alt={item.product.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg">
                      🍽️
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1a1208]">
                    {item.product?.productName ?? "Unknown product"}
                  </div>
                  {item.orderItemAddons.length > 0 && (
                    <div className="text-xs text-[#a08060]">
                      +{" "}
                      {item.orderItemAddons.map((a) => a.addonName).join(", ")}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-[#8a7460]">×{item.quantity ?? 1}</div>
                <div className="font-bold text-[#e85d04]">
                  {fmt(item.subtotal ?? 0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl items-start gap-6 px-4 py-6 sm:px-6">
      {/* Left: order list. On mobile it's full-width and hides once an order is open. */}
      <aside
        className={`w-full shrink-0 sm:w-[340px] ${
          selectedOrderId ? "hidden sm:block" : "block"
        }`}
      >
        <h1 className="mb-4 text-lg font-extrabold text-[#1a1208]">
          Your Orders
        </h1>
        {listContent}
      </aside>

      {/* Right: order detail. On mobile it only shows once an order is selected. */}
      <main
        className={`min-w-0 flex-1 ${
          selectedOrderId ? "block" : "hidden sm:block"
        }`}
      >
        {detailContent}
      </main>
    </div>
  );
}
