import { model } from "@medusajs/framework/utils"

/**
 * EmailCampaign Model
 * Represents a discount campaign for email subscriptions
 */
const EmailCampaign = model.define("email_campaign", {
    id: model.id().primaryKey(),
    name: model.text(),
    code_prefix: model.text(),
    discount_percent: model.number(),
    start_date: model.dateTime(),
    end_date: model.dateTime(),
    is_active: model.boolean().default(true),
    popup_title: model.text().nullable(),
    popup_description: model.text().nullable(),
    max_uses_per_code: model.number().default(1),
    // Banner display settings
    banner_enabled: model.boolean().default(false),
    banner_text: model.text().nullable(),
    banner_cta_text: model.text().nullable(),
    banner_cta_link: model.text().nullable(),
    banner_bg_color: model.text().nullable(), // Hex color or gradient name
})

export default EmailCampaign