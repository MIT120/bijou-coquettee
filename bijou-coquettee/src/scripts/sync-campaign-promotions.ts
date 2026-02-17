/**
 * Script to create Medusa promotions for existing email campaign subscriptions
 * Run with: npx medusa exec ./src/scripts/sync-campaign-promotions.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type EmailCampaignService = {
    listEmailCampaigns: (filter: Record<string, unknown>) => Promise<Array<Record<string, any>>>
    listEmailSubscriptions: (filter: Record<string, unknown>) => Promise<Array<Record<string, any>>>
    updateEmailSubscriptions: (data: Array<Record<string, unknown>>) => Promise<void>
}

export default async function syncCampaignPromotions({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const emailCampaignService = container.resolve("emailCampaignModuleService") as EmailCampaignService
    const promotionService = container.resolve(Modules.PROMOTION)

    logger.info("Starting campaign promotions sync...")

    try {
        // Get all campaigns
        const campaigns = await emailCampaignService.listEmailCampaigns({})
        logger.info(`Found ${campaigns.length} campaigns`)

        for (const campaign of campaigns) {
            logger.info(`Processing campaign: ${campaign.name} (${campaign.code_prefix})`)

            // Get all subscriptions for this campaign
            const subscriptions = await emailCampaignService.listEmailSubscriptions({
                campaign_id: campaign.id,
            })

            logger.info(`  Found ${subscriptions.length} subscriptions`)

            for (const subscription of subscriptions) {
                // Skip if already has a promotion
                if (subscription.promotion_id) {
                    logger.info(`  Skipping ${subscription.discount_code} - already has promotion`)
                    continue
                }

                // Check if promotion already exists with this code
                try {
                    const existingPromotions = await promotionService.listPromotions({
                        code: subscription.discount_code,
                    })

                    if (existingPromotions.length > 0) {
                        // Link existing promotion
                        await emailCampaignService.updateEmailSubscriptions([{
                            id: subscription.id,
                            promotion_id: existingPromotions[0].id,
                        }])
                        logger.info(`  Linked existing promotion for ${subscription.discount_code}`)
                        continue
                    }
                } catch {
                    // Promotion doesn't exist, create it
                }

                // Create new promotion
                try {
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
                    await emailCampaignService.updateEmailSubscriptions([{
                        id: subscription.id,
                        promotion_id: promotion.id,
                    }])

                    logger.info(`  Created promotion for ${subscription.discount_code}`)
                } catch (error) {
                    logger.error(`  Failed to create promotion for ${subscription.discount_code}:`, error)
                }
            }
        }

        logger.info("Campaign promotions sync completed!")
    } catch (error) {
        logger.error("Error syncing campaign promotions:", error)
        throw error
    }
}
