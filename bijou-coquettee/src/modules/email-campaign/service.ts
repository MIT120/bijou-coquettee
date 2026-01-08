import { MedusaService } from "@medusajs/framework/utils"
import EmailCampaign from "./models/email-campaign"
import EmailSubscription from "./models/email-subscription"

/**
 * EmailCampaignModuleService
 * Handles email campaign and subscription operations
 */
class EmailCampaignModuleService extends MedusaService({
    EmailCampaign,
    EmailSubscription,
}) {
    /**
     * Get currently active campaign (within date range and active)
     */
    async getActiveCampaign() {
        const now = new Date()
        const campaigns = await this.listEmailCampaigns(
            {
                is_active: true,
                start_date: { $lte: now },
                end_date: { $gte: now },
            },
            { take: 1 }
        )
        return campaigns[0] || null
    }

    /**
     * Check if email is already subscribed to a campaign
     */
    async getSubscriptionByEmail(campaignId: string, email: string) {
        const subscriptions = await this.listEmailSubscriptions(
            {
                campaign_id: campaignId,
                email: email.toLowerCase().trim(),
            },
            { take: 1 }
        )
        return subscriptions[0] || null
    }

    /**
     * Get subscription by discount code
     */
    async getSubscriptionByCode(code: string) {
        const subscriptions = await this.listEmailSubscriptions(
            { discount_code: code.toUpperCase() },
            { take: 1 }
        )
        return subscriptions[0] || null
    }

    /**
     * Create a new subscription with unique code
     */
    async createSubscription(
        campaignId: string,
        email: string,
        codePrefix: string
    ) {
        const normalizedEmail = email.toLowerCase().trim()

        // Generate unique code with retry logic
        let discountCode: string
        let attempts = 0
        const maxAttempts = 10

        do {
            const uniquePart = this.generateUniqueCode()
            discountCode = `${codePrefix}-${uniquePart}`

            // Check if code already exists
            const existing = await this.getSubscriptionByCode(discountCode)
            if (!existing) break

            attempts++
        } while (attempts < maxAttempts)

        if (attempts >= maxAttempts) {
            throw new Error("Failed to generate unique discount code")
        }

        const [subscription] = await this.createEmailSubscriptions([
            {
                campaign_id: campaignId,
                email: normalizedEmail,
                discount_code: discountCode,
                subscribed_at: new Date(),
                usage_count: 0,
            },
        ])

        return subscription
    }

    /**
     * Mark a code as used
     */
    async markCodeUsed(subscriptionId: string) {
        const subscription = await this.retrieveEmailSubscription(subscriptionId)

        await this.updateEmailSubscriptions([
            {
                id: subscriptionId,
                used_at: subscription.used_at || new Date(),
                usage_count: (subscription.usage_count || 0) + 1,
            },
        ])
    }

    /**
     * List subscriptions for a campaign with pagination
     */
    async listCampaignSubscriptions(
        campaignId: string,
        offset: number = 0,
        limit: number = 50
    ) {
        return this.listEmailSubscriptions(
            { campaign_id: campaignId },
            {
                skip: offset,
                take: limit,
                order: { subscribed_at: "DESC" },
            }
        )
    }

    /**
     * Get subscription stats for a campaign
     */
    async getCampaignStats(campaignId: string) {
        const allSubs = await this.listEmailSubscriptions({
            campaign_id: campaignId,
        })

        const total = allSubs.length
        const used = allSubs.filter((s) => s.used_at !== null).length

        return {
            total_subscriptions: total,
            codes_used: used,
            conversion_rate: total > 0 ? parseFloat(((used / total) * 100).toFixed(1)) : 0,
        }
    }

    /**
     * Generate unique 6-character alphanumeric code
     * Excludes ambiguous characters (0, O, I, l, 1)
     */
    private generateUniqueCode(): string {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        let code = ""
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
    }
}

export default EmailCampaignModuleService