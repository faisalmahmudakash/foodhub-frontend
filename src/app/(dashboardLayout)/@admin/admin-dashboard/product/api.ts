// import type {
//   Addon,
//   AvailabilityStatus,
//   MileTime,
//   PriceType,
//   Product,
// } from "./types";

import { AvailabilityStatus, MileTime, PriceType } from "@/types/product.type";
import { Addon, Product } from "@/types/productPrice.type";

// Point this at wherever your Express app mounts productRouter / addonRouter,
// e.g. app.use("/api/v1/product", productRouter); app.use("/api/v1/addon", addonRouter)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    // Sends the better-auth session cookie along with the request.
    // Make sure the API's CORS config allows credentials from this origin.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body: ApiResponse<T> = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.message || "Something went wrong");
  }

  return body.data;
}

// ---------------- Mile time ----------------

export function fetchMileTimes() {
  return request<{ data: MileTime[]; total: number }>("/product/mile");
}

// ---------------- Products ----------------

export function fetchProducts() {
  return request<{ data: Product[]; total: number }>("/product");
}

export function fetchProductById(productId: string) {
  return request<Product>(`/product/${productId}`);
}

export interface ProductFormFields {
  providerId: string;
  mileTimeId: string;
  productName: string;
  description: string;
  images: string;
  featured: boolean;
  availabilityStatus: AvailabilityStatus;
  tags: string[];
  ingredients: string[];
}

export function createProduct(payload: ProductFormFields) {
  return request<Product>("/product", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(productId: string, payload: ProductFormFields) {
  return request<Product>(`/product/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProductById(productId: string) {
  return request<Product>(`/product/${productId}`, { method: "DELETE" });
}

// ---------------- Prices ----------------

export interface PriceFormRow {
  priceId?: string; // present when this row already exists in the DB
  priceType: PriceType;
  size: string | null;
  price: number;
  newPrice: number | null;
}

function createProductPrice(productId: string, row: PriceFormRow) {
  return request("/product/price", {
    method: "POST",
    body: JSON.stringify({
      productId,
      priceType: row.priceType,
      size: row.size,
      price: row.price,
      newPrice: row.newPrice,
    }),
  });
}

function updateProductPrice(productId: string, row: PriceFormRow) {
  return request("/product/price", {
    method: "PUT",
    body: JSON.stringify({
      productId,
      priceId: row.priceId,
      size: row.size,
      newPrice: row.newPrice,
      price: row.price,
    }),
  });
}

function deleteProductPrice(productId: string, priceId: string) {
  return request(`/product/price/${productId}`, {
    method: "DELETE",
    body: JSON.stringify({ priceId }),
  });
}

// ---------------- Addons ----------------

export interface AddonFormRow {
  addonId?: string; // present when this row already exists in the DB
  addonName: string;
  price: number;
}

function createAddon(productId: string, row: AddonFormRow) {
  return request<Addon>("/addon", {
    method: "POST",
    body: JSON.stringify({
      productId,
      addonName: row.addonName,
      price: row.price,
    }),
  });
}

function updateAddon(addonId: string, row: AddonFormRow) {
  return request<Addon>(`/addon/${addonId}`, {
    method: "PUT",
    body: JSON.stringify({ addonName: row.addonName, price: row.price }),
  });
}

function deleteAddon(productId: string, addonId: string) {
  return request<Addon>(`/addon/${addonId}`, {
    method: "DELETE",
    body: JSON.stringify({ productId }),
  });
}

// ---------------- Orchestration ----------------
//
// The backend exposes product, price and addon as separate resources, so
// saving the "all-in-one" form means one product call plus one call per
// price/addon row. Deletions are sent before creates/updates so switching
// price type (BASE -> SIZE or back) doesn't collide with the backend's
// one-price-type-per-product rule.

export interface SaveProductInput {
  productId?: string; // present in edit mode
  product: ProductFormFields;
  prices: PriceFormRow[];
  originalPriceIds: string[];
  addons: AddonFormRow[];
  originalAddonIds: string[];
}

export async function saveProductWithDetails(input: SaveProductInput) {
  const {
    productId,
    product,
    prices,
    originalPriceIds,
    addons,
    originalAddonIds,
  } = input;

  const savedProduct = productId
    ? await updateProduct(productId, product)
    : await createProduct(product);

  const id = savedProduct.productId;

  const currentPriceIds = new Set(
    prices.filter((p) => p.priceId).map((p) => p.priceId),
  );
  const removedPriceIds = originalPriceIds.filter(
    (pid) => !currentPriceIds.has(pid),
  );
  for (const pid of removedPriceIds) {
    await deleteProductPrice(id, pid);
  }
  for (const row of prices) {
    if (row.priceId) {
      await updateProductPrice(id, row);
    } else {
      await createProductPrice(id, row);
    }
  }

  const currentAddonIds = new Set(
    addons.filter((a) => a.addonId).map((a) => a.addonId),
  );
  const removedAddonIds = originalAddonIds.filter(
    (aid) => !currentAddonIds.has(aid),
  );
  for (const aid of removedAddonIds) {
    await deleteAddon(id, aid);
  }
  for (const row of addons) {
    if (row.addonId) {
      await updateAddon(row.addonId, row);
    } else {
      await createAddon(id, row);
    }
  }

  return id;
}
