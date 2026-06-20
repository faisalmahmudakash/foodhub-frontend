"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CartItem } from "@/types/productPrice.type";
import { fmt, loadCart, recalc, saveCart } from "@/helpers/cartHelpers";

export default function CartItemPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showItemsMobile, setShowItemsMobile] = useState(false);

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
    <div className=" font-sans text-[#1a1208]">
      <main className="mx-auto md:max-w-2xl md:px-3 py-5 md:pb-10 ">
        {/* ── Single Order Summary Card ── */}
        <div className="flex flex-col md:rounded-2xl border border-[#ede5d8] bg-white shadow-md">
          {/* ── Card Header (sticky) ── */}
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 rounded-t-2xl bg-white px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
            <button
              type="button"
              onClick={() => setShowItemsMobile((prev) => !prev)}
              className="flex min-w-0 items-center gap-1.5 sm:gap-2 lg:cursor-default"
            >
              <h2 className="text-base font-extrabold text-[#1a1208] sm:text-lg">
                Your Cart
              </h2>
              {totalItems > 0 && (
                <span className="shrink-0 text-xs font-semibold text-[#a08060]">
                  ({totalItems})
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[#a08060] transition-transform lg:hidden ${
                  showItemsMobile ? "rotate-180" : ""
                }`}
              />
            </button>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="shrink-0 rounded-full border border-[#e0d5c4] px-3 py-1 text-[0.7rem] text-[#8a7460] transition-colors hover:border-[#e85d04] hover:text-[#e85d04] sm:px-4 sm:py-1.5 sm:text-xs"
              >
                Clear all
              </button>
            )}
          </div>

          <hr className="mx-4 shrink-0 border-[#ede5d8] sm:mx-6" />

          {cart.length === 0 ? (
            /* ── Empty State (inside the same card) ── */
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-6 sm:py-14">
              <span className="text-4xl sm:text-5xl">🛒</span>
              <p className="text-sm text-[#7a6a55]">
                Looks like you haven&apos;t added anything yet.
              </p>
            </div>
          ) : (
            <>
              {/* ── Items — hidden on mobile by default, toggled via header ── */}
              <div
                className={`flex-col gap-2 overflow-y-auto px-3 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:flex ${
                  showItemsMobile ? "flex" : "hidden"
                }`}
                style={{ maxHeight: "calc(4 * 132px + 3 * 12px)" }}
              >
                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="flex shrink-0 items-center overflow-hidden rounded-2xl border border-[#ede5d8] bg-[#faf7f3]"
                  >
                    {/* Image */}
                    <div className="m-2 h-12 w-16 shrink-0 overflow-hidden rounded-xl sm:h-14 sm:w-20">
                      {item.product.images ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images}
                          alt={item.product.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#f5ede0] text-2xl sm:text-3xl">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-4 sm:py-3">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[#1a1208]">
                            {item.product.productName}
                          </h3>
                          {item.product.provider && (
                            <span className="mt-0.5 block truncate text-xs text-[#8a7460]">
                              🏪 {item.product.provider.name}
                            </span>
                          )}
                          {item.selectedPrice?.size && (
                            <span className="mt-0.5 block truncate text-xs text-[#a08060]">
                              Size: {item.selectedPrice.size}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.cartId)}
                          title="Remove"
                          className="shrink-0 rounded-full px-1.5 py-0.5 text-sm text-[#ccc] transition-all hover:bg-[#fde8d8] hover:text-[#e85d04]"
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
                              className="rounded-full bg-[#fde8d8] px-2 py-0.5 text-[0.7rem] font-semibold text-[#e85d04]"
                            >
                              {ca.addon.addonName} ×{ca.quantity}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: qty + price */}
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => changeQty(item.cartId, -1)}
                            className="flex h-5 w-5 items-center justify-center rounded-full border border-[#e0d5c4] text-sm transition-all hover:border-[#e85d04] hover:text-[#e85d04]"
                          >
                            -
                          </button>
                          <span className="min-w-5 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => changeQty(item.cartId, 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-full border border-[#e0d5c4] text-sm transition-all hover:border-[#e85d04] hover:text-[#e85d04]"
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
              <div className="shrink-0 rounded-b-2xl border-t border-[#ede5d8] bg-white px-4 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-6">
                <div className="mb-1.5 flex justify-between text-sm text-[#5a4a35]">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="mb-3 flex justify-between text-sm text-[#5a4a35]">
                  <span>Delivery Fee</span>
                  <span>{fmt(deliveryFee)}</span>
                </div>

                <hr className="mb-3 border-[#ede5d8]" />

                <div className="mb-3 flex justify-between text-base font-extrabold text-[#1a1208]">
                  <span>Total</span>
                  <span>{fmt(grandTotal)}</span>
                </div>

                <div className="sticky bottom-0 left-0 z-50 bg-white p-3 shadow-lg md:static md:p-0 md:shadow-none">
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="flex w-full items-center justify-center rounded-xl bg-[#e85d04] py-3 text-sm font-bold text-white transition-colors hover:bg-[#c94e03] disabled:cursor-not-allowed disabled:opacity-70 sm:py-4 sm:text-base"
                  >
                    {checkingOut ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      `Checkout — ${fmt(grandTotal)}`
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
