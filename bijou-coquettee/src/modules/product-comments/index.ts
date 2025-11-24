import { Module } from "@medusajs/framework/utils"
import ProductCommentsModuleService from "./service"

export const PRODUCT_COMMENTS_MODULE = "productCommentsModule"

export default Module(PRODUCT_COMMENTS_MODULE, {
    service: ProductCommentsModuleService,
})


