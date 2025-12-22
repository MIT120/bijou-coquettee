import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import EmailCampaignModuleService from "../../../../modules/email-campaign/service"

/**
 * POST /store/campaigns/check-email
 * Check if email has a subscription code (for checkout auto-apply)
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { email } = req.body as { email: string }

        if (!email) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Email is required",
            })
        }

        const emailCampaignService = req.scope.resolve<EmailCampaignModuleService>(
            "emailCampaignModuleService"
        )

        // Get active campaign
        const campaign = await emailCampaignService.getActiveCampaign()
        if (!campaign) {
            return res.json({ has_code: false })
        }

        // Check for subscription
        const subscription = await emailCampaignService.getSubscriptionByEmail(
            campaign.id,
            email
        )

        if (!subscription) {
            return res.json({ has_code: false })
        }

        // Check if code has been used too many times
        if (subscription.usage_count >= campaign.max_uses_per_code) {
            return res.json({
                has_code: false,
                reason: "Code has reached maximum uses",
            })
        }

        res.json({
            has_code: true,
            discount_code: subscription.discount_code,
            discount_percent: campaign.discount_percent,
        })
    } catch (error) {
        console.error("Error checking email:", error)
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to check email",
        })
    }
}
