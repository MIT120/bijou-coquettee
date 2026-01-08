import { Module } from "@medusajs/framework/utils"
import EmailCampaignModuleService from "./service"

/**
 * Email Campaign Module
 * Provides email subscription campaign functionality
 */
export const EMAIL_CAMPAIGN_MODULE = "emailCampaignModuleService"

export default Module(EMAIL_CAMPAIGN_MODULE, {
    service: EmailCampaignModuleService,
})