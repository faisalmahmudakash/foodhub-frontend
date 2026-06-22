"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Clock3,
  Wallet,
  MessageSquare,
  Star,
} from "lucide-react";
import { fetchMyStats } from "@/helpers/providerApi";
import { fmt } from "@/helpers/cartHelpers";
import type { ProviderStats } from "@/types/provider.type";

export default function ProviderDashboardPage() {
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3.5 px-4 py-10 text-[#7a6a55]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e0d5c4] border-t-[#e85d04]" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center px-4 py-10 text-[#e85d04]">
        ⚠️ {error || "Failed to load dashboard"}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      href: "/provider-dashboard/products",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      href: "/provider-dashboard/orders",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock3,
      href: "/provider-dashboard/orders",
    },
    {
      label: "Total Revenue",
      value: fmt(stats.totalRevenue),
      icon: Wallet,
      href: "/provider-dashboard/orders",
    },
    {
      label: "Total Reviews",
      value: stats.totalReviews,
      icon: MessageSquare,
      href: "/provider-dashboard/reviews",
    },
    {
      label: "Average Rating",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      href: "/provider-dashboard/reviews",
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-5 text-xl font-extrabold text-[#1a1208]">
        Provider Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 rounded-2xl border border-[#ede5d8] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fef4ec] text-[#e85d04]">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#a08060]">
                {label}
              </p>
              <p className="text-xl font-extrabold text-[#1a1208]">{value}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
