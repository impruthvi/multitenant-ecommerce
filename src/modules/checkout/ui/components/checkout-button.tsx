import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, generateTenantUrl } from "@/lib/utils";

import { useCart } from "../../hooks/user-cart";

interface CheckoutButtonProps {
  tenantSlug: string;
  className?: string;
  hideIfEmpty?: boolean;
}

export const CheckoutButton = ({
  tenantSlug,
  className,
  hideIfEmpty,
}: CheckoutButtonProps) => {
  const { totalItems } = useCart(tenantSlug);

  if (hideIfEmpty && totalItems === 0) return null;

  return (
    <Button variant="elevated" className={cn("bg-white", className)} asChild>
      <Link href={`${generateTenantUrl(tenantSlug)}/checkout`}>
        <ShoppingCartIcon /> {totalItems > 0 ? totalItems : ""}
      </Link>
    </Button>
  );
};
