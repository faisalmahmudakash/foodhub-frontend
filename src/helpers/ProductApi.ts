const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface ProductSearchResult {
  productId: string;
  productName: string;
  images: string | null;
  availabilityStatus: "AVAILABLE" | "NOT_AVAILABLE";
}

/**
 * Hits the backend search endpoint (GET /product/search?q=...).
 * Returns an empty array for queries under 3 characters without
 * making a request, matching the backend's own minimum-length guard.
 */
export async function searchProducts(
  query: string,
): Promise<ProductSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const res = await fetch(
    `${API_BASE}/product/search?q=${encodeURIComponent(trimmed)}`,
  );
  if (!res.ok) throw new Error("Search failed");

  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Search failed");

  return json.data?.data ?? [];
}
