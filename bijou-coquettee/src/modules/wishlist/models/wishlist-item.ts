import { model } from "@medusajs/framework/utils"

/**
 * WishlistItem Model
 * Represents an item in a customer's wishlist
 */
const WishlistItem = model.define("wishlist_item", {
    id: model.id().primaryKey(),
    wishlist_id: model.text(),
    product_id: model.text(),
    variant_id: model.text().nullable(),
    added_at: model.dateTime(),
})

export default WishlistItem

