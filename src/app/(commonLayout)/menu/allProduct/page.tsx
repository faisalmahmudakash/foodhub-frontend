"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CartAddon,
  CartItem,
  Product,
  ProductPrice,
} from "@/types/productPrice.type";
import TagBarPage from "./tagBar/page";
import { getDisplayPrice, getSizeLabel } from "@/helpers/productPriceHelper";
import AddonModal from "./addonModal/page";
import { authClient } from "@/lib/auth-client"; // adjust if your auth client lives elsewhere
import { createCartItemOnServer } from "@/helpers/cartApi";

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
  isHighlighted,
}: {
  product: Product;
  onAdd: (p: Product) => void;
  isHighlighted?: boolean;
}) {
  const router = useRouter();
  const available = product.availabilityStatus === "AVAILABLE";
  const hasAddons = product.addons?.length > 0;

  const goToPreview = () => {
    router.push(`/menu/ProductPreview/${product.productId}`);
  };

  return (
    <div
      id={`product-${product.productId}`}
      onClick={goToPreview}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToPreview();
      }}
      className={`flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] ${
        available ? "opacity-100" : "opacity-[0.55]"
      } ${
        isHighlighted
          ? "border-[#e85d04] ring-4 ring-[#e85d04]/30"
          : "border-[#ede5d8]"
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
              e.stopPropagation();
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

// ─── Main Page (inner, uses useSearchParams) ──────────────────────────────────

function AllProductsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get("highlight");
  const qParam = searchParams.get("q");
  const trimmedQuery = (qParam ?? "").trim();
  const isSearchMode = trimmedQuery.length >= 3;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartError, setCartError] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // guards against re-running the scroll/highlight effect for the same param
  const handledHighlightRef = useRef<string | null>(null);

  const { data: session } = authClient.useSession();
  const customerId = session?.user?.id;

  // Loads either the full catalog or, when ?q= has 3+ characters, only the
  // matching products straight from the backend search endpoint — never both.
  useEffect(() => {
    const url = isSearchMode
      ? `${API_BASE}/product/search?q=${encodeURIComponent(trimmedQuery)}`
      : `${API_BASE}/product`;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        setProducts(json.data.data ?? []);
        setActiveTag("All");
      } catch (err: any) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchMode, trimmedQuery]);

  useEffect(() => {
    const sync = () => {
      const cart = loadCart();
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    sync();
    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, []);

  // Locate & highlight a specific product (from "From Our Menu", "Popular
  // Food", or picking a search suggestion).
  useEffect(() => {
    if (!highlightParam || loading || products.length === 0) return;
    if (handledHighlightRef.current === highlightParam) return;

    const target = products.find((p) => p.productId === highlightParam);
    if (!target) return;

    handledHighlightRef.current = highlightParam;

    // Switch to the product's own tag so it renders exactly once in the
    // grid (the "All" view repeats a product under every tag it has).
    if (target.tags?.length) {
      setActiveTag(target.tags[0]);
    }

    // Wait a tick for the (possibly new) tag's grid to paint, then scroll + flash.
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(`product-${highlightParam}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(highlightParam);
        setTimeout(() => setHighlightedId(null), 2200);

        // Clean the highlight param so refreshing/back doesn't re-trigger it.
        const next = new URLSearchParams(searchParams.toString());
        next.delete("highlight");
        const qs = next.toString();
        router.replace(qs ? `/menu?${qs}` : "/menu", { scroll: false });
      }, 80);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightParam, loading, products, router]);

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("q");
    const qs = next.toString();
    router.replace(qs ? `/menu?${qs}` : "/menu", { scroll: false });
  };

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

  const commitToCart = async (
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

    // Optimistic local update so the cart UI reacts instantly
    saveCart([...loadCart(), newItem]);
    setModalProduct(null);

    if (!customerId) {
      setCartError("Please log in to save your cart.");
      return;
    }

    try {
      await createCartItemOnServer({
        customerId,
        productId: product.productId,
        priceId: selectedPrice?.priceId,
        addonIds: addons.map((ca) => ca.addon.addonId),
        quantity: qty,
      });
    } catch (err: any) {
      setCartError(err.message || "Failed to sync item to your cart.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3.5 px-4 py-10 text-[#7a6a55]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
        <p>{isSearchMode ? "Searching…" : "Loading menu…"}</p>
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
      {isSearchMode && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#ede5d8] bg-white px-4 py-3">
          <span className="text-sm text-[#7a6a55]">
            Showing results for{" "}
            <span className="font-bold text-[#1a1208]">
              &quot;{trimmedQuery}&quot;
            </span>
          </span>
          <button
            onClick={clearSearch}
            className="shrink-0 text-sm font-semibold text-[#e85d04]"
          >
            Clear search
          </button>
        </div>
      )}

      <TagBarPage tags={allTags} active={activeTag} onChange={setActiveTag} />

      <main>
        {Object.entries(productsByTag).map(([tag, items], idx) => (
          <section key={tag} className={idx === 0 ? "mt-0" : "mt-11"}>
            <div className="mb-5 flex items-center gap-3">
              <h2 className="whitespace-nowrap text-[1.3rem] font-extrabold text-[#1a1208]">
                {tag}
              </h2>
              <div className="h-px flex-1 bg-[#e8dfd0]" />
              <span className="rounded-full bg-[#fde8d8] px-2.5 py-0.5 text-[0.78rem] font-bold text-[#e85d04]">
                {items.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => (
                <ProductCardPage
                  key={product.productId}
                  product={product}
                  onAdd={handleAdd}
                  isHighlighted={product.productId === highlightedId}
                />
              ))}
            </div>
          </section>
        ))}

        {Object.keys(productsByTag).length === 0 && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center text-[#7a6a55]">
            {isSearchMode ? (
              <>
                <span className="text-4xl">🔍</span>
                <p>No products found for &quot;{trimmedQuery}&quot;.</p>
              </>
            ) : (
              <p>No products found for "{activeTag}"</p>
            )}
          </div>
        )}
      </main>

      {modalProduct && (
        <AddonModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onConfirm={(price, addons, qty) =>
            commitToCart(modalProduct, price, addons, qty)
          }
        />
      )}

      {cartError && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#1a1208] px-4 py-2 text-sm text-white shadow-lg">
          <span>{cartError}</span>
          <button
            onClick={() => setCartError("")}
            className="font-bold text-[#e85d04]"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Default export: wraps in Suspense since useSearchParams() requires it ──

export default function AllProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-3.5 px-4 py-10 text-[#7a6a55]">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
          <p>Loading menu…</p>
        </div>
      }
    >
      <AllProductsPageInner />
    </Suspense>
  );
}
