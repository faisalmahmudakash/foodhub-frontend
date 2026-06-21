// "use client";

// import React, { useEffect, useState } from "react";

// const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/product`;

// interface ProductPrice {
//   priceType: "BASE" | "SIZE";
//   size: string | null;
//   price: number;
//   newPrice: number | null;
// }

// interface Product {
//   productId: string;
//   productName: string;
//   description: string | null;
//   images: string | null;
//   availabilityStatus: "AVAILABLE" | "NOT_AVAILABLE";
//   tags: string[];
//   productPrices: ProductPrice[];
//   createdAt: string;
//   featured: boolean;
// }

// // tag → newest product image map
// type TagImageMap = Record<string, string | null>;

// function getDisplayPrice(prices: ProductPrice[]): number | null {
//   if (!prices?.length) return null;
//   const base = prices.find((p) => p.priceType === "BASE");
//   if (base) return base.newPrice ?? base.price;
//   const sorted = [...prices].sort(
//     (a, b) => (a.newPrice ?? a.price) - (b.newPrice ?? b.price),
//   );
//   return sorted[0].newPrice ?? sorted[0].price;
// }

// function SkeletonRow() {
//   return (
//     <div className="flex items-center gap-3 py-3 border-b border-gray-100">
//       <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse shrink-0" />
//       <div className="flex-1 space-y-2">
//         <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
//         <div className="h-3 w-36 bg-gray-200 rounded animate-pulse" />
//       </div>
//       <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
//     </div>
//   );
// }

// function ProductRow({ product }: { product: Product }) {
//   const price = getDisplayPrice(product.productPrices);

//   return (
//     <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0 group">
//       <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-orange-100 group-hover:border-orange-300 transition-colors">
//         {product.images ? (
//           <img
//             src={product.images}
//             alt={product.productName}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="w-full h-full bg-orange-50 flex items-center justify-center text-2xl">
//             🍽️
//           </div>
//         )}
//       </div>
//       <div className="flex-1 min-w-0">
//         <h4
//           className={`font-bold text-base truncate ${product.featured ? "text-orange-500" : "text-gray-900"}`}
//         >
//           {product.productName}
//         </h4>
//         <p className="text-sm text-gray-400 truncate">
//           {product.description ?? "Food that hits different."}
//         </p>
//       </div>
//       <span className="font-bold text-gray-800 shrink-0 text-sm">
//         {price !== null ? `$${price.toFixed(2)}` : "—"}
//       </span>
//     </div>
//   );
// }

// export default function FromOurMenu() {
//   const [allProducts, setAllProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [tagImageMap, setTagImageMap] = useState<TagImageMap>({});
//   const [activeCategory, setActiveCategory] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(API_BASE_URL);
//         if (!res.ok) throw new Error("Failed to fetch products");
//         const json = await res.json();

//         const list: Product[] = Array.isArray(json.data)
//           ? json.data
//           : (json.data?.data ?? []);

//         // Sort newest first
//         const sorted = [...list].sort(
//           (a, b) =>
//             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//         );

//         setAllProducts(sorted);

//         // Extract unique tags + grab newest product image per tag
//         const tagSet = new Set<string>();
//         const imgMap: TagImageMap = { All: sorted[0]?.images ?? null };

//         sorted.forEach((p) => {
//           p.tags?.forEach((tag) => {
//             tagSet.add(tag);
//             // first time we see this tag = newest product for it
//             if (!(tag in imgMap)) {
//               imgMap[tag] = p.images ?? null;
//             }
//           });
//         });

//         setCategories(["All", ...Array.from(tagSet)]);
//         setTagImageMap(imgMap);
//       } catch (err: any) {
//         setError(err.message || "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const filtered =
//     activeCategory === "All"
//       ? allProducts
//       : allProducts.filter((p) => p.tags?.includes(activeCategory));

//   const half = Math.ceil(filtered.length / 2);

