import { Module } from "@medusajs/framework/utils"
import CmsPageModuleService from "./service"

export const CMS_PAGE_MODULE = "cmsPageModuleService"

export default Module(CMS_PAGE_MODULE, {
    service: CmsPageModuleService,
})
