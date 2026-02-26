import { Module } from "@medusajs/framework/utils"
import CarouselSlideModuleService from "./service"

export const CAROUSEL_SLIDE_MODULE = "carouselSlideModuleService"

export default Module(CAROUSEL_SLIDE_MODULE, {
    service: CarouselSlideModuleService,
})
