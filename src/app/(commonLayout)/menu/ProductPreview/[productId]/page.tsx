"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ChevronLeft, Clock } from "lucide-react";
import {
  CartAddon,
  CartItem,
  Product,
  ProductPrice,
} from "@/types/productPrice.type";
import { loadCart, saveCart } from "@/helpers/cartHelpers";
import AddonModal from "../../allProduct/addonModal/page";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface ReviewReply {
  replyId: string;
  comment: string;
  createdAt: string;
  user: { id: string; name: string; role?: string };
}

interface ReviewItem {
  reviewId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: { id: string; name: string; image?: string | null };
  reviewReplays: ReviewReply[];
}

interface ProductPriceDetail {
  priceId: string;
  priceType: "BASE" | "SIZE";
  size: string | null;
  price: number;
  newPrice: number | null;
}

interface ProviderInfo {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
}

interface MileTimeInfo {
  mileTimeId: string;
  mileTime: string[];
}

interface AddonDetail {
  addonId: string;
  addonName: string;
  price: number;
}

interface ProductDetail {
  productId: string;
  productName: string;
  description: string | null;
  images: string | null;
  featured: boolean;
  availabilityStatus: "AVAILABLE" | "NOT_AVAILABLE";
  tags: string[];
  ingredients: string[];
  provider: ProviderInfo;
  mileTiem: MileTimeInfo | null;
  productPrices: ProductPriceDetail[];
  addons: AddonDetail[];
  reviews: ReviewItem[];
}