//   return (
//     <section className="bg-[#f5f0e8] py-16 px-4">
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-dashed border-blue-200">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <p
//             className="text-base italic text-amber-400 mb-1"
//             style={{
//               fontFamily: "Georgia, serif",
//               fontStyle: "italic",
//               fontWeight: 600,
//             }}
//           >
//             Choose and try
//           </p>
//           <h2
//             className="text-4xl text-gray-900"
//             style={{
//               fontFamily: "'Georgia', serif",
//               fontWeight: 900,
//               letterSpacing: "-0.5px",
//             }}
//           >
//             From Our Menu
//           </h2>
//         </div>

//         {/* Category Tabs */}
//         {!loading && categories.length > 0 && (
//           <div className="bg-gray-50 rounded-xl p-3 mb-8">
//             <div className="flex flex-wrap gap-2 justify-center">
//               {categories.map((cat) => {
//                 const isActive = activeCategory === cat;
//                 const img = tagImageMap[cat];
//                 return (
//                   <button
//                     key={cat}
//                     onClick={() => setActiveCategory(cat)}
//                     className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-150 min-w-[72px] ${
//                       isActive
//                         ? "bg-amber-400  shadow-md scale-105"
//                         : "text-gray-500 hover:bg-gray-100"
//                     }`}
//                   >
//                     {/* Show newest product image or fallback emoji */}
//                     {img ? (
//                       <img
//                         src={img}
//                         alt={cat}
//                         className={`w-8 h-8 rounded-full object-cover border-2 ${
//                           isActive ? "border-white" : "border-amber-300"
//                         }`}
//                       />
//                     ) : (
//                       <span className="text-xl">🍴</span>
//                     )}
//                     {cat}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Loading */}
//         {loading && (
//           <div className="grid grid-cols-2 gap-4">
//             <div className="border-2 border-amber-400 rounded-xl px-4 py-1">
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <SkeletonRow key={i} />
//               ))}
//             </div>
//             <div className="border-2 border-amber-400 rounded-xl px-4 py-1">
//               {[6, 7, 8, 9, 10].map((i) => (
//                 <SkeletonRow key={i} />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Error */}
//         {error && (
//           <p className="text-center text-red-500 font-semibold py-8">
//             ⚠️ {error}
//           </p>
//         )}

//         {/* Empty */}
//         {!loading && !error && filtered.length === 0 && (
//           <p className="text-center text-gray-400 py-12">
//             No items found for &quot;{activeCategory}&quot;.
//           </p>
//         )}

//         {/* Product Grid */}
//         {!loading && !error && filtered.length > 0 && (
//           <div className="grid grid-cols-2 gap-4">
//             <div className="border-2 border-amber-400 rounded-xl px-4 py-1">
//               {filtered.slice(0, half).map((product) => (
//                 <ProductRow key={product.productId} product={product} />
//               ))}
//             </div>
//             <div className="border-2 border-amber-400 rounded-xl px-4 py-1">
//               {filtered.slice(half).map((product) => (
//                 <ProductRow key={product.productId} product={product} />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/product`;

interface ProductPrice {
  priceType: "BASE" | "SIZE";
  size: string | null;
  price: number;
  newPrice: number | null;
}

interface Product {
  productId: string;
  productName: string;
  description: string | null;
  images: string | null;
  availabilityStatus: "AVAILABLE" | "NOT_AVAILABLE";
  tags: string[];
  productPrices: ProductPrice[];
  createdAt: string;
  featured: boolean;
}

// tag → newest product image map
type TagImageMap = Record<string, string | null>;

