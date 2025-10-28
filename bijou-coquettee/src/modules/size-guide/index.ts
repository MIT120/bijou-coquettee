import { Module } from "@medusajs/framework/utils"
import SizeGuideService from "./services/size-guide"

export const SIZE_GUIDE_MODULE = "sizeGuideModule"

export default Module(SIZE_GUIDE_MODULE, {
    service: SizeGuideService,
})

