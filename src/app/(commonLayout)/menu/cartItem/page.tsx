"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CartItem } from "@/types/productPrice.type";
import { fmt, loadCart, recalc, saveCart } from "@/helpers/cartHelpers";

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

  // ── Main Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen  font-sans text-[#1a1208]">
      <main className="max-w-2xl mx-auto px-4 py-8 pb-20">
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
          /* ── Single Order Summary Card ── */
          <div className="bg-white rounded-2xl border border-[#ede5d8] shadow-md flex flex-col">
            {/* ── Card Header ── */}
            <div className="px-6 pt-6 pb-4 shrink-0 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#1a1208]">
                Order Summary
              </h2>
              <button
                onClick={clearCart}
                className="border border-[#e0d5c4] text-[#8a7460] text-xs px-4 py-1.5 rounded-full hover:border-[#e85d04] hover:text-[#e85d04] transition-colors"
              >
                Clear all
              </button>
            </div>

            <hr className="border-[#ede5d8] mx-6 shrink-0" />

            {/* ── Scrollable Items (4টার বেশি হলে scroll) ── */}
            <div
              className="overflow-y-auto px-6 py-4 flex flex-col gap-3"
              style={{ maxHeight: "calc(4 * 132px + 3 * 12px)" }}
            >
              {cart.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-[#faf7f3] rounded-2xl border border-[#ede5d8] flex overflow-hidden shrink-0"
                >
                  {/* Image */}
                  <div className="w-24 shrink-0">
                    {item.product.images ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.images}
                        alt={item.product.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full min-h-[100px] h-full bg-[#f5ede0] flex items-center justify-center text-3xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 px-4 py-3 flex flex-col gap-2">
                    {/* Top row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-[#1a1208]">
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

                    {/* Footer: qty + price */}
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeQty(item.cartId, -1)}
                          className="w-7 h-7 rounded-full border border-[#e0d5c4] flex items-center justify-center text-sm hover:border-[#e85d04] hover:text-[#e85d04] transition-all"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold min-w-[18px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => changeQty(item.cartId, 1)}
                          className="w-7 h-7 rounded-full border border-[#e0d5c4] flex items-center justify-center text-sm hover:border-[#e85d04] hover:text-[#e85d04] transition-all"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[0.7rem] text-[#a08060]">
                          {fmt(item.unitPrice)} each
                        </span>
                        <span className="text-sm font-extrabold text-[#e85d04]">
                          {fmt(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Fixed Bottom: Totals + Checkout ── */}
            <div className="px-6 pt-4 pb-6 shrink-0 border-t border-[#ede5d8] bg-white rounded-b-2xl">
              <div className="flex justify-between text-sm text-[#5a4a35] mb-1.5">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#5a4a35] mb-3">
                <span>Delivery Fee</span>
                <span>{fmt(deliveryFee)}</span>
              </div>

              <hr className="border-[#ede5d8] mb-3" />

              <div className="flex justify-between text-base font-extrabold text-[#1a1208] mb-3">
                <span>Total</span>
                <span>{fmt(grandTotal)}</span>
              </div>

              <p className="text-xs text-[#a08060] bg-[#fef4ec] px-3 py-2 rounded-xl leading-relaxed mb-4">
                Discounts and additional charges will be applied at checkout.
              </p>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full py-4 bg-[#e85d04] hover:bg-[#c94e03] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl flex items-center justify-center transition-colors"
              >
                {checkingOut ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  `Checkout — ${fmt(grandTotal)}`
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
