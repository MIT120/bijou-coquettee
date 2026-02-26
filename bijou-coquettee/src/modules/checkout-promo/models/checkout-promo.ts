import { model } from "@medusajs/framework/utils"

const CheckoutPromo = model.define("checkout_promo", {
    id: model.id().primaryKey(),
    product_id: model.text(),
    variant_id: model.text(),
    heading: model.text().nullable(),
    description: model.text().nullable(),
    discount_percent: model.number().nullable(),
    promotion_code: model.text().nullable(),
    promotion_id: model.text().nullable(),
    is_active: model.boolean().default(false),
})

export default CheckoutPromo
