import { Module } from "@medusajs/framework/utils"
import SizeGuideModuleService from "./service"

export const SIZE_GUIDE_MODULE = "sizeGuideModule"

export default Module(SIZE_GUIDE_MODULE, {
    service: SizeGuideModuleService,
})

