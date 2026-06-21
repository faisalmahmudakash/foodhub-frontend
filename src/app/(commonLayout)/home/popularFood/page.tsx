"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/product`;

interface ProductPrice {
  productId: string;
  priceType: "BASE" | "SIZE";
  size: string | null;
  price: number;
  newPrice: number | null;
}

interface Product {
  productId: string;
  productName: string;
  images: string | null;
  availabilityStatus: "AVAILABLE" | "NOT_AVAILABLE";
  productPrices: ProductPrice[];
  createdAt: string;
}

function getDisplayPrice(prices: ProductPrice[]): number | null {
  if (!prices || prices.length === 0) return null;
  const base = prices.find((p) => p.priceType === "BASE");
  if (base) return base.newPrice ?? base.price;
  // For SIZE pricing, show the lowest price
  const sorted = [...prices].sort(
    (a, b) => (a.newPrice ?? a.price) - (b.newPrice ?? b.price),
  );
  return sorted[0].newPrice ?? sorted[0].price;
}

function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const price = getDisplayPrice(product.productPrices);
  const imgSrc = product.images || null;

  const goToProductOnMenu = () => {
    router.push(`/menu?highlight=${product.productId}`);
  };

  return (
    <div
      className="food-card"
      onClick={goToProductOnMenu}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToProductOnMenu();
      }}
    >
      <div className="food-image-wrapper">
        <div className="dashed-ring" />
        {imgSrc ? (
          <img src={imgSrc} alt={product.productName} className="food-image" />
        ) : (
          <div className="food-image-placeholder">
            <span>🍽️</span>
          </div>
        )}
      </div>

      <div className="food-info">
        <h3 className="food-name">{product.productName}</h3>
        <p className="food-availability">
          {product.availabilityStatus === "AVAILABLE"
            ? "Available now"
            : "Currently unavailable"}
        </p>
        {price !== null ? (
          <p className="food-price">${price.toFixed(2)}</p>
        ) : (
          <p className="food-price no-price">—</p>
        )}
      </div>
    </div>
  );
}

export default function PopularFoodPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE_URL);
        if (!res.ok) throw new Error("Failed to fetch products");
        const json = await res.json();

        // json.data is { data: Product[], total: number }
        const list: Product[] = Array.isArray(json.data)
          ? json.data
          : (json.data?.data ?? []);

        const sorted = [...list]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 4);

        setProducts(sorted);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .popular-section {
          font-family: 'Nunito', sans-serif;
          background-color: #f5f0e8;
          padding: 64px 24px 80px;
          text-align: center;
        }

        .popular-eyebrow {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 12px;
        }

        .popular-title {
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 900;
          color: #1a1a1a;
          margin: 0 0 48px;
          line-height: 1.15;
        }

        .food-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          max-width: 960px;
          margin: 0 auto;
        }

        .food-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px 20px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          cursor: pointer;
        }

        .food-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
        }

        .food-image-wrapper {
          position: relative;
          width: 130px;
          height: 130px;
          margin-bottom: 20px;
          margin-top: -52px;
        }

        .dashed-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px dashed #e87c3e;
        }

        .food-image {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }

        .food-image-placeholder {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: #f0ece4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
        }

        .food-info {
          width: 100%;
          text-align: center;
        }

        .food-name {
          font-size: 18px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 6px;
        }

        .food-availability {
          font-size: 13px;
          color: #888;
          font-weight: 600;
          margin: 0 0 10px;
        }

        .food-price {
          font-size: 17px;
          font-weight: 800;
          color: #e04141;
          margin: 0;
        }

        .food-price.no-price {
          color: #ccc;
        }

        /* Loading / Error states */
        .state-message {
          font-size: 16px;
          color: #888;
          margin-top: 32px;
        }

        .state-message.error {
          color: #e04141;
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          max-width: 960px;
          margin: 48px auto 0;
        }

        .skeleton-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px 20px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .skeleton-circle {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: linear-gradient(90deg, #ede8df 25%, #e0d9ce 50%, #ede8df 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          margin-bottom: 20px;
        }

        .skeleton-line {
          height: 14px;
          border-radius: 8px;
          background: linear-gradient(90deg, #ede8df 25%, #e0d9ce 50%, #ede8df 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          margin-bottom: 10px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Push cards down so image overflows the top */
        .food-grid {
          margin-top: 72px;
        }
      `}</style>

      <section className="popular-section">
        <p className="popular-eyebrow">Best Food</p>
        <h2 className="popular-title">Popular Food Items</h2>

        {loading && (
          <div className="skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div className="skeleton-card" key={i}>
                <div className="skeleton-circle" />
                <div className="skeleton-line" style={{ width: "60%" }} />
                <div className="skeleton-line" style={{ width: "40%" }} />
                <div className="skeleton-line" style={{ width: "30%" }} />
              </div>
            ))}
          </div>
        )}

        {error && <p className="state-message error">⚠️ {error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="state-message">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="food-grid">
            {products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
