import type {
  ProviderStats,
  ProviderProduct,
  ProviderReview,
  ProviderOrder,
  MileTime,
  AvailabilityStatus,
} from "@/types/provider.type";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const fetchMyStats = async (): Promise<ProviderStats> => {
  const res = await fetch(`${API_BASE}/provider/stats`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load stats");
  }
  return json.data;
};

export const fetchMyProducts = async (): Promise<{
  data: ProviderProduct[];
  total: number;
}> => {
  const res = await fetch(`${API_BASE}/product/provider/mine`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load products");
  }
  return json.data;
};

export const fetchMileTimes = async (): Promise<MileTime[]> => {
  const res = await fetch(`${API_BASE}/product/mile`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load mile times");
  }
  return json.data.data;
};

export const createMyProduct = async (payload: {
  providerId: string;
  mileTimeId: string;
  productName: string;
  description: string;
  images: string;
  featured: boolean;
  availabilityStatus: AvailabilityStatus;
  tags: string[];
  ingredients: string[];
}) => {
  const res = await fetch(`${API_BASE}/product`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create product");
  }
  return json.data;
};

export const updateMyProduct = async (
  productId: string,
  payload: {
    providerId: string;
    mileTimeId: string;
    productName: string;
    description: string;
    images: string;
    featured: boolean;
    availabilityStatus: AvailabilityStatus;
    tags: string[];
    ingredients: string[];
  },
) => {
  const res = await fetch(`${API_BASE}/product/${productId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update product");
  }
  return json.data;
};

export const deleteMyProduct = async (productId: string) => {
  const res = await fetch(`${API_BASE}/product/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to delete product");
  }
  return json.data;
};

export const fetchMyOrders = async (): Promise<ProviderOrder[]> => {
  const res = await fetch(`${API_BASE}/order/provider/mine`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load orders");
  }
  return json.data;
};

export const fetchMyProductReviews = async (): Promise<ProviderReview[]> => {
  const res = await fetch(`${API_BASE}/review/provider/mine`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load reviews");
  }
  return json.data;
};

export const postProviderReply = async (
  reviewId: string,
  userId: string,
  comment: string,
) => {
  const res = await fetch(`${API_BASE}/review/replay`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewId, userId, comment }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to post reply");
  }
  return json.body;
};
