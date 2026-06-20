"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Addon {
  addonId: string;
  addonName: string;
  price: number;
}

interface CartAddon {
  addon: Addon;
  quantity: number;
}

interface ProductPrice {
  priceId: string;
  priceType: "BASE" | "SIZE";
  size: string | null;
  price: number;
  newPrice: number | null;
}

interface Product {
  productId: string;
  productName: string;
  images?: string;
  provider?: { name: string };
}

interface CartItem {
  cartId: string;
  product: Product;
  selectedPrice: ProductPrice | null;
  addons: CartAddon[];
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CART_KEY = "food_cart_items";

const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cartUpdated"));
};

const recalc = (item: CartItem): CartItem => {
  const subtotal = item.unitPrice * item.quantity;
  return { ...item, subtotal };
};

const fmt = (n: number) => `$${n.toFixed(2)}`;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CartItemPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    const sync = () => setCart(loadCart());
    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, []);

  const update = (items: CartItem[]) => {
    setCart(items);
    saveCart(items);
  };

  const changeQty = (cartId: string, delta: number) => {
    const next = cart
      .map((item) =>
        item.cartId === cartId
          ? recalc({ ...item, quantity: Math.max(1, item.quantity + delta) })
          : item,
      )
      .filter((item) => item.quantity > 0);
    update(next);
  };

  const removeItem = (cartId: string) => {
    update(cart.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => update([]);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const deliveryFee = subtotal > 0 ? 2.5 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = async () => {
    setCheckingOut(true);
    await new Promise((r) => setTimeout(r, 1400));
    clearCart();
    setCheckingOut(false);
    setOrderSuccess(true);
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <span className="text-6xl">🎉</span>
          <h2 className="text-2xl font-extrabold text-[#1a1208]">
            Order Placed!
          </h2>
          <p className="text-sm text-[#7a6a55]">
            Your order is being prepared. Sit tight!
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 bg-[#e85d04] hover:bg-[#c94e03] text-white font-bold px-7 py-3 rounded-full transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // ── Main Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f1eb] font-sans text-[#1a1208]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e8e1d6] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-[#e85d04] text-sm font-semibold bg-transparent border-none cursor-pointer"
          >
            ← Back to Menu
          </button>
          <span className="text-xl font-extrabold">
            Your <span className="text-[#e85d04]">Cart</span>
          </span>
          <span className="text-sm text-[#8a7460] font-medium">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 pb-20">
        {/* ── Empty State ── */}
        {cart.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
            <span className="text-6xl">🛒</span>
            <h2 className="text-2xl font-extrabold">Your cart is empty</h2>
            <p className="text-sm text-[#7a6a55]">
              Looks like you haven&apos;t added anything yet.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-2 bg-[#e85d04] hover:bg-[#c94e03] text-white font-bold px-7 py-3 rounded-full transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7 items-start">
            {/* ── LEFT: Items ── */}
            <div>
              {/* Column header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold">Order Items</h2>
                <button
                  onClick={clearCart}
                  className="border border-[#e0d5c4] text-[#8a7460] text-xs px-4 py-1.5 rounded-full hover:border-[#e85d04] hover:text-[#e85d04] transition-colors"
                >
                  Clear all
                </button>
              </div>

              {/* Items list */}
              <div className="flex flex-col gap-3.5">
                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="bg-white rounded-2xl border border-[#ede5d8] flex overflow-hidden shadow-sm"
                  >
                    {/* Image */}
                    <div className="w-28 shrink-0">
                      {item.product.images ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images}
                          alt={item.product.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full min-h-[110px] h-full bg-[#f5ede0] flex items-center justify-center text-3xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 px-4 py-3.5 flex flex-col gap-2">
                      {/* Top row */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-[#1a1208]">
                            {item.product.productName}
                          </h3>
                          {item.product.provider && (
                            <span className="block text-xs text-[#8a7460] mt-0.5">
                              🏪 {item.product.provider.name}
                            </span>
                          )}
                          {item.selectedPrice?.size && (
                            <span className="block text-xs text-[#a08060] mt-0.5">
                              Size: {item.selectedPrice.size}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.cartId)}
                          title="Remove"
                          className="text-[#ccc] hover:bg-[#fde8d8] hover:text-[#e85d04] text-sm px-1.5 py-0.5 rounded-full transition-all"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Addons */}
                      {item.addons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.addons.map((ca) => (
                            <span
                              key={ca.addon.addonId}
                              className="bg-[#fde8d8] text-[#e85d04] text-[0.7rem] font-semibold px-2 py-0.5 rounded-full"
                            >
                              {ca.addon.addonName} ×{ca.quantity}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-auto">
                        {/* Qty controls */}
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => changeQty(item.cartId, -1)}
                            className="w-8 h-8 rounded-full border border-[#e0d5c4] flex items-center justify-center text-base hover:border-[#e85d04] hover:text-[#e85d04] transition-all"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => changeQty(item.cartId, 1)}
                            className="w-8 h-8 rounded-full border border-[#e0d5c4] flex items-center justify-center text-base hover:border-[#e85d04] hover:text-[#e85d04] transition-all"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-xs text-[#a08060]">
                            {fmt(item.unitPrice)} each
                          </span>
                          <span className="text-base font-extrabold text-[#e85d04]">
                            {fmt(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="mt-6 bg-white rounded-2xl border border-[#ede5d8] p-4">
                <label className="block text-xs font-bold text-[#a08060] uppercase tracking-wide mb-2">
                  Additional Instructions
                </label>
                <textarea
                  className="w-full border border-[#e0d5c4] focus:border-[#e85d04] rounded-xl px-3 py-2.5 text-sm font-[inherit] resize-none outline-none text-[#1a1208] transition-colors"
                  placeholder="Any special requests or dietary notes…"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                />
                <div className="text-xs text-[#a08060] text-right mt-1">
                  {note.length}/300
                </div>
              </div>
            </div>

            {/* ── RIGHT: Summary ── */}
            <div className="lg:sticky lg:top-20">
              <div className="bg-white rounded-2xl border border-[#ede5d8] p-6 shadow-md">
                <h3 className="text-lg font-extrabold mb-5">Order Summary</h3>

                {/* Per-item rows */}
                <div className="flex flex-col gap-2 mb-4">
                  {cart.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex justify-between gap-2"
                    >
                      <span className="text-[0.82rem] text-[#5a4a35] flex-1">
                        {item.product.productName}
                        {item.selectedPrice?.size
                          ? ` (${item.selectedPrice.size})`
                          : ""}{" "}
                        ×{item.quantity}
                      </span>
                      <span className="text-[0.82rem] font-semibold text-[#1a1208] shrink-0">
                        {fmt(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-[#ede5d8] my-3" />

                <div className="flex justify-between text-sm text-[#5a4a35] mb-2">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#5a4a35] mb-2">
                  <span>Delivery Fee</span>
                  <span>{fmt(deliveryFee)}</span>
                </div>

                <hr className="border-[#ede5d8] my-3" />

                <div className="flex justify-between text-base font-extrabold text-[#1a1208]">
                  <span>Total</span>
                  <span>{fmt(grandTotal)}</span>
                </div>

                <p className="text-xs text-[#a08060] mt-3 bg-[#fef4ec] px-3 py-2 rounded-xl leading-relaxed">
                  Discounts and any additional charges will be applied at
                  checkout.
                </p>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full mt-5 py-4 bg-[#e85d04] hover:bg-[#c94e03] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl flex items-center justify-center transition-colors"
                >
                  {checkingOut ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    `Checkout — ${fmt(grandTotal)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
