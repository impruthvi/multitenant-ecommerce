import z from "zod";

import { Media, Tenant } from "@/payload-types";

import { DEFAULT_LIMIT } from "@/constants";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const libraryRouter = createTRPCRouter({
    getMany: protectedProcedure
        .input(z.object({
            cursor: z.number().default(1),
            limit: z.number().default(DEFAULT_LIMIT),
        }))
        .query(async ({ ctx, input }) => {

            const data = await ctx.db.find({
                collection: "orders",
                depth: 0, // we want just the order IDs
                limit: input.limit,
                page: input.cursor,
                where: {
                    user: {
                        equals: ctx.session.user.id,
                    },
                }
            });

            const productIds = data.docs.map((order) => order.product);

            const productsData = await ctx.db.find({
                collection: "products",
                where: {
                    id: {
                        in: productIds,
                    },
                },
                pagination: false,
            });

            return {
                ...data,
                docs: productsData.docs.map((product) => ({
                    ...product,
                    image: product.image as Media | null,
                    tenant: product.tenant as Tenant & { image: Media | null },
                })),
            };
        }),
});