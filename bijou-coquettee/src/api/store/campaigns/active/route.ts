import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import EmailCampaignModuleService from "../../../../modules/email-campaign/service"

/**
 * GET /store/campaigns/active
 * Get the currently active campaign for popup display
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
                popup_title: campaign.popup_title,
                popup_description: campaign.popup_description,
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
