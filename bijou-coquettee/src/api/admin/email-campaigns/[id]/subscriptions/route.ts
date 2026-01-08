import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import EmailCampaignModuleService from "../../../../../modules/email-campaign/service"

/**
 * GET /admin/email-campaigns/:id/subscriptions
 * List subscriptions for a campaign with pagination
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const { offset = "0", limit = "50" } = req.query as {
            offset?: string
            limit?: string
        }

        const emailCampaignService = req.scope.resolve<EmailCampaignModuleService>(
            "emailCampaignModuleService"
        )

        // Check campaign exists
        try {
            await emailCampaignService.retrieveEmailCampaign(id)
        } catch {
            return res.status(404).json({
                error: "Not Found",
                message: "Campaign not found",
            })
        }

        const subscriptions = await emailCampaignService.listCampaignSubscriptions(
            id,
            parseInt(offset, 10),
            parseInt(limit, 10)
        )

        const stats = await emailCampaignService.getCampaignStats(id)

        res.json({
            subscriptions,
            stats,
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
        })
    } catch (error) {
        console.error("Error listing subscriptions:", error)
        res.status(500).json({ error: "Failed to list subscriptions" })
    }
}
