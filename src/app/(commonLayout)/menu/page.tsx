import AllProductsPage from "./allProduct/page";
import CartItemPage from "./cartItem/page";

export default function MenuPage() {
  return (
   <div className="bg-[#f5f1eb]">
     <div className="container mx-auto px-4 py-6 ">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <AllProductsPage />
        <CartItemPage />
      </div>
    </div>
   </div>
  );
}
