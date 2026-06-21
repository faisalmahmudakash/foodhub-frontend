const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type CreateCartItemPayload = {
  customerId: string;
  productId: string;
  priceId?: string;
  addonIds?: string[];
  quantity: number;
};

export const createCartItemOnServer = async (
  payload: CreateCartItemPayload,
) => {
  const res = await fetch(`${API_BASE}/cartItem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to add item to cart");
  }
  return json.data;
};

export const placeOrderOnServer = async (customerId: string) => {
  const res = await fetch(`${API_BASE}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ customerId }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to place order");
  }
  // createItemController returns the record under `data`, orderController under `body`
  return json.body ?? json.data;
};
