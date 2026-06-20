"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CartAddon,
  CartItem,
  Product,
  ProductPrice,
} from "@/types/productPrice.type";
import TagBarPage from "./tagBar/page";
import { getDisplayPrice, getSizeLabel } from "@/helpers/productPriceHelper";
import AddonModal from "./addonModal/page";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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

function ProductCardPage({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  const available = product.availabilityStatus === "AVAILABLE";
  const hasAddons = product.addons?.length > 0;
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #ede5d8",
        boxShadow: hover
          ? "0 8px 24px rgba(0,0,0,.10)"
          : "0 2px 8px rgba(0,0,0,.05)",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        transition: "all .2s",
        display: "flex",
        flexDirection: "column" as const,
        opacity: available ? 1 : 0.55,
      }}
    >
      {/* Image */}
      <div
        style={{ position: "relative", height: "160px", overflow: "hidden" }}
      >
        {product.images ? (
          <img
            src={product.images}
            alt={product.productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#f5ede0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
            }}
          >
            🍽️
          </div>
        )}
        {product.featured && (
          <span
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "#e85d04",
              color: "#fff",
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: "50px",
              letterSpacing: "0.5px",
            }}
          >
            Featured
          </span>
        )}
        {!available && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,.35)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            Not Available
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "14px 16px 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column" as const,
          gap: "6px",
        }}
      >
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1208" }}>
            {product.productName}
          </div>
          {product.provider?.name && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "#8a7460",
                marginTop: "2px",
              }}
            >
              🏪 {product.provider.name}
            </div>
          )}
        </div>

        {product.description && (
          <div
            style={{
              fontSize: "0.78rem",
              color: "#7a6a55",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}
          >
            {product.description}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.74rem", color: "#a08060" }}>
            {getSizeLabel(product.productPrices)}
          </span>
          {hasAddons && (
            <span
              style={{
                fontSize: "0.7rem",
                background: "#fde8d8",
                color: "#e85d04",
                padding: "2px 8px",
                borderRadius: "50px",
                fontWeight: 600,
              }}
            >
              +{product.addons.length} add-ons
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
            paddingTop: "6px",
          }}
        >
          <span
            style={{ fontSize: "1.05rem", fontWeight: 800, color: "#e85d04" }}
          >
            {getDisplayPrice(product.productPrices)}
          </span>
          <button
            disabled={!available}
            onClick={() => available && onAdd(product)}
            style={{
              background: available ? "#e85d04" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "50px",
              padding: "7px 18px",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: available ? "pointer" : "not-allowed",
              transition: "background .18s",
            }}
          >
            {hasAddons ? "Customize" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AllProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ✅ FIX: use full URL to Express backend, not Next.js relative path
        const res = await fetch(`${API_BASE}/product`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        setProducts(json.data.data ?? []);
      } catch (err: any) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const sync = () => {
      const cart = loadCart();
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    sync();
    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, []);

  const allTags = Array.from(new Set(products.flatMap((p) => p.tags))).sort();

  const productsByTag: Record<string, Product[]> =
    activeTag === "All"
      ? allTags.reduce(
          (acc, tag) => {
            const tagged = products.filter((p) => p.tags.includes(tag));
            if (tagged.length > 0) acc[tag] = tagged;
            return acc;
          },
          {} as Record<string, Product[]>,
        )
      : { [activeTag]: products.filter((p) => p.tags.includes(activeTag)) };

  const handleAdd = (product: Product) => {
    const hasAddons = (product.addons ?? []).length > 0;
    const hasSizes =
      product.productPrices.length > 0 &&
      product.productPrices[0].priceType === "SIZE";
    if (hasAddons || hasSizes) {
      setModalProduct(product);
    } else {
      commitToCart(product, product.productPrices[0] ?? null, [], 1);
    }
  };

  const commitToCart = (
    product: Product,
    selectedPrice: ProductPrice | null,
    addons: CartAddon[],
    qty: number,
  ) => {
    const base = selectedPrice
      ? (selectedPrice.newPrice ?? selectedPrice.price)
      : 0;
    const addonTotal = addons.reduce(
      (s, ca) => s + ca.addon.price * ca.quantity,
      0,
    );
    const unitPrice = base + addonTotal;
    const newItem: CartItem = {
      cartId: `${Date.now()}-${Math.random()}`,
      product,
      selectedPrice,
      addons,
      quantity: qty,
      unitPrice,
      subtotal: unitPrice * qty,
    };
    saveCart([...loadCart(), newItem]);
    setModalProduct(null);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          color: "#7a6a55",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e0d5c4",
            borderTopColor: "#e85d04",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p>Loading menu…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e85d04",
          fontFamily: "system-ui",
        }}
      >
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f1eb",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#1a1208",
      }}
    >
      {/* ── TAG BAR ── */}
      <TagBarPage tags={allTags} active={activeTag} onChange={setActiveTag} />

      {/* ── CONTENT ── */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "32px 24px 80px",
        }}
      >
        {Object.entries(productsByTag).map(([tag, items], idx) => (
          <section key={tag} style={{ marginTop: idx === 0 ? 0 : "44px" }}>
            {/* Section header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "#1a1208",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {tag}
              </h2>
              <span
                style={{
                  background: "#fde8d8",
                  color: "#e85d04",
                  borderRadius: "50px",
                  padding: "2px 10px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}
              >
                {items.length}
              </span>
              <div style={{ flex: 1, height: "1px", background: "#e8dfd0" }} />
            </div>

            {/* Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "18px",
              }}
            >
              {items.map((product) => (
                <ProductCardPage
                  key={product.productId}
                  product={product}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </section>
        ))}

        {Object.keys(productsByTag).length === 0 && (
          <div
            style={{
              minHeight: "40vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7a6a55",
            }}
          >
            No products found for "{activeTag}"
          </div>
        )}
      </main>

      {/* ── ADDON MODAL ── */}
      {modalProduct && (
        <AddonModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onConfirm={(price, addons, qty) =>
            commitToCart(modalProduct, price, addons, qty)
          }
        />
      )}
    </div>
  );
}
