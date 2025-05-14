import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
    slug: 'tenants',
    admin: {
        useAsTitle: 'slug',
    },
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
            label: "Store Name",
            admin: {
                description: "This is the name of the store (e.g. 'My Store').",
            },
        },
        {
            name: "slug",
            type: "text",
            required: true,
            unique: true,
            index: true,
            admin: {
                description: "This is the slug of the store (e.g. 'my-store.storehub.com').",
            }
        },
        {
            name: "image",
            type: "upload",
            relationTo: "media",
        },
        {
            name: "stripeAccountId",
            type: "text",
            required: true,
            admin: {
                readOnly: true,
            }
        },
        {
            name: "stripeDetailsSubmitted",
            type: "checkbox",
            admin: {
                readOnly: true,
                description: "You cannot create products until you submit your stripe details",
            }
        }
    ],
}
