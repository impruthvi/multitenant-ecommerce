import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "../store/use-cart-store";

export const useCart = (tenantSlug: string) => {

    const addProduct = useCartStore((state) => state.addProduct);
    const clearCart = useCartStore((state) => state.clearCart);
    const removeProduct = useCartStore((state) => state.removeProduct);
    const clearAllCarts = useCartStore((state) => state.clearAllCarts);

    const productIds = useCartStore(
        useShallow((state) => state.tenantCart[tenantSlug]?.productIds || [])
    );

    const toggleProduct = useCallback(
        (productId: string) => {
            if (productIds.includes(productId)) {
                removeProduct(tenantSlug, productId);
            } else {
                addProduct(tenantSlug, productId);
            }
        },
        [addProduct, removeProduct, productIds, tenantSlug]
    );

    const isProductInCart = useCallback((productId: string) => {
        return productIds.includes(productId);
    }, [productIds]);

    const clearTenantCart = useCallback(() => {
        clearCart(tenantSlug);
    }, [clearCart, tenantSlug]);

    const handleAddProduct = useCallback((productId: string) => {
        if (!productIds.includes(productId)) {
            addProduct(tenantSlug, productId);
        }
    }, [addProduct, productIds, tenantSlug]);

    const handleRemoveProduct = useCallback((productId: string) => {
        if (productIds.includes(productId)) {
            removeProduct(tenantSlug, productId);
        }
    }, [removeProduct, productIds, tenantSlug]);

    return {
        productIds,
        addProduct: handleAddProduct,
        removeProduct: handleRemoveProduct,
        clearCart: clearTenantCart,
        clearAllCarts,
        toggleProduct,
        isProductInCart,
        totalItems: productIds.length,
    }
}