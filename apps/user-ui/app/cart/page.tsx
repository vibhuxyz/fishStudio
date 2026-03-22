import { CartPageClient } from "@/components/shared/cart-page-client";

export const metadata = {
  title: "My Cart - Fish Studio",
  description: "Review your cart and proceed to checkout",
};

export default function CartPage() {
  return <CartPageClient />;
}
