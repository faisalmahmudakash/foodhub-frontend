import { CartItem } from "@/types/productPrice.type";

export const CART_KEY = "food_cart_items";

export const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCart = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cartUpdated"));
};

export const recalc = (item: CartItem): CartItem => {
  const subtotal = item.unitPrice * item.quantity;
  return { ...item, subtotal };
};

export const fmt = (n: number) => `$${n.toFixed(2)}`;
