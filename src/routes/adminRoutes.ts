import { Route } from "@/types";

export const adminRoutes: Route[] = [
  {
    title: "Admin Dashboard",
    url: "#",
    items: [
      {
        title: "Dashboard",
        url: "/admin-dashboard",
      },
    ],
  },
  {
    title: "Product Management",
    url: "#",
    items: [
      {
        title: "Product",
        url: "/admin-dashboard/product",
      },
      {
        title: "Orders",
        url: "/admin-dashboard/order",
      },
    ],
  },
];
