import { Module } from "@medusajs/framework/utils"
import EcontShippingModuleService from "./service"

export const ECONT_SHIPPING_MODULE = "econtShippingModuleService"

export default Module(ECONT_SHIPPING_MODULE, {
  service: EcontShippingModuleService,
})

