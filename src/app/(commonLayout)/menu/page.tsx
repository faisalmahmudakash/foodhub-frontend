import React from "react";
import AllProductsPage from "./allProduct/page";
import CartItemPage from "./cartItem/page";

export default function MenuPage() {
  return (
    <div>
      <div className="">
        <AllProductsPage />
        <CartItemPage />
      </div>
    </div>
  );
}
