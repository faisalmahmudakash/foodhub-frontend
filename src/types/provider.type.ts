import type { Order } from "./order.type";

export type AvailabilityStatus = "AVAILABLE" | "NOT_AVAILABLE";
export type PriceType = "BASE" | "SIZE";

export interface ProductPrice {
  priceId: string;
  productId: string;
  priceType: PriceType;
  size: string | null;
  price: number;
  newPrice: number | null;
}

export interface MileTime {
  mileTimeId: string;
  mileTime: string[];
}

export interface ProviderProduct {
  productId: string;
  providerId: string;
  mileTimeId: string | null;
  productName: string;
  description: string | null;
  images: string | null;
  featured: boolean;
  availabilityStatus: AvailabilityStatus;
  tags: string[];
  ingredients: string[];
  createdAt: string;
  updatedAt: string;
  productPrices: ProductPrice[];
}

export interface ProviderStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalReviews: number;
  averageRating: number;
}

export interface ProviderOrder extends Order {
  providerSubtotal: number;
}

export interface ProviderReviewProduct {
  productId: string;
  productName: string;
  images: string | null;
}

export interface ProviderReviewReply {
  replyId: string;
  comment: string;
  createdAt: string;
  user: { id: string; name: string; role?: string };
}

export interface ProviderReview {
  reviewId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: { id: string; name: string; image?: string | null };
  product: ProviderReviewProduct;
  reviewReplays: ProviderReviewReply[];
}
