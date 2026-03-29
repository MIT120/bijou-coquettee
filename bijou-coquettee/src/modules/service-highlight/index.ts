import { Module } from "@medusajs/framework/utils"
import ServiceHighlightModuleService from "./service"

export const SERVICE_HIGHLIGHT_MODULE = "serviceHighlightModuleService"

export default Module(SERVICE_HIGHLIGHT_MODULE, {
    service: ServiceHighlightModuleService,
})