function getDisplayPrice(prices: ProductPrice[]): number | null {
  if (!prices?.length) return null;
  const base = prices.find((p) => p.priceType === "BASE");
  if (base) return base.newPrice ?? base.price;
  const sorted = [...prices].sort(
    (a, b) => (a.newPrice ?? a.price) - (b.newPrice ?? b.price),
  );
  return sorted[0].newPrice ?? sorted[0].price;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100">
      <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-36 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const router = useRouter();
  const price = getDisplayPrice(product.productPrices);

  const goToProductOnMenu = () => {
    router.push(`/menu?highlight=${product.productId}`);
  };

  return (
    <div
      onClick={goToProductOnMenu}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToProductOnMenu();
      }}
      className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0 group cursor-pointer rounded-lg -mx-2 px-2 transition-colors hover:bg-orange-50/60"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-orange-100 group-hover:border-orange-300 transition-colors">
        {product.images ? (
          <img
            src={product.images}
            alt={product.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-orange-50 flex items-center justify-center text-2xl">
            🍽️
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`font-bold text-base truncate ${product.featured ? "text-orange-500" : "text-gray-900"}`}
        >
          {product.productName}
        </h4>
        <p className="text-sm text-gray-400 truncate">
          {product.description ?? "Food that hits different."}
        </p>
      </div>
      <span className="font-bold text-gray-800 shrink-0 text-sm">
        {price !== null ? `$${price.toFixed(2)}` : "—"}
      </span>
    </div>
  );
}

export default function FromOurMenu() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tagImageMap, setTagImageMap] = useState<TagImageMap>({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE_URL);
        if (!res.ok) throw new Error("Failed to fetch products");
        const json = await res.json();

        const list: Product[] = Array.isArray(json.data)
          ? json.data
          : (json.data?.data ?? []);

        // Sort newest first
        const sorted = [...list].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setAllProducts(sorted);

        // Extract unique tags + grab newest product image per tag
        const tagSet = new Set<string>();
        const imgMap: TagImageMap = { All: sorted[0]?.images ?? null };

        sorted.forEach((p) => {
          p.tags?.forEach((tag) => {
            tagSet.add(tag);
            // first time we see this tag = newest product for it
            if (!(tag in imgMap)) {
              imgMap[tag] = p.images ?? null;
            }
          });
        });

        setCategories(["All", ...Array.from(tagSet)]);
        setTagImageMap(imgMap);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filtered =
    activeCategory === "All"
      ? allProducts
      : allProducts.filter((p) => p.tags?.includes(activeCategory));

  const half = Math.ceil(filtered.length / 2);

  return (
    <section className="bg-[#f5f0e8] py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-dashed border-blue-200">
        {/* Header */}
        <div className="text-center mb-8">
          <p
            className="text-base italic text-amber-400 mb-1"
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontWeight: 600,
            }}
          >
            Choose and try
          </p>
          <h2
            className="text-4xl text-gray-900"
            style={{
              fontFamily: "'Georgia', serif",
              fontWeight: 900,
              letterSpacing: "-0.5px",
            }}
          >
            From Our Menu
          </h2>
        </div>

        {/* Category Tabs */}
        {!loading && categories.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                const img = tagImageMap[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-150 min-w-[72px] ${
                      isActive
                        ? "bg-amber-400  shadow-md scale-105"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {/* Show newest product image or fallback emoji */}
                    {img ? (
                      <img
                        src={img}
                        alt={cat}
                        className={`w-8 h-8 rounded-full object-cover border-2 ${
                          isActive ? "border-white" : "border-amber-300"
                        }`}
                      />
                    ) : (
                      <span className="text-xl">🍴</span>
                    )}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-amber-400 rounded-xl px-4 py-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
            <div className="border-2 border-amber-400 rounded-xl px-4 py-1">
              {[6, 7, 8, 9, 10].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 font-semibold py-8">
            ⚠️ {error}
          </p>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">
            No items found for &quot;{activeCategory}&quot;.
          </p>
        )}

        {/* Product Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-amber-400 rounded-xl px-4 py-1">
              {filtered.slice(0, half).map((product) => (
                <ProductRow key={product.productId} product={product} />
              ))}
            </div>
            <div className="border-2 border-amber-400 rounded-xl px-4 py-1">
              {filtered.slice(half).map((product) => (
                <ProductRow key={product.productId} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
