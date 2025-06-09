import z from "zod";
import type Stripe from "stripe";

import { Media, Tenant } from "@/payload-types";
import { TRPCError } from "@trpc/server";

import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { CheckoutMetadata, ProductMetadata } from "../types";
import { stripe } from "@/lib/stripe";
export const checkoutRouter = createTRPCRouter({
    purchase: protectedProcedure
        .input(z.object({
            productIds: z.array(z.string()).min(1, "You must select at least one product to purchase."),
            tenantSlug: z.string().min(1),
        })).mutation(async ({ ctx, input }) => {
            const products = await ctx.db.find({
                collection: "products",
                depth: 2,
                where: {
                    and: [
                        {
                            id: {
                                in: input.productIds
                            }
                        },
                        {
                            'tenant.slug': {
                                equals: input.tenantSlug
                            }
                        }
                    ]
                }
            });

            if (products.totalDocs !== input.productIds.length) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Some products not found",
                });
            }

            const tenantData = await ctx.db.find({
                collection: "tenants",
                limit: 1,
                pagination: false,
                where: {
                    slug: {
                        equals: input.tenantSlug
                    }
                }
            });

            const tenant = tenantData.docs[0];

            if (!tenant) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tenant not found",
                });
            }

            // TODO: Throw error if stripe details not submitted

            const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
                products.docs.map((product) => ({
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: product.name,
                            metadata: {
                                stripeAccountId: tenant.stripeAccountId,
                                id: product.id,
                                name: product.name,
                                price: product.price,
                            } as ProductMetadata
                        },
                        unit_amount: Number(product.price) * 100, // Stripe expects amount in cents
                    },
                    quantity: 1, // Assuming quantity is 1 for each product
                }));

            const checkout = await stripe.checkout.sessions.create({
                customer_email: ctx.session.user.email,
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${input.tenantSlug}/checkout?success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenants/${input.tenantSlug}/checkout?cancel=true`,
                mode: "payment",
                line_items: lineItems,
                invoice_creation: {
                    enabled: true,
                },
                metadata: {
                    userId: ctx.session.user.id,
                } as CheckoutMetadata,
            });

            if (!checkout.url) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create checkout session",
                });
            }

            return { url: checkout.url };

        }),
    getProducts: baseProcedure
        .input(z.object({
            ids: z.array(z.string())
        }))
        .query(async ({ ctx, input }) => {
            const data = await ctx.db.find({
                collection: "products",
                depth: 2,
                where: {
                    id: {
                        in: input.ids
                    }
                }
            });

            if (data.totalDocs !== input.ids.length) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Products not found",
                })
            }

            const totalPrice = data.docs.reduce((total, product) => {
                const price = Number(product.price);
                return total + (isNaN(price) ? 0 : price);
            }, 0);

            return {
                ...data,
                totalPrice,
                docs: data.docs.map((product) => ({
                    ...product,
                    image: product.image as Media | null,
                    tenant: product.tenant as Tenant & { image: Media | null },
                })),
            };
        }),
});