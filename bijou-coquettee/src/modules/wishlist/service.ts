import { MedusaService } from "@medusajs/framework/utils"
import Wishlist from "./models/wishlist"
import WishlistItem from "./models/wishlist-item"

/**
 * WishlistModuleService
 * Handles all wishlist operations including CRUD and business logic
 */
class WishlistModuleService extends MedusaService({
    Wishlist,
    WishlistItem,
}) {
    /**
     * Get or create a wishlist for a customer
     */
    async getOrCreateWishlist(customerId: string) {
        const existingWishlist = await this.listWishlists(
            { customer_id: customerId },
            { take: 1 }
        )

        if (existingWishlist.length > 0) {
            return existingWishlist[0]
        }

        // Create new wishlist
        const [wishlist] = await this.createWishlists([
            {
                customer_id: customerId,
                is_public: false,
                share_token: null,
            },
        ])

        return wishlist
    }

    /**
     * Get wishlist with all items
     */
    async getWishlistWithItems(customerId: string) {
        const wishlist = await this.getOrCreateWishlist(customerId)

        const items = await this.listWishlistItems(
            { wishlist_id: wishlist.id },
            {
                relations: ["product", "variant"],
            }
        )

        return {
            wishlist,
            items,
        }
    }

    /**
     * Add item to wishlist
     */
    async addItemToWishlist(
        customerId: string,
        productId: string,
        variantId?: string
    ) {
        const wishlist = await this.getOrCreateWishlist(customerId)

        // Check if item already exists
        const existingItems = await this.listWishlistItems({
            wishlist_id: wishlist.id,
            product_id: productId,
            variant_id: variantId || null,
        })

        if (existingItems.length > 0) {
            // Item already in wishlist
            return existingItems[0]
        }

        // Add new item
        const [item] = await this.createWishlistItems([
            {
                wishlist_id: wishlist.id,
                product_id: productId,
                variant_id: variantId || null,
                added_at: new Date(),
            },
        ])

        return item
    }

    /**
     * Remove item from wishlist
     */
    async removeItemFromWishlist(wishlistItemId: string) {
        await this.deleteWishlistItems([wishlistItemId])
        return { success: true }
    }

    /**
     * Check if product is in wishlist
     */
    async isProductInWishlist(
        customerId: string,
        productId: string,
        variantId?: string
    ): Promise<boolean> {
        const wishlist = await this.getOrCreateWishlist(customerId)

        const items = await this.listWishlistItems({
            wishlist_id: wishlist.id,
            product_id: productId,
            variant_id: variantId || null,
        })

        return items.length > 0
    }

    /**
     * Generate a share token for public wishlist
     */
    async generateShareToken(customerId: string): Promise<string> {
        const wishlist = await this.getOrCreateWishlist(customerId)

        // Generate unique token
        const token = this.generateUniqueToken()

        // Update wishlist
        await this.updateWishlists([
            {
                id: wishlist.id,
                is_public: true,
                share_token: token,
            },
        ])

        return token
    }

    /**
     * Get shared wishlist by token
     */
    async getSharedWishlist(token: string) {
        const [wishlist] = await this.listWishlists(
            {
                share_token: token,
                is_public: true,
            },
            { take: 1 }
        )

        if (!wishlist) {
            return null
        }

        const items = await this.listWishlistItems(
            { wishlist_id: wishlist.id },
            {
                relations: ["product", "variant"],
            }
        )

        return {
            wishlist,
            items,
        }
    }

    /**
     * Clear all items from wishlist
     */
    async clearWishlist(customerId: string) {
        const wishlist = await this.getOrCreateWishlist(customerId)

        const items = await this.listWishlistItems({
            wishlist_id: wishlist.id,
        })

        const itemIds = items.map((item) => item.id)
        if (itemIds.length > 0) {
            await this.deleteWishlistItems(itemIds)
        }

        return { success: true, deletedCount: itemIds.length }
    }

    /**
     * Generate unique token for sharing
     */
    private generateUniqueToken(): string {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        let token = ""
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return token
    }
}

export default WishlistModuleService

