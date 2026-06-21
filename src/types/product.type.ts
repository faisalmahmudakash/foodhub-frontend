export type PriceType = "BASE" | "SIZE";
export type AvailabilityStatus = "AVAILABLE" | "NOT_AVAILABLE";

export interface MileTime {
  mileTimeId: string;
  mileTime: string[];
}

export interface ProductPrice {
  priceId: string;
  productId: string;
  priceType: PriceType;
  size: string | null;
  price: number;
  newPrice: number | null;
}

export interface Addon {
  addonId: string;
  productId: string;
  addonName: string;
  price: number;
}

export interface Product {
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
  productPrices?: ProductPrice[];
  addons?: Addon[];
  // Kept as "mileTiem" to match the relation name in product.service.ts's
  // getProductById include (the schema has the same typo) — rename here
  // and in api.ts together if you fix it on the backend.
  mileTiem?: MileTime | null;
  provider?: { id: string; name: string; email: string; image: string | null };
  // productPrice?: ProductPrice | null;
  // productAddon?: Addon | null;
  // productPricesCount?: number;
  // product: ProductPrice[] | null;
}
