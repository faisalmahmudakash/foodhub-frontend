"use client";

import React, { useEffect, useState } from "react";
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
  const router = useRouter();
  const available = product.availabilityStatus === "AVAILABLE";
  const hasAddons = product.addons?.length > 0;

  // const goToPreview = () => {
  //   router.push(`/product/${product.productId}`);
  // };

  const goToPreview = () => {
    router.push(`/menu/ProductPreview/${product.productId}`); // 👈 updated path
  };

  return (
    <div
      onClick={goToPreview}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToPreview();
      }}
      className={`flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#ede5d8] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] ${
        available ? "opacity-100" : "opacity-[0.55]"
      }`}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden sm:h-44">
        {product.images ? (
          <img
            src={product.images}
            alt={product.productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f5ede0] text-[2.5rem]">
            🍽️
          </div>
        )}
        {product.featured && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[#e85d04] px-[9px] py-[3px] text-[0.68rem] font-bold tracking-[0.5px] text-white">
            Featured
          </span>
        )}
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 text-[0.85rem] font-bold text-white">
            Not Available
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3.5">
        <div>
          <div className="text-base font-bold text-[#1a1208]">
            {product.productName}
          </div>
          {product.provider?.name && (
            <div className="mt-0.5 text-xs text-[#8a7460]">
              🏪 {product.provider.name}
            </div>
          )}
        </div>

        {product.description && (
          <div className="line-clamp-2 text-[0.78rem] leading-[1.4] text-[#7a6a55]">
            {product.description}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[0.74rem] text-[#a08060]">
            {getSizeLabel(product.productPrices)}
          </span>
          {hasAddons && (
            <span className="rounded-full bg-[#fde8d8] px-2 py-0.5 text-[0.7rem] font-semibold text-[#e85d04]">
              +{product.addons.length} add-ons
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-1.5">
          <span className="text-[1.05rem] font-extrabold text-[#e85d04]">
            {getDisplayPrice(product.productPrices)}
          </span>
          <button
            disabled={!available}
            onClick={(e) => {
              e.stopPropagation(); // card-er click navigate korbe na
              available && onAdd(product);
            }}
            className={`rounded-full px-5 py-2 text-[0.85rem] font-bold text-white transition-colors duration-150 ${
              available
                ? "cursor-pointer bg-[#e85d04]"
                : "cursor-not-allowed bg-[#ccc]"
            }`}
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
      <div className="flex flex-col items-center justify-center gap-3.5 px-4 py-10 text-[#7a6a55]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
        <p>Loading menu…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center px-4 py-10 text-[#e85d04]">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* ── TAG BAR ── */}
      <TagBarPage tags={allTags} active={activeTag} onChange={setActiveTag} />

      {/* ── CONTENT ── */}
      <main>
        {Object.entries(productsByTag).map(([tag, items], idx) => (
          <section key={tag} className={idx === 0 ? "mt-0" : "mt-11"}>
            {/* Section header */}
            <div className="mb-5 flex items-center gap-3">
              <h2 className="whitespace-nowrap text-[1.3rem] font-extrabold text-[#1a1208]">
                {tag}
              </h2>

              <div className="h-px flex-1 bg-[#e8dfd0]" />

              <span className="rounded-full bg-[#fde8d8] px-2.5 py-0.5 text-[0.78rem] font-bold text-[#e85d04]">
                {items.length}
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="flex min-h-[40vh] items-center justify-center text-[#7a6a55]">
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
