import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { useCart } from "@/modules/checkout/hooks/user-cart";
import Link from "next/link";

interface Props {
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean;
}

export const CartButton = ({ tenantSlug, productId, isPurchased }: Props) => {
  const cart = useCart(tenantSlug);

  if (isPurchased) {
    return (
      <Button
        variant="elevated"
        className="flex-1 font-medium bg-white"
        asChild
      >
        <Link href={`/library/${productId}`}>View in Library</Link>
      </Button>
    );
  }

  return (
    <Button
      variant="elevated"
      className={cn(
        "flex-1",
        cart.isProductInCart(productId) ? "bg-white" : "bg-pink-400"
      )}
      onClick={() => cart.toggleProduct(productId)}
    >
      {cart.isProductInCart(productId) ? "Remove from Cart" : "Add to Cart"}
    </Button>
  );
};
