import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import EmailCampaignModuleService from "../../../../modules/email-campaign/service"

/**
 * POST /store/campaigns/subscribe
 * Subscribe email and generate unique discount code
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { email, campaign_id } = req.body as {
            email: string
            campaign_id: string
        }

        if (!email || !campaign_id) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Email and campaign_id are required",
            })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Invalid email format",
            })
        }

        const emailCampaignService = req.scope.resolve<EmailCampaignModuleService>(
            "emailCampaignModuleService"
        )

        // Check if campaign exists and is active
        let campaign
        try {
            campaign = await emailCampaignService.retrieveEmailCampaign(campaign_id)
        } catch {
            return res.status(404).json({
                error: "Not Found",
                message: "Campaign not found",
            })
        }

        if (!campaign.is_active) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Campaign is not active",
            })
        }

        // Check date range
        const now = new Date()
        if (now < new Date(campaign.start_date) || now > new Date(campaign.end_date)) {
            return res.status(400).json({
                error: "Bad Request",
                message: "Campaign is not currently running",
            })
        }

        // Check if already subscribed
        const existingSubscription = await emailCampaignService.getSubscriptionByEmail(
            campaign_id,
            email
        )

        if (existingSubscription) {
            // Return existing code
            return res.json({
                success: true,
                already_subscribed: true,
                discount_code: existingSubscription.discount_code,
                discount_percent: campaign.discount_percent,
            })
        }

        // Create new subscription
        const subscription = await emailCampaignService.createSubscription(
            campaign_id,
            email,
            campaign.code_prefix
        )

        // Create a Medusa promotion for this code so it works at checkout
        try {
            const promotionService = req.scope.resolve(Modules.PROMOTION)

            const promotion = await promotionService.createPromotions({
                code: subscription.discount_code,
                type: "standard",
                status: "active",
                is_automatic: false,
                application_method: {
                    type: "percentage",
                    value: campaign.discount_percent,
                    target_type: "order",
                    allocation: "across",
                },
                rules: [],
            })

            // Update subscription with promotion ID
            if (promotion && promotion.id) {
                await emailCampaignService.updateEmailSubscriptions([{
                    id: subscription.id,
                    promotion_id: promotion.id,
                }])
            }
        } catch (promoError) {
            console.error("Failed to create Medusa promotion:", promoError)
            // Continue anyway - the subscription was created
        }

        res.json({
            success: true,
            already_subscribed: false,
            discount_code: subscription.discount_code,
            discount_percent: campaign.discount_percent,
        })
    } catch (error) {
        console.error("Error subscribing to campaign:", error)
        res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to subscribe",
        })
    }
}
