import { model } from "@medusajs/framework/utils"

/**
 * EmailSubscription Model
 * Represents a customer email subscription with unique discount code
 */
const EmailSubscription = model.define("email_subscription", {
    id: model.id().primaryKey(),
    campaign_id: model.text(),
    email: model.text(),
    discount_code: model.text(),
    promotion_id: model.text().nullable(),
    subscribed_at: model.dateTime(),
    used_at: model.dateTime().nullable(),
    usage_count: model.number().default(0),
})

export default EmailSubscription