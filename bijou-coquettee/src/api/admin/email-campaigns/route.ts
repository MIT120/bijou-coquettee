import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import EmailCampaignModuleService from "../../../modules/email-campaign/service"

/**
 * GET /admin/email-campaigns
 * List all campaigns with stats
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const emailCampaignService = req.scope.resolve<EmailCampaignModuleService>(
            "emailCampaignModuleService"
        )

        const campaigns = await emailCampaignService.listEmailCampaigns(
            {},
            { order: { created_at: "DESC" } }
        )

        // Get stats for each campaign
        const campaignsWithStats = await Promise.all(
            campaigns.map(async (campaign) => {
                const stats = await emailCampaignService.getCampaignStats(campaign.id)
                return { ...campaign, stats }
            })
        )

        res.json({ campaigns: campaignsWithStats })
    } catch (error) {
        console.error("Error listing campaigns:", error)
        res.status(500).json({ error: "Failed to list campaigns" })
    }
}

/**
 * POST /admin/email-campaigns
 * Create a new campaign
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const {
            name,
            code_prefix,
            discount_percent,
            start_date,
            end_date,
            popup_title,
            popup_description,
            max_uses_per_code = 1,
            is_active = true,
        } = req.body as {
            name: string
            code_prefix: string
            discount_percent: number
            start_date: string
            end_date: string
            popup_title?: string
            popup_description?: string
            max_uses_per_code?: number
            is_active?: boolean
        }

        if (!name || !code_prefix || !discount_percent || !start_date || !end_date) {
            return res.status(400).json({
                error: "Bad Request",
                message: "name, code_prefix, discount_percent, start_date, and end_date are required",
            })
        }

        if (discount_percent < 1 || discount_percent > 100) {
            return res.status(400).json({
                error: "Bad Request",
                message: "discount_percent must be between 1 and 100",
            })
        }

        const emailCampaignService = req.scope.resolve<EmailCampaignModuleService>(
            "emailCampaignModuleService"
        )

        const [campaign] = await emailCampaignService.createEmailCampaigns([
            {
                name,
                code_prefix: code_prefix.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                discount_percent,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                is_active,
                popup_title: popup_title || null,
                popup_description: popup_description || null,
                max_uses_per_code,
            },
        ])

        res.status(201).json({ campaign })
    } catch (error) {
        console.error("Error creating campaign:", error)
        res.status(500).json({ error: "Failed to create campaign" })
    }
}
