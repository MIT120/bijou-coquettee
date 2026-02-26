import { Module } from "@medusajs/framework/utils"
import CheckoutPromoModuleService from "./service"

export const CHECKOUT_PROMO_MODULE = "checkoutPromoModuleService"

export default Module(CHECKOUT_PROMO_MODULE, {
    service: CheckoutPromoModuleService,
})