export default function ProductPreviewPage() {
  const router = useRouter();
  const params = useParams<{ productId: string }>();
  const productId = params?.productId;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddonModal, setShowAddonModal] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/product/${productId}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        setProduct(json.data);
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAdd = () => {
    if (!product) return;
    const hasAddons = product.addons.length > 0;
    const hasSizes =
      product.productPrices.length > 0 &&
      product.productPrices[0].priceType === "SIZE";
    if (hasAddons || hasSizes) {
      setShowAddonModal(true);
    } else {
      commitToCart(product.productPrices[0] as ProductPrice, [], 1);
    }
  };

  const commitToCart = (
    selectedPrice: ProductPrice | null,
    addons: CartAddon[],
    qty: number,
  ) => {
    if (!product) return;
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
      // The detail payload is a superset of the shared Product type
      // (extra fields like provider/reviews) — cast since it satisfies
      // every field CartItem actually needs.
      product: product as unknown as Product,
      selectedPrice,
      addons,
      quantity: qty,
      unitPrice,
      subtotal: unitPrice * qty,
    };
    saveCart([...loadCart(), newItem]);
    setShowAddonModal(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3.5 px-4 py-16 text-[#7a6a55]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
        <p>Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center text-[#e85d04]">
        <p>⚠️ {error || "Product not found"}</p>
        <button
          onClick={() => router.push("/product")}
          className="rounded-full bg-[#e85d04] px-5 py-2 text-sm font-bold text-white"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const available = product.availabilityStatus === "AVAILABLE";
  const hasAddons = product.addons.length > 0;
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-16 text-[#1a1208] sm:px-6">
      {/* ── Back ── */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-[#8a7460] hover:text-[#e85d04]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      {/* ── Hero image ── */}
      <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-72">
        {product.images ? (
          <img
            src={product.images}
            alt={product.productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f5ede0] text-6xl">
            🍽️
          </div>
        )}
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-[#e85d04] px-3 py-1 text-xs font-bold tracking-wide text-white">
            Featured
          </span>
        )}
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-bold text-white">
            Currently Not Available
          </div>
        )}
      </div>

      {/* ── Title + provider + rating ── */}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1208]">
            {product.productName}
          </h1>
          {product.provider && (
            <div className="mt-1 flex items-center gap-2 text-sm text-[#8a7460]">
              {product.provider.image ? (
                <img
                  src={product.provider.image}
                  alt={product.provider.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fde8d8] text-xs font-bold text-[#e85d04]">
                  {product.provider.name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              )}
              🏪 {product.provider.name}
            </div>
          )}
        </div>

        {product.reviews.length > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-[#fef4ec] px-3 py-1.5">
            <Star className="h-4 w-4 fill-[#e85d04] text-[#e85d04]" />
            <span className="text-sm font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-[#a08060]">
              ({product.reviews.length})
            </span>
          </div>
        )}
      </div>

      {/* ── Tags ── */}
      {product.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#fde8d8] px-2.5 py-0.5 text-xs font-semibold text-[#e85d04]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Description ── */}
      {product.description && (
        <p className="mt-4 text-sm leading-relaxed text-[#5a4a35]">
          {product.description}
        </p>
      )}

      {/* ── Ingredients ── */}
      {product.ingredients.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-[#1a1208]">Ingredients</h3>
          <p className="mt-1 text-sm text-[#7a6a55]">
            {product.ingredients.join(", ")}
          </p>
        </div>
      )}

      {/* ── Mile Time ── */}
      {product.mileTiem && product.mileTiem.mileTime.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-sm text-[#7a6a55]">
          <Clock className="h-4 w-4 text-[#a08060]" />
          <span>Available: {product.mileTiem.mileTime.join(", ")}</span>
        </div>
      )}

      {/* ── Prices ── */}
      {product.productPrices.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-bold text-[#1a1208]">
            {product.productPrices[0].priceType === "SIZE" ? "Sizes" : "Price"}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.productPrices.map((p) => (
              <div
                key={p.priceId}
                className="rounded-xl border border-[#ede5d8] bg-[#faf7f3] px-3 py-2 text-sm"
              >
                {p.size && (
                  <span className="mr-2 font-semibold text-[#1a1208]">
                    {p.size}
                  </span>
                )}
                {p.newPrice ? (
                  <>
                    <span className="font-bold text-[#e85d04]">
                      ${p.newPrice.toFixed(2)}
                    </span>
                    <span className="ml-1.5 text-xs text-[#a08060] line-through">
                      ${p.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-[#e85d04]">
                    ${p.price.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Addons ── */}
      {product.addons.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-bold text-[#1a1208]">Add-ons</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.addons.map((addon) => (
              <span
                key={addon.addonId}
                className="rounded-full bg-[#fde8d8] px-3 py-1 text-xs font-semibold text-[#e85d04]"
              >
                {addon.addonName} (+${addon.price.toFixed(2)})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Add to cart ── */}
      <button
        disabled={!available}
        onClick={handleAdd}
        className={`mt-6 w-full rounded-xl py-3 text-base font-bold text-white transition-colors ${
          available
            ? "cursor-pointer bg-[#e85d04] hover:bg-[#c94e03]"
            : "cursor-not-allowed bg-[#ccc]"
        }`}
      >
        {hasAddons ? "Customize & Add to Cart" : "Add to Cart"}
      </button>

      {/* ── Reviews ── */}
      <div className="mt-10">
        <h2 className="text-lg font-extrabold text-[#1a1208]">
          Reviews {product.reviews.length > 0 && `(${product.reviews.length})`}
        </h2>

        {product.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-[#7a6a55]">
            No reviews yet for this item.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {product.reviews.map((review) => (
              <div
                key={review.reviewId}
                className="rounded-2xl border border-[#ede5d8] bg-[#faf7f3] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {review.customer.image ? (
                      <img
                        src={review.customer.image}
                        alt={review.customer.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fde8d8] text-xs font-bold text-[#e85d04]">
                        {review.customer.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </span>
                    )}
                    <span className="text-sm font-bold text-[#1a1208]">
                      {review.customer.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i <= review.rating
                            ? "fill-[#e85d04] text-[#e85d04]"
                            : "fill-[#e0d5c4] text-[#e0d5c4]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-2 text-sm text-[#5a4a35]">
                    {review.comment}
                  </p>
                )}

                {review.reviewReplays.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 border-l-2 border-[#ede5d8] pl-3">
                    {review.reviewReplays.map((reply) => (
                      <div key={reply.replyId}>
                        <span className="text-xs font-bold text-[#e85d04]">
                          {reply.user.name}
                          {reply.user.role === "PROVIDER" && " (Provider)"}
                        </span>
                        <p className="text-sm text-[#5a4a35]">
                          {reply.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Addon modal ── */}
      {showAddonModal && (
        <AddonModal
          product={product as unknown as Product}
          onClose={() => setShowAddonModal(false)}
          onConfirm={(price, addons, qty) => commitToCart(price, addons, qty)}
        />
      )}
    </div>
  );
}
