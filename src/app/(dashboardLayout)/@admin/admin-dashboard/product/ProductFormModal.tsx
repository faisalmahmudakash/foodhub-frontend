"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  fetchMileTimes,
  saveProductWithDetails,
  type AddonFormRow,
  type PriceFormRow,
} from "./api";
import { AvailabilityStatus, MileTime, Product } from "@/types/product.type";
// import type { AvailabilityStatus, MileTime, Product } from "./types";

interface Props {
  providerId: string;
  product: Product | null; // null = create mode
  loadingDetails: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

// Keep base64 payloads from getting out of hand — bump this if you need to,
// but remember every KB here gets stored as text in the `images` column and
// sent down with every product fetch.
const MAX_IMAGE_BYTES = 1_500_000; // ~1.5MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ProductFormModal({
  providerId,
  product,
  loadingDetails,
  onClose,
  onSaved,
}: Props) {
  const isEdit = Boolean(product);

  const [mileTimes, setMileTimes] = useState<MileTime[]>([]);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState("");
  const [mileTimeId, setMileTimeId] = useState("");
  const [featured, setFeatured] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>("NOT_AVAILABLE");
  const [tagsInput, setTagsInput] = useState("");
  const [ingredientsInput, setIngredientsInput] = useState("");

  const [priceType, setPriceType] = useState<"BASE" | "SIZE">("BASE");
  const [priceRows, setPriceRows] = useState<PriceFormRow[]>([
    { priceType: "BASE", size: null, price: 0, newPrice: null },
  ]);
  const [originalPriceIds, setOriginalPriceIds] = useState<string[]>([]);

  const [addonRows, setAddonRows] = useState<AddonFormRow[]>([]);
  const [originalAddonIds, setOriginalAddonIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    fetchMileTimes()
      .then(({ data }) => setMileTimes(data))
      .catch(() => setMileTimes([]));
  }, []);

  useEffect(() => {
    if (!product) return;

    setProductName(product.productName);
    setDescription(product.description ?? "");
    setImages(product.images ?? "");
    setMileTimeId(product.mileTimeId ?? "");
    setFeatured(product.featured);
    setAvailabilityStatus(product.availabilityStatus);
    setTagsInput(product.tags.join(", "));
    setIngredientsInput(product.ingredients.join(", "));

    const prices = product.productPrices ?? [];
    if (prices.length > 0) {
      setPriceType(prices[0].priceType);
      setPriceRows(
        prices.map((p) => ({
          priceId: p.priceId,
          priceType: p.priceType,
          size: p.size,
          price: p.price,
          newPrice: p.newPrice,
        })),
      );
    }
    setOriginalPriceIds(prices.map((p) => p.priceId));

    const addons = product.addons ?? [];
    setAddonRows(
      addons.map((a) => ({
        addonId: a.addonId,
        addonName: a.addonName,
        price: a.price,
      })),
    );
    setOriginalAddonIds(addons.map((a) => a.addonId));
  }, [product]);

  async function handleImageFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again later
    if (!file) return;

    setImageError(null);

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(
        `Image is too large — please use one under ${(MAX_IMAGE_BYTES / 1_000_000).toFixed(1)}MB.`,
      );
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setImages(base64);
    } catch {
      setImageError("Couldn't read that image — try again.");
    }
  }

  function handlePriceTypeChange(type: "BASE" | "SIZE") {
    setPriceType(type);
    // Switching type drops any existing priceId references on purpose —
    // saveProductWithDetails treats those rows as removed and deletes
    // them before creating the new ones, avoiding the backend's
    // one-price-type-per-product rule.
    setPriceRows(
      type === "BASE"
        ? [{ priceType: "BASE", size: null, price: 0, newPrice: null }]
        : [{ priceType: "SIZE", size: "", price: 0, newPrice: null }],
    );
  }

  function addPriceRow() {
    setPriceRows((rows) => [
      ...rows,
      { priceType: "SIZE", size: "", price: 0, newPrice: null },
    ]);
  }

  function updatePriceRow(index: number, patch: Partial<PriceFormRow>) {
    setPriceRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  function removePriceRow(index: number) {
    setPriceRows((rows) => rows.filter((_, i) => i !== index));
  }

  function addAddonRow() {
    setAddonRows((rows) => [...rows, { addonName: "", price: 0 }]);
  }

  function updateAddonRow(index: number, patch: Partial<AddonFormRow>) {
    setAddonRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  function removeAddonRow(index: number) {
    setAddonRows((rows) => rows.filter((_, i) => i !== index));
  }

  const tags = useMemo(() => splitCommaList(tagsInput), [tagsInput]);
  const ingredients = useMemo(
    () => splitCommaList(ingredientsInput),
    [ingredientsInput],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!productName.trim()) return setFormError("Product name is required.");
    if (!mileTimeId) return setFormError("Select a mile time.");
    if (priceRows.length === 0) return setFormError("Add at least one price.");
    if (priceType === "SIZE" && priceRows.some((r) => !r.size?.trim())) {
      return setFormError("Every size price row needs a size label.");
    }
    if (addonRows.some((r) => !r.addonName.trim()))
      return setFormError("Every add-on needs a name.");
    if (!providerId)
      return setFormError(
        "Your session hasn't loaded yet — try again in a moment.",
      );

    setSaving(true);
    try {
      await saveProductWithDetails({
        productId: product?.productId,
        product: {
          providerId,
          mileTimeId,
          productName: productName.trim(),
          description: description.trim(),
          images: images.trim(),
          featured,
          availabilityStatus,
          tags,
          ingredients,
        },
        prices: priceRows.map((r) => ({ ...r, priceType })),
        originalPriceIds,
        addons: addonRows,
        originalAddonIds,
      });
      onSaved();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save product",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? "Edit product" : "New product"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {loadingDetails ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Loading product…
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Details
                </h3>
                <Field label="Product name">
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={inputClass}
                  />
                </Field>
                <Field label="Image">
                  <div className="space-y-2">
                    {images && (
                      <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={images}
                          alt="Product preview"
                          className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImages("")}
                          className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-slate-500 shadow ring-1 ring-slate-200 hover:text-red-600"
                          aria-label="Remove image"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                    />
                    {imageError && (
                      <p className="text-xs text-red-600">{imageError}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      Or paste an image URL instead:
                    </p>
                    <input
                      value={images.startsWith("data:") ? "" : images}
                      onChange={(e) => setImages(e.target.value)}
                      className={inputClass}
                      placeholder="https://…"
                    />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Mile time">
                    <select
                      value={mileTimeId}
                      onChange={(e) => setMileTimeId(e.target.value)}
                      className={inputClass}
                      required
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
                      value={availabilityStatus}
                      onChange={(e) =>
                        setAvailabilityStatus(
                          e.target.value as AvailabilityStatus,
                        )
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
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Feature this product
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tags" hint="Comma separated">
                    <input
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className={inputClass}
                      placeholder="spicy, vegan"
                    />
                  </Field>
                  <Field label="Ingredients" hint="Comma separated">
                    <input
                      value={ingredientsInput}
                      onChange={(e) => setIngredientsInput(e.target.value)}
                      className={inputClass}
                      placeholder="rice, chicken"
                    />
                  </Field>
                </div>
              </section>

              <section className="space-y-3 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Pricing
                  </h3>
                  <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs">
                    {(["BASE", "SIZE"] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => handlePriceTypeChange(type)}
                        className={`rounded-md px-3 py-1 font-medium ${priceType === type ? "bg-slate-900 text-white" : "text-slate-500"}`}
                      >
                        {type === "BASE" ? "Single price" : "By size"}
                      </button>
                    ))}
                  </div>
                </div>

                {priceRows.map((row, i) => (
                  <div key={i} className="flex items-end gap-2">
                    {priceType === "SIZE" && (
                      <Field label="Size" className="w-28">
                        <input
                          value={row.size ?? ""}
                          onChange={(e) =>
                            updatePriceRow(i, { size: e.target.value })
                          }
                          className={inputClass}
                          placeholder="Small"
                        />
                      </Field>
                    )}
                    <Field label="Price" className="flex-1">
                      <input
                        type="number"
                        step="0.01"
                        value={row.price}
                        onChange={(e) =>
                          updatePriceRow(i, { price: Number(e.target.value) })
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field
                      label="Sale price"
                      hint="Optional"
                      className="flex-1"
                    >
                      <input
                        type="number"
                        step="0.01"
                        value={row.newPrice ?? ""}
                        onChange={(e) =>
                          updatePriceRow(i, {
                            newPrice:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                        className={inputClass}
                      />
                    </Field>
                    {priceType === "SIZE" && priceRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePriceRow(i)}
                        className="mb-1 rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                ))}
                {priceType === "SIZE" && (
                  <button
                    type="button"
                    onClick={addPriceRow}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    + Add another size
                  </button>
                )}
              </section>

              <section className="space-y-3 border-t border-slate-100 pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Add-ons
                </h3>
                {addonRows.length === 0 && (
                  <p className="text-sm text-slate-400">No add-ons yet.</p>
                )}
                {addonRows.map((row, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <Field label="Name" className="flex-1">
                      <input
                        value={row.addonName}
                        onChange={(e) =>
                          updateAddonRow(i, { addonName: e.target.value })
                        }
                        className={inputClass}
                        placeholder="Extra cheese"
                      />
                    </Field>
                    <Field label="Price" className="w-28">
                      <input
                        type="number"
                        step="0.01"
                        value={row.price}
                        onChange={(e) =>
                          updateAddonRow(i, { price: Number(e.target.value) })
                        }
                        className={inputClass}
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => removeAddonRow(i)}
                      className="mb-1 rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAddonRow}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  + Add add-on
                </button>
              </section>

              {formError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Create product"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function splitCommaList(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

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

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 3L13 13M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 5h10M6.5 5V3.5h3V5M4.5 5l.5 8h6l.5-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
