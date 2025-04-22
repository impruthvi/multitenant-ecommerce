import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category } from "@/payload-types";

export const categoriesRouter = createTRPCRouter({
    getMany: baseProcedure.query(async ({ ctx }) => {

        const data = await ctx.db.find({
            collection: "categories",
            depth: 1, // Populate Subcategories, subcategories.[0] will be a type of Category
            pagination: false,
            where: {
                parent: {
                    exists: false,
                },
            },
            sort: "name",
        });
        const formattedData = data.docs.map((category) => ({
            ...category,
            subcategories: (category.subcategories?.docs ?? []).map((subcategory) => ({
                // Because of depth: 1, we confident subcategories will be a type of Category
                ...(subcategory as Category),
                subcategories: undefined, // Remove subcategories from subcategories
            })),
        }));

        return formattedData;
    }),
});