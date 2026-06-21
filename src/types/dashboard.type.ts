export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export interface DashboardTotals {
  products: number;
  providers: number;
  customers: number;
  orders: number;
  revenue: number;
  averageRating: number;
  reviewCount: number;
}

export interface OrdersByStatus {
  status: OrderStatus;
  count: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  images: string | null;
  quantitySold: number;
  revenue: number;
}

export interface RecentOrder {
  orderId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customer: { id: string; name: string; email: string } | null;
}

export interface RevenuePoint {
  date: string; // YYYY-MM-DD
  revenue: number;
}

export interface DashboardOverview {
  totals: DashboardTotals;
  ordersByStatus: OrdersByStatus[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  revenueTrend: RevenuePoint[];
}
