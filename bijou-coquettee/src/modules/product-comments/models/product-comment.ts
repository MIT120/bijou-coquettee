import { model } from "@medusajs/framework/utils"

/**
 * Product Comment Model
 * Stores customer generated comments for storefront display
 */
const ProductComment = model.define("product_comment", {
    id: model.id().primaryKey(),
    product_id: model.text(),
    customer_id: model.text().nullable(),
    author_name: model.text().nullable(),
    author_email: model.text().nullable(),
    content: model.text(),
    status: model
        .enum(["pending", "approved", "rejected"])
        .default("approved"),
    is_public: model.boolean().default(true),
    metadata: model.json().nullable(),
})

export default ProductComment


