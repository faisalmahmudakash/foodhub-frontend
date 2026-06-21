"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { deleteProductById, fetchProductById, fetchProducts } from "./api";
import ProductTable from "./ProductTable";
import ProductFormModal from "./ProductFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { Product } from "@/types/product.type";

export default function AdminProductPage() {
  const { data: session } = authClient.useSession();
  const providerId = session?.user?.id ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchProducts();
      // cast to any to avoid cross-module Product type mismatch
      setProducts(data as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [products, search]);

  function openCreate() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  async function openEdit(product: Product) {
    setFormLoading(true);
    setFormOpen(true);
    try {
      const full = await fetchProductById(product.productId);
      setEditingProduct(full as any);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load product details",
      );
      setFormOpen(false);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteProductById(deleteTarget.productId);
      setDeleteTarget(null);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Admin dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Products
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create and manage every product, its pricing, and add-ons.
            </p>
          </div>
          <button
            onClick={openCreate}
            disabled={!providerId}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            <PlusIcon /> New product
          </button>
        </header>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or tag…"
            className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <p className="text-sm text-slate-500">
            {filtered.length} of {products.length} products
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6">
          <ProductTable
            products={filtered}
            loading={loading}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onCreateFirst={openCreate}
          />
        </div>
      </div>

      {formOpen && (
        <ProductFormModal
          providerId={providerId}
          product={editingProduct}
          loadingDetails={formLoading}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            loadProducts();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete product"
          message={`Delete "${deleteTarget.productName}"? This removes its prices and add-ons too. This can't be undone.`}
          loading={deleteLoading}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirmed}
        />
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 2.5V13.5M2.5 8H13.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
