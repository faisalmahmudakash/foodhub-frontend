import { ProductPrice } from "@/types/productPrice.type";

const fmt = (price: number): string => `৳${price.toFixed(2)}`;

export const getDisplayPrice = (prices: ProductPrice[]): string => {
  if (!prices || prices.length === 0) return "—";

  const base = prices.find((p) => p.priceType === "BASE");

  if (base) {
    return fmt(base.newPrice ?? base.price);
  }

  const sorted = [...prices].sort((a, b) => a.price - b.price);

  return `${fmt(sorted[0].price)} – ${fmt(sorted[sorted.length - 1].price)}`;
};

export const getSizeLabel = (prices: ProductPrice[]): string => {
  if (!prices || prices.length === 0) return "";

  if (prices[0].priceType === "BASE") {
    return "Single size";
  }

  return prices
    .map((p) => p.size)
    .filter(Boolean)
    .join(" / ");
};

export const formatPrice = fmt;
