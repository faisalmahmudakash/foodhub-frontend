export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItemAddon = {
  orderItemAddonId: string;
  itemId: string;
  addonId: string;
  addonName: string;
  price: number;
};

export type OrderItemProduct = {
  productId: string;
  productName: string;
  images: string | null;
  provider?: {
    id: string;
    name: string;
  };
};

export type OrderItem = {
  itemId: string;
  orderId: string;
  productId: string;
  product: OrderItemProduct;
  quantity: number | null;
  unitPrice: number | null;
  subtotal: number | null;
  orderItemAddons: OrderItemAddon[];
};

export type OrderCustomer = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  defaultAddress?: string | null;
};

export type Order = {
  orderId: string;
  customerId: string;
  customer: OrderCustomer;
  totalAmount: number | null;
  status: OrderStatus;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
};
