import { Route } from "@/types";

export const providerRoutes: Route[] = [
  {
    title: "Provider Dashboard",
    url: "#",
    items: [
      {
        title: "Dashboard",
        url: "/provider-dashboard",
      },
    ],
  },
  {
    title: "Provider Dashboard",
    url: "#",
    items: [
      {
        title: "Orders",
        url: "/provider-dashboard/orders",
      },
      {
        title: "Products",
        url: "/provider-dashboard/products",
      },
      {
        title: "Reviews",
        url: "/provider-dashboard/reviews",
      },
    ],
  },
];
