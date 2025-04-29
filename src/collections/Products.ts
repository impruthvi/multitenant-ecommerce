import type { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
    slug: "products",
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
        },
        {
            name: "description",
            type: "textarea",
        },
        {
            name: "price",
            type: "number",
            required: true,
            admin: {
                description: "Price in USD",
            }
        },
        {
            name: "category",
            type: "relationship",
            relationTo: "categories",
            hasMany: false,
        },
        {
            name: "image",
            type: "upload",
            relationTo: "media",
        },
        {
            name: "refundPolicy",
            type: "select",
            options: [
                {
                    label: "30 Days",
                    value: "30-days",
                },
                {
                    label: "14 Days",
                    value: "14-days",
                },
                {
                    label: "7 Days",
                    value: "7-days",
                },
                {
                    label: "3 Days",
                    value: "3-days",
                },
                {
                    label: "1 Day",
                    value: "1-day",
                },
                {
                    label: "No Refund",
                    value: "no-refund",
                },
            ],
            defaultValue: "30-days",
        }
    ]
}