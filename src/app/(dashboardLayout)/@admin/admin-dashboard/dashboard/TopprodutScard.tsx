import { TopProduct } from "@/types/dashboard.type";

interface Props {
  products: TopProduct[];
}

export default function TopProductsCard({ products }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">
        Top-selling products
      </h3>
      {products.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No sales yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {products.map((p, i) => (
            <li key={p.productId} className="flex items-center gap-3 py-2.5">
              <span className="w-4 shrink-0 text-xs font-medium text-slate-400">
                {i + 1}
              </span>
              {p.images ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.images}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-400">
                  {p.productName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {p.productName}
                </p>
                <p className="text-xs text-slate-500">{p.quantitySold} sold</p>
              </div>
              <span className="shrink-0 text-sm font-medium text-slate-900">
                ৳{p.revenue.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
