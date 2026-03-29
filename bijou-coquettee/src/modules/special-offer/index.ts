import { Module } from "@medusajs/framework/utils"
import SpecialOfferModuleService from "./service"

export const SPECIAL_OFFER_MODULE = "specialOfferModuleService"

export default Module(SPECIAL_OFFER_MODULE, {
    service: SpecialOfferModuleService,
})
