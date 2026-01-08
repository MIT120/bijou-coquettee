import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import EmailCampaignModuleService from "../../../../modules/email-campaign/service"

/**
 * GET /admin/email-campaigns/:id
 * Get campaign details with stats
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params

        const emailCampaignService = req.scope.resolve<EmailCampaignModuleService>(
            "emailCampaignModuleService"
        )

        let campaign
        try {
            campaign = await emailCampaignService.retrieveEmailCampaign(id)
        } catch {
            return res.status(404).json({
                error: "Not Found",
                message: "Campaign not found",
            })
        }

        const stats = await emailCampaignService.getCampaignStats(id)

        res.json({ campaign: { ...campaign, stats } })
    } catch (error) {
        console.error("Error fetching campaign:", error)
        res.status(500).json({ error: "Failed to fetch campaign" })
    }
}

/**
 * PATCH /admin/email-campaigns/:id
 * Update campaign
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params
        const updates = req.body as {
            name?: string
            code_prefix?: string
            discount_percent?: number
            start_date?: string
            end_date?: string
            is_active?: boolean
            popup_title?: string | null
            popup_description?: string | null
            max_uses_per_code?: number
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

        // Validate discount_percent if provided
        if (updates.discount_percent !== undefined) {
            if (updates.discount_percent < 1 || updates.discount_percent > 100) {
                return res.status(400).json({
                    error: "Bad Request",
                    message: "discount_percent must be between 1 and 100",
                })
            }
        }

        // Build update object
        const updateData: Record<string, unknown> = { id }

        if (updates.name !== undefined) updateData.name = updates.name
        if (updates.code_prefix !== undefined) {
            updateData.code_prefix = updates.code_prefix.toUpperCase().replace(/[^A-Z0-9]/g, "")
        }
        if (updates.discount_percent !== undefined) updateData.discount_percent = updates.discount_percent
        if (updates.start_date !== undefined) updateData.start_date = new Date(updates.start_date)
        if (updates.end_date !== undefined) updateData.end_date = new Date(updates.end_date)
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active
        if (updates.popup_title !== undefined) updateData.popup_title = updates.popup_title
        if (updates.popup_description !== undefined) updateData.popup_description = updates.popup_description
        if (updates.max_uses_per_code !== undefined) updateData.max_uses_per_code = updates.max_uses_per_code

        await emailCampaignService.updateEmailCampaigns([updateData])

        const campaign = await emailCampaignService.retrieveEmailCampaign(id)
        const stats = await emailCampaignService.getCampaignStats(id)

        res.json({ campaign: { ...campaign, stats } })
    } catch (error) {
        console.error("Error updating campaign:", error)
        res.status(500).json({ error: "Failed to update campaign" })
    }
}

/**
 * DELETE /admin/email-campaigns/:id
 * Delete campaign (soft delete)
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { id } = req.params

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

        await emailCampaignService.deleteEmailCampaigns([id])

        res.json({ success: true, id })
    } catch (error) {
        console.error("Error deleting campaign:", error)
        res.status(500).json({ error: "Failed to delete campaign" })
    }
}
