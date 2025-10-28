import { model } from "@medusajs/framework/utils"

/**
 * Wishlist Model
 * Represents a customer's wishlist
 * Each customer can have one wishlist
 */
const Wishlist = model.define("wishlist", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    is_public: model.boolean().default(false),
    share_token: model.text().nullable(),
})

export default Wishlist

