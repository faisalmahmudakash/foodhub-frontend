"use client";

import { Product } from "@/types/productPrice.type";

// import type { Product } from "./types";

interface Props {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreateFirst: () => void;
}

function formatPriceSummary(product: Product) {
  const prices = product.productPrices ?? [];
  if (prices.length === 0) return "No price set";
  if (prices.length === 1) return `৳${prices[0].price.toFixed(2)}`;
  const sorted = [...prices].sort((a, b) => a.price - b.price);
  return `৳${sorted[0].price.toFixed(2)} – ৳${sorted[sorted.length - 1].price.toFixed(2)}`;
}

export default function ProductTable({ products, loading, onEdit, onDelete, onCreateFirst }: Props) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0"
          >
            <div className="h-10 w-10 rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-slate-200" />
              <div className="h-3 w-1/5 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">No products yet</p>
        <p className="max-w-sm text-sm text-slate-500">Add your first product to start building your menu.</p>
        <button
          onClick={onCreateFirst}
          className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          New product
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3">Product</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Price</th>
            <th className="px-5 py-3">Tags</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.productId} className="hover:bg-slate-50">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  {product.images ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-400">
                      {product.productName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{product.productName}</p>
                    {product.featured && <span className="text-xs font-medium text-amber-600">Featured</span>}
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    product.availabilityStatus === "AVAILABLE"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {product.availabilityStatus === "AVAILABLE" ? "Available" : "Unavailable"}
                </span>
              </td>
              <td className="px-5 py-3 text-slate-700">{formatPriceSummary(product)}</td>
              <td className="px-5 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {tag}
                    </span>
                  ))}
                  {product.tags.length > 3 && <span className="text-xs text-slate-400">+{product.tags.length - 3}</span>}
                </div>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}