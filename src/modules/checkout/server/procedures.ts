import z from "zod";
import { Media, Tenant } from "@/payload-types";
import { TRPCError } from "@trpc/server";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
export const checkoutRouter = createTRPCRouter({
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