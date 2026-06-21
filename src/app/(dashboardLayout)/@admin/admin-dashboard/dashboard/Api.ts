import { DashboardOverview } from "@/types/dashboard.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchAdminOverview(): Promise<DashboardOverview> {
  const res = await fetch(`${API_BASE_URL}/dashboard/admin-overview`, {
    credentials: "include",
  });

  const body: ApiResponse<DashboardOverview> = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.message || "Failed to load dashboard");
  }

  return body.data;
}
