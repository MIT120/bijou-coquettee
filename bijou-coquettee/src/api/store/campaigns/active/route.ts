import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import EmailCampaignModuleService from "../../../../modules/email-campaign/service"

/**
 * GET /store/campaigns/active
 * Get the currently active campaign for popup and banner display
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const emailCampaignService = req.scope.resolve<EmailCampaignModuleService>(
            "emailCampaignModuleService"
        )

        const campaign = await emailCampaignService.getActiveCampaign()

        if (!campaign) {
            return res.json({ campaign: null })
        }

        res.json({
            campaign: {
                id: campaign.id,
                name: campaign.name,
                discount_percent: campaign.discount_percent,
                // Popup settings
                popup_title: campaign.popup_title,
                popup_description: campaign.popup_description,
                // Banner settings
                end_date: campaign.end_date,
                banner_enabled: campaign.banner_enabled ?? false,
                banner_text: campaign.banner_text,
                banner_cta_text: campaign.banner_cta_text,
                banner_cta_link: campaign.banner_cta_link,
                banner_bg_color: campaign.banner_bg_color,
            },
        })
    } catch (error) {
        console.error("Error fetching active campaign:", error)
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to fetch active campaign",
        })
    }
}
