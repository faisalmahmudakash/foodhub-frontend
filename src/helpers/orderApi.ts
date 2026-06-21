import { Order, OrderStatus } from "@/types/order.type";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const fetchAllOrders = async (): Promise<Order[]> => {
  const res = await fetch(`${API_BASE}/order`, {
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch orders");
  }
  return json.data;
};

export const fetchOrdersByCustomer = async (
  customerId: string,
): Promise<Order[]> => {
  const res = await fetch(`${API_BASE}/order/customer/${customerId}`, {
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch your orders");
  }
  return json.data;
};

export const fetchOrderById = async (orderId: string): Promise<Order> => {
  const res = await fetch(`${API_BASE}/order/${orderId}`, {
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch order");
  }
  return json.data;
};

export const updateOrderStatusOnServer = async (
  orderId: string,
  status: OrderStatus,
): Promise<Order> => {
  const res = await fetch(`${API_BASE}/order/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update order status");
  }
  return json.data;
};
