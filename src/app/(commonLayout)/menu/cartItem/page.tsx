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
          : item
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
    // In a real app, you'd call the order API here:
    // POST /api/v1/orders  { customerId }
    // The backend reads from the cart in DB
    setCheckingOut(true);
    await new Promise((r) => setTimeout(r, 1400));
    clearCart();
    setCheckingOut(false);
    setOrderSuccess(true);
  };

  if (orderSuccess) {
    return (
      <>
        <style>{baseStyles}</style>
        <div className="success-wrap">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">Order Placed!</h2>
          <p className="success-sub">
            Your order is being prepared. Sit tight!
          </p>
          <button className="back-btn" onClick={() => router.push("/")}>
            ← Back to Menu
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{baseStyles}</style>

      {/* NAV */}
      <nav className="top-nav">
        <button className="back-link" onClick={() => router.back()}>
          ← Back to Menu
        </button>
        <div className="nav-logo">
          Your <span>Cart</span>
        </div>
        <div className="nav-count">
          {totalItems} item{totalItems !== 1 ? "s" : ""}
        </div>
      </nav>

      <main className="cart-page">
        {cart.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2 className="empty-title">Your cart is empty</h2>
            <p className="empty-sub">
              Looks like you haven&apos;t added anything yet.
            </p>
            <button className="back-btn" onClick={() => router.push("/")}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* LEFT: Items */}
            <div className="cart-items-col">
              <div className="col-header">
                <h2 className="col-title">Order Items</h2>
                <button className="clear-btn" onClick={clearCart}>
                  Clear all
                </button>
              </div>

              <div className="items-list">
                {cart.map((item) => (
                  <div key={item.cartId} className="cart-card">
                    <div className="cart-card-image-wrap">
                      {item.product.images ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images}
                          alt={item.product.productName}
                          className="cart-card-image"
                        />
                      ) : (
                        <div className="cart-card-placeholder">🍽️</div>
                      )}
                    </div>

                    <div className="cart-card-body">
                      <div className="cart-card-top">
                        <div>
                          <h3 className="cart-item-name">
                            {item.product.productName}
                          </h3>
                          {item.product.provider && (
                            <span className="cart-item-provider">
                              🏪 {item.product.provider.name}
                            </span>
                          )}
                          {item.selectedPrice?.size && (
                            <span className="cart-item-size">
                              Size: {item.selectedPrice.size}
                            </span>
                          )}
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.cartId)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Addons */}
                      {item.addons.length > 0 && (
                        <div className="cart-addons">
                          {item.addons.map((ca) => (
                            <span key={ca.addon.addonId} className="cart-addon-chip">
                              {ca.addon.addonName} ×{ca.quantity}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="cart-card-footer">
                        <div className="qty-ctrl">
                          <button
                            className="qty-btn"
                            onClick={() => changeQty(item.cartId, -1)}
                          >
                            −
                          </button>
                          <span className="qty-num">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => changeQty(item.cartId, 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="cart-price-stack">
                          <span className="cart-unit-price">
                            {fmt(item.unitPrice)} each
                          </span>
                          <span className="cart-subtotal">
                            {fmt(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="note-section">
                <label className="note-label">Additional Instructions</label>
                <textarea
                  className="note-input"
                  placeholder="Any special requests or dietary notes…"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                />
                <div className="note-count">{note.length}/300</div>
              </div>
            </div>

            {/* RIGHT: Summary */}
            <div className="summary-col">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>

                <div className="summary-rows">
                  {cart.map((item) => (
                    <div key={item.cartId} className="summary-row">
                      <span className="summary-row-name">
                        {item.product.productName}
                        {item.selectedPrice?.size
                          ? ` (${item.selectedPrice.size})`
                          : ""}
                        {" "}×{item.quantity}
                      </span>
                      <span className="summary-row-price">
                        {fmt(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="summary-divider" />

                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="summary-line">
                  <span>Delivery Fee</span>
                  <span>{fmt(deliveryFee)}</span>
                </div>

                <div className="summary-divider" />

                <div className="summary-total">
                  <span>Total</span>
                  <span>{fmt(grandTotal)}</span>
                </div>

                <p className="summary-note">
                  Discounts and any additional charges will be applied at
                  checkout.
                </p>

                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    <span className="btn-spinner" />
                  ) : (
                    `Checkout — ${fmt(grandTotal)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const baseStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f1eb; font-family: 'Inter', system-ui, sans-serif; color: #1a1208; }

  /* NAV */
  .top-nav {
    position: sticky; top: 0; z-index: 100;
    background: #fff; border-bottom: 1px solid #e8e1d6;
    padding: 14px 24px; display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 1px 8px rgba(0,0,0,.06);
  }
  .back-link {
    background: none; border: none; color: #e85d04; cursor: pointer;
    font-size: 0.9rem; font-weight: 600;
  }
  .nav-logo { font-size: 1.25rem; font-weight: 800; color: #1a1208; }
  .nav-logo span { color: #e85d04; }
  .nav-count { font-size: 0.85rem; color: #8a7460; font-weight: 500; }

  /* PAGE */
  .cart-page { max-width: 1100px; margin: 0 auto; padding: 32px 24px 80px; }

  /* LAYOUT */
  .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }
  @media (max-width: 800px) { .cart-layout { grid-template-columns: 1fr; } }

  /* LEFT COL */
  .col-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .col-title { font-size: 1.3rem; font-weight: 800; }
  .clear-btn { background: none; border: 1.5px solid #e0d5c4; color: #8a7460; padding: 5px 14px; border-radius: 50px; font-size: 0.8rem; cursor: pointer; }
  .clear-btn:hover { border-color: #e85d04; color: #e85d04; }

  .items-list { display: flex; flex-direction: column; gap: 14px; }

  /* CART CARD */
  .cart-card {
    background: #fff; border-radius: 16px; border: 1px solid #ede5d8;
    overflow: hidden; display: flex; box-shadow: 0 2px 8px rgba(0,0,0,.05);
  }
  .cart-card-image-wrap { width: 110px; flex-shrink: 0; }
  .cart-card-image { width: 100%; height: 100%; object-fit: cover; }
  .cart-card-placeholder {
    width: 100%; height: 100%; min-height: 110px; background: #f5ede0;
    display: flex; align-items: center; justify-content: center; font-size: 2rem;
  }

  .cart-card-body { flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
  .cart-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .cart-item-name { font-size: 1rem; font-weight: 700; color: #1a1208; }
  .cart-item-provider { display: block; font-size: 0.75rem; color: #8a7460; margin-top: 2px; }
  .cart-item-size { display: block; font-size: 0.75rem; color: #a08060; margin-top: 2px; }
  .remove-btn {
    background: none; border: none; color: #ccc; cursor: pointer; font-size: 0.85rem;
    padding: 2px 6px; border-radius: 50%; transition: all .15s;
  }
  .remove-btn:hover { background: #fde8d8; color: #e85d04; }

  .cart-addons { display: flex; flex-wrap: wrap; gap: 6px; }
  .cart-addon-chip { background: #fde8d8; color: #e85d04; font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: 50px; }

  .cart-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }

  .qty-ctrl { display: flex; align-items: center; gap: 10px; }
  .qty-btn {
    width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid #e0d5c4;
    background: transparent; font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all .15s; color: #1a1208;
  }
  .qty-btn:hover { border-color: #e85d04; color: #e85d04; }
  .qty-num { font-size: 0.95rem; font-weight: 700; min-width: 20px; text-align: center; }

  .cart-price-stack { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .cart-unit-price { font-size: 0.75rem; color: #a08060; }
  .cart-subtotal { font-size: 1rem; font-weight: 800; color: #e85d04; }

  /* NOTE */
  .note-section { margin-top: 22px; background: #fff; border-radius: 14px; padding: 16px; border: 1px solid #ede5d8; }
  .note-label { display: block; font-size: 0.8rem; font-weight: 700; color: #a08060; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .note-input {
    width: 100%; border: 1.5px solid #e0d5c4; border-radius: 10px;
    padding: 10px 12px; font-size: 0.875rem; font-family: inherit;
    resize: none; outline: none; color: #1a1208;
  }
  .note-input:focus { border-color: #e85d04; }
  .note-count { font-size: 0.75rem; color: #a08060; text-align: right; margin-top: 4px; }

  /* SUMMARY */
  .summary-col { position: sticky; top: 80px; }
  .summary-card { background: #fff; border-radius: 18px; padding: 24px; border: 1px solid #ede5d8; box-shadow: 0 4px 16px rgba(0,0,0,.07); }
  .summary-title { font-size: 1.1rem; font-weight: 800; margin-bottom: 18px; }

  .summary-rows { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .summary-row { display: flex; justify-content: space-between; gap: 10px; }
  .summary-row-name { font-size: 0.82rem; color: #5a4a35; flex: 1; }
  .summary-row-price { font-size: 0.82rem; font-weight: 600; color: #1a1208; flex-shrink: 0; }

  .summary-divider { height: 1px; background: #ede5d8; margin: 12px 0; }

  .summary-line { display: flex; justify-content: space-between; font-size: 0.875rem; color: #5a4a35; margin-bottom: 8px; }
  .summary-total { display: flex; justify-content: space-between; font-size: 1.05rem; font-weight: 800; color: #1a1208; }

  .summary-note { font-size: 0.75rem; color: #a08060; margin-top: 10px; line-height: 1.5; background: #fef4ec; padding: 8px 10px; border-radius: 8px; }

  .checkout-btn {
    width: 100%; margin-top: 18px; padding: 15px;
    background: #e85d04; color: #fff; border: none; border-radius: 12px;
    font-size: 1rem; font-weight: 700; cursor: pointer; transition: background .2s;
    display: flex; align-items: center; justify-content: center;
  }
  .checkout-btn:hover:not(:disabled) { background: #c94e03; }
  .checkout-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .btn-spinner {
    width: 20px; height: 20px; border: 2px solid rgba(255,255,255,.4);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* EMPTY / SUCCESS */
  .empty-state, .success-wrap {
    min-height: 60vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 14px; text-align: center;
  }
  .empty-icon, .success-icon { font-size: 3.5rem; }
  .empty-title, .success-title { font-size: 1.5rem; font-weight: 800; }
  .empty-sub, .success-sub { font-size: 0.9rem; color: #7a6a55; }
  .back-btn {
    margin-top: 6px; background: #e85d04; color: #fff; border: none;
    padding: 12px 28px; border-radius: 50px; font-size: 0.95rem;
    font-weight: 700; cursor: pointer;
  }
  .back-btn:hover { background: #c94e03; }
`;