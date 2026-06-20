import { formatPrice } from "@/helpers/productPriceHelper";
import { CartAddon, Product, ProductPrice } from "@/types/productPrice.type";
import { useState } from "react";

export default function AddonModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (
    price: ProductPrice | null,
    addons: CartAddon[],
    qty: number,
  ) => void;
}) {
  const hasSizes =
    product.productPrices.length > 0 &&
    product.productPrices[0].priceType === "SIZE";
  const [selectedPrice, setSelectedPrice] = useState<ProductPrice | null>(
    hasSizes ? null : (product.productPrices[0] ?? null),
  );
  const [addonQtys, setAddonQtys] = useState<Record<string, number>>({});
  const [qty, setQty] = useState(1);

  const addonTotal = (product.addons ?? []).reduce(
    (s, a) => s + (addonQtys[a.addonId] ?? 0) * a.price,
    0,
  );
  const base = selectedPrice
    ? (selectedPrice.newPrice ?? selectedPrice.price)
    : 0;
  const total = (base + addonTotal) * qty;

  const handleConfirm = () => {
    if (hasSizes && !selectedPrice) return;
    const addons: CartAddon[] = (product.addons ?? [])
      .filter((a) => (addonQtys[a.addonId] ?? 0) > 0)
      .map((a) => ({ addon: a, quantity: addonQtys[a.addonId] }));
    onConfirm(selectedPrice, addons, qty);
  };

  const adjustAddon = (id: string, delta: number) =>
    setAddonQtys((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,.22)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
            background: "rgba(0,0,0,.3)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          ✕
        </button>

        {/* Image */}
        <div
          style={{
            height: "200px",
            overflow: "hidden",
            borderRadius: "20px 20px 0 0",
          }}
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
                fontSize: "3rem",
              }}
            >
              🍽️
            </div>
          )}
        </div>

        <div style={{ padding: "20px 22px 28px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1a1208" }}>
            {product.productName}
          </h2>
          {product.provider?.name && (
            <p
              style={{ fontSize: "0.8rem", color: "#8a7460", marginTop: "4px" }}
            >
              🏪 {product.provider.name}
            </p>
          )}
          {product.description && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#7a6a55",
                marginTop: "8px",
                lineHeight: 1.5,
              }}
            >
              {product.description}
            </p>
          )}

          {/* Sizes */}
          {hasSizes && (
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#a08060",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.5px",
                  marginBottom: "10px",
                }}
              >
                Choose Size
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: "8px",
                }}
              >
                {product.productPrices.map((pp) => (
                  <button
                    key={pp.priceId}
                    onClick={() => setSelectedPrice(pp)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "11px 14px",
                      border: `1.5px solid ${selectedPrice?.priceId === pp.priceId ? "#e85d04" : "#e0d5c4"}`,
                      borderRadius: "10px",
                      background:
                        selectedPrice?.priceId === pp.priceId
                          ? "#fef4ec"
                          : "transparent",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#1a1208" }}>
                      {pp.size}
                    </span>
                    <span style={{ fontWeight: 700, color: "#e85d04" }}>
                      {formatPrice(pp.newPrice ?? pp.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {(product.addons ?? []).length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#a08060",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.5px",
                  marginBottom: "10px",
                }}
              >
                Add-ons
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: "2px",
                }}
              >
                {product.addons.map((addon) => {
                  const count = addonQtys[addon.addonId] ?? 0;
                  return (
                    <div
                      key={addon.addonId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: "1px solid #f0e8dc",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "#1a1208",
                          }}
                        >
                          {addon.addonName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "#e85d04",
                            fontWeight: 600,
                          }}
                        >
                          +{formatPrice(addon.price)}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          onClick={() => adjustAddon(addon.addonId, -1)}
                          style={qtyBtnStyle}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontWeight: 700,
                            minWidth: "18px",
                            textAlign: "center" as const,
                          }}
                        >
                          {count}
                        </span>
                        <button
                          onClick={() => adjustAddon(addon.addonId, 1)}
                          style={qtyBtnStyle}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#a08060",
                textTransform: "uppercase" as const,
                letterSpacing: "0.5px",
              }}
            >
              Quantity
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={qtyBtnStyle}
              >
                −
              </button>
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} style={qtyBtnStyle}>
                +
              </button>
            </div>
          </div>

          <button
            disabled={hasSizes && !selectedPrice}
            onClick={handleConfirm}
            style={{
              width: "100%",
              marginTop: "22px",
              padding: "14px",
              background: hasSizes && !selectedPrice ? "#ccc" : "#e85d04",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: hasSizes && !selectedPrice ? "not-allowed" : "pointer",
            }}
          >
            Add to Cart — {formatPrice(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

const qtyBtnStyle: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  border: "1.5px solid #e0d5c4",
  background: "transparent",
  fontSize: "1rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#1a1208",
};
