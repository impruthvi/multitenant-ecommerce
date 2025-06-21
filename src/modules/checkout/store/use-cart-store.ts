import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface TenantCart {
    productIds: string[]
}

interface CartState {
    tenantCart: Record<string, TenantCart>
    addProduct: (tenantSlug: string, productId: string) => void
    removeProduct: (tenantSlug: string, productId: string) => void
    clearCart: (tenantSlug: string) => void
    clearAllCarts: () => void
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            tenantCart: {},
            addProduct: (tenantSlug, productId) =>
                set((state) => {
                    const cart = state.tenantCart[tenantSlug] || { productIds: [] }
                    if (!cart.productIds.includes(productId)) {
                        cart.productIds.push(productId)
                    }
                    return {
                        tenantCart: {
                            ...state.tenantCart,
                            [tenantSlug]: cart,
                        },
                    }
                }),
            removeProduct: (tenantSlug, productId) =>
                set((state) => {
                    const cart = state.tenantCart[tenantSlug]
                    if (!cart) return state
                    return {
                        tenantCart: {
                            ...state.tenantCart,
                            [tenantSlug]: {
                                ...cart,
                                productIds: cart.productIds.filter((id) => id !== productId)
                            }
                        }
                    }
                }),
            clearCart: (tenantSlug) =>
                set((state) => ({
                    tenantCart: { ...state.tenantCart, [tenantSlug]: { productIds: [] } },
                })),
            clearAllCarts: () => set({ tenantCart: {} }),
        }),
        {
            name: "storehub-cart",
            storage: createJSONStorage(() => localStorage),
        }
    )
)