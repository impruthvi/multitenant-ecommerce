import z from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import type { Where } from "payload";
import { Category } from "@/payload-types";

export const productsRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(z.object({
            category: z.string().nullable().optional(),
            minPrice: z.string().nullable().optional(),
            maxPrice: z.string().nullable().optional(),
            tags: z.array(z.string()).nullable().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const where: Where = {};

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
                depth: 1, // Populate "category" & "image"
                where
            });

            return data;
        }),
});