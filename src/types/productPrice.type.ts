export interface ProductPrice {
  priceId: string;
  productId: string;
  priceType: "BASE" | "SIZE";
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

export interface Provider {
  id: string;
  name: string;
  image?: string;
}

export interface Product {
  productId: string;
  productName: string;
  description?: string;
  images?: string;
  featured: boolean;
  availabilityStatus: "AVAILABLE" | "NOT_AVAILABLE";
  tags: string[];
  ingredients: string[];
  productPrices: ProductPrice[];
  addons: Addon[];
  provider?: Provider;
  mileTiem?: { mileTime: string[] };
}

export interface CartAddon {
  addon: Addon;
  quantity: number;
}

export interface CartItem {
  cartId: string;
  product: Product;
  selectedPrice: ProductPrice | null;
  addons: CartAddon[];
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
