"use client";

import { useEffect, useState } from "react";
import { fetchAdminOverview } from "./Api";
import { DashboardOverview } from "@/types/dashboard.type";
import StatCard, { StatCardSkeleton } from "./StartCard";
import RevenueChart from "./RevenueChart";
import OrdersStatusCard from "./OrderssTatusCard";
import RecentOrdersTable from "./RecentorDerstable";
import TopProductsCard from "./TopprodutScard";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAdminOverview()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Admin dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A snapshot of products, orders, and revenue.
          </p>
        </header>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {loading || !data ? (
            Array.from({ length: 6 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          ) : (
            <>
              <StatCard
                label="Revenue"
                value={`৳${data.totals.revenue.toFixed(2)}`}
                hint="Excludes cancelled"
              />
              <StatCard label="Orders" value={String(data.totals.orders)} />
              <StatCard label="Products" value={String(data.totals.products)} />
              <StatCard
                label="Providers"
                value={String(data.totals.providers)}
              />
              <StatCard
                label="Customers"
                value={String(data.totals.customers)}
              />
              <StatCard
                label="Avg rating"
                value={
                  data.totals.reviewCount > 0
                    ? data.totals.averageRating.toFixed(1)
                    : "—"
                }
                hint={`${data.totals.reviewCount} reviews`}
              />
            </>
          )}
        </div>

        {!loading && data && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RevenueChart points={data.revenueTrend} />
              </div>
              <OrdersStatusCard data={data.ordersByStatus} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentOrdersTable orders={data.recentOrders} />
              </div>
              <TopProductsCard products={data.topProducts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
