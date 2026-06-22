"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  fetchMyProducts,
  fetchMileTimes,
  createMyProduct,
  updateMyProduct,
  deleteMyProduct,
} from "@/helpers/providerApi";
import { fmt } from "@/helpers/cartHelpers";
import type {
  ProviderProduct,
  MileTime,
  AvailabilityStatus,
} from "@/types/provider.type";

// ─── shared input style (mirrors ProductFormModal) ───────────────────────────
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

// ─── types ───────────────────────────────────────────────────────────────────
type FormState = {
  productId?: string;
  mileTimeId: string;
  productName: string;
  description: string;
  images: string;
  featured: boolean;
  availabilityStatus: AvailabilityStatus;
  tagsInput: string;
  ingredientsInput: string;
};

const emptyForm: FormState = {
  mileTimeId: "",
  productName: "",
  description: "",
  images: "",
  featured: false,
  availabilityStatus: "AVAILABLE",
  tagsInput: "",
  ingredientsInput: "",
};

// ─── page ────────────────────────────────────────────────────────────────────
export default function ProviderProductsPage() {
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;

  const [products, setProducts] = useState<ProviderProduct[]>([]);
  const [mileTimes, setMileTimes] = useState<MileTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      const result = await fetchMyProducts();
      setProducts(result.data);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    fetchMileTimes()
      .then(setMileTimes)
      .catch(() => setMileTimes([]));
  }, []);

  const openCreateModal = () => {
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (product: ProviderProduct) => {
    setForm({
      productId: product.productId,
      mileTimeId: product.mileTimeId ?? "",
      productName: product.productName,
      description: product.description ?? "",
      images: product.images ?? "",
      featured: product.featured,
      availabilityStatus: product.availabilityStatus,
      tagsInput: product.tags.join(", "),
      ingredientsInput: product.ingredients.join(", "),
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(productId);
    try {
      await deleteMyProduct(productId);
      setProducts((curr) => curr.filter((p) => p.productId !== productId));
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    if (!form.productName.trim())
      return setFormError("Product name is required.");
    if (!form.mileTimeId) return setFormError("Select a mile time.");

    setSaving(true);
    setFormError("");

    const payload = {
      providerId: currentUser.id,
      mileTimeId: form.mileTimeId,
      productName: form.productName,
      description: form.description,
      images: form.images,
      featured: form.featured,
      availabilityStatus: form.availabilityStatus,
      tags: form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: form.ingredientsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (form.productId) {
        await updateMyProduct(form.productId, payload);
      } else {
        await createMyProduct(payload);
      }
      setModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      setFormError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  // ── loading / error states ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-600" />
        <p className="text-sm">Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center px-4 py-16 text-sm text-red-600">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* ── header ── */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-base font-semibold text-slate-900">My Products</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
          Add product
        </button>
      </div>

      {/* ── grid ── */}
      {products.length === 0 ? (
        <p className="text-sm text-slate-400">
          You haven&apos;t added any products yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const basePrice =
              product.productPrices.find((p) => p.priceType === "BASE")
                ?.price ?? product.productPrices[0]?.price;

            return (
              <div
                key={product.productId}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* image */}
                <div className="h-36 w-full overflow-hidden rounded-t-2xl bg-slate-100">
                  {product.images ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images}
                      alt={product.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">
                      🍽️
                    </div>
                  )}
                </div>

                {/* body */}
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      {product.productName}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold ${
                        product.availabilityStatus === "AVAILABLE"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {product.availabilityStatus === "AVAILABLE"
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>

                  {product.description && (
                    <p className="line-clamp-2 text-xs text-slate-400">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {basePrice !== undefined ? fmt(basePrice) : "—"}
                    </span>
                    {product.featured && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[0.65rem] font-bold text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* actions */}
                <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.productId)}
                    disabled={deletingId === product.productId}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-200 disabled:opacity-50"
                  >
                    {deletingId === product.productId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                {form.productId ? "Edit product" : "New product"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* modal body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Details
                </h3>

                <Field label="Product name">
                  <input
                    value={form.productName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, productName: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="e.g. Beef Biryani"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={3}
                    className={inputClass}
                  />
                </Field>

                <Field label="Image URL">
                  <input
                    value={form.images}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, images: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="https://…"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Mile time">
                    <select
                      value={form.mileTimeId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, mileTimeId: e.target.value }))
                      }
                      className={inputClass}
                    >
                      <option value="">Select…</option>
                      {mileTimes.map((mt) => (
                        <option key={mt.mileTimeId} value={mt.mileTimeId}>
                          {mt.mileTime.join(" / ")}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Availability">
                    <select
                      value={form.availabilityStatus}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          availabilityStatus: e.target
                            .value as AvailabilityStatus,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="NOT_AVAILABLE">Not available</option>
                    </select>
                  </Field>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, featured: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Feature this product
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tags" hint="Comma separated">
                    <input
                      value={form.tagsInput}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, tagsInput: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="spicy, vegan"
                    />
                  </Field>
                  <Field label="Ingredients" hint="Comma separated">
                    <input
                      value={form.ingredientsInput}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          ingredientsInput: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="rice, chicken"
                    />
                  </Field>
                </div>
              </section>

              <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500 border border-slate-200">
                Pricing and add-ons are managed separately after the product is
                created.
              </p>

              {formError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}
            </div>

            {/* modal footer */}
            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {form.productId ? "Save changes" : "Create product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field helper (mirrors ProductFormModal) ─────────────────────────────────
function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 flex items-baseline justify-between text-slate-700">
        {label}
        {hint && (
          <span className="text-xs font-normal text-slate-400">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}
