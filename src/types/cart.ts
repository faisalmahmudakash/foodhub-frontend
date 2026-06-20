export interface Addon {
  addonId: string;
  addonName: string;
  price: number;
}

export interface CartAddon {
  addon: Addon;
  quantity: number;
}

export interface ProductPrice {
  priceId: string;
  priceType: "BASE" | "SIZE";
  size: string | null;
  price: number;
  newPrice: number | null;
}

export interface Product {
  productId: string;
  productName: string;
  images?: string;
  provider?: { name: string };
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
