import z from "zod";
import type { Sort, Where } from "payload";
import { headers as getHeaders } from "next/headers";

import { Category, Media, Tenant } from "@/payload-types";

import { DEFAULT_LIMIT } from "@/constants";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import { sortValues } from "../search-params";
import { TRPCError } from "@trpc/server";

export const productsRouter = createTRPCRouter({

    getOne: baseProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(async ({ ctx, input }) => {

            const headers = await getHeaders();
            const session = await ctx.db.auth({ headers })

            const product = await ctx.db.findByID({
                collection: "products",
                id: input.id,
                depth: 2, // Populate "product.image", "product.tenant", & "product.tenant.image"
            });

            let isPurchased = false;
            if (session.user) {
                const orderData = await ctx.db.find({
                    collection: "orders",
                    where: {
                        and: [
                            {
                                product: {
                                    equals: input.id,
                                },
                            },
                            {
                                user: {
                                    equals: session.user.id,
                                },
                            },
                        ]
                    },
                    limit: 1,
                    pagination: false,
                });
                isPurchased = !!orderData.docs[0];
            }

            if (!product) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Product ${input.id} not found`,
                });
            }

            return {
                ...product,
                isPurchased,
                image: product.image as Media | null,
                tenant: product.tenant as Tenant & { image: Media | null },
            };
        }),
    getMany: baseProcedure
        .input(z.object({
            cursor: z.number().default(1),
            limit: z.number().default(DEFAULT_LIMIT),
            category: z.string().nullable().optional(),
            minPrice: z.string().nullable().optional(),
            maxPrice: z.string().nullable().optional(),
            tags: z.array(z.string()).nullable().optional(),
            sort: z.enum(sortValues).nullable().optional(),
            tenantSlug: z.string().nullable().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const where: Where = {};
            let sort: Sort = "-createdAt";

            if (input.sort == "curated") {
                sort = "-createdAt";
            }

            if (input.sort == "trending") {
                sort = "-createdAt";
            }


            if (input.sort == "hot_and_new") {
                sort = "+createdAt";
            }

            if (input.minPrice && input.maxPrice) {
                where.price = {
                    less_than_equal: input.maxPrice,
                    greater_than_equal: input.minPrice,
                };
            } else if (input.minPrice) {
                where.price = {
                    greater_than_equal: input.minPrice,
                };
            } else if (input.maxPrice) {
                where.price = {
                    less_than_equal: input.maxPrice,
                };
            }

            if (input.tenantSlug) {
                where["tenant.slug"] = {
                    equals: input.tenantSlug,
                };
            }

            if (input.category) {
                const categoriesData = await ctx.db.find({
                    collection: "categories",
                    limit: 1,
                    depth: 1, // Populate Subcategories, subcategories.[0] will be a type of Category
                    pagination: false,
                    where: {
                        slug: {
                            equals: input.category,
                        }
                    }
                });

                const formattedData = categoriesData.docs.map((category) => ({
                    ...category,
                    subcategories: (category.subcategories?.docs ?? []).map((subcategory) => ({
                        // Because of depth: 1, we confident subcategories will be a type of Category
                        ...(subcategory as Category),
                        subcategories: undefined, // Remove subcategories from subcategories
                    })),
                }));

                const subcategoriesSlugs = [];
                const parentCategory = formattedData[0];

                if (parentCategory) {
                    subcategoriesSlugs.push(
                        ...parentCategory.subcategories.map((subcategory) => subcategory.slug)
                    )

                    where["category.slug"] = {
                        in: [parentCategory.slug, ...subcategoriesSlugs],
                    };
                }

            }

            if (input.tags && input.tags.length > 0) {
                where["tags.name"] = {
                    in: input.tags,
                };
            }

            const data = await ctx.db.find({
                collection: "products",
                depth: 2, // Populate "category", "image", "tenant" & "tenant.image"
                where,
                sort,
                limit: input.limit,
                page: input.cursor,
            });

            return {
                ...data,
                docs: data.docs.map((product) => ({
                    ...product,
                    image: product.image as Media | null,
                    tenant: product.tenant as Tenant & { image: Media | null },
                })),
            };
        }),
});