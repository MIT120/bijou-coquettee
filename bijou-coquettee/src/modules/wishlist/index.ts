import { Module } from "@medusajs/framework/utils"
import WishlistModuleService from "./service"

/**
 * Wishlist Module
 * Provides wishlist functionality for customers
 */
export const WISHLIST_MODULE = "wishlistModuleService"

export default Module(WISHLIST_MODULE, {
    service: WishlistModuleService,
})

