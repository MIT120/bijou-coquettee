"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import { Wishlist } from "@lib/data/wishlist"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { formatAmount } from "@lib/util/prices"
import { Trash } from "@medusajs/icons"
import { useState } from "react"

type WishlistTemplateProps = {
  wishlist: Wishlist | null
}

export default function WishlistTemplate({
  wishlist: initialWishlist,
}: WishlistTemplateProps) {
  const { items, removeFromWishlist, clearWishlist, refreshWishlist } =
    useWishlist()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear your entire wishlist?")) {
      return
    }

    setIsClearing(true)
    await clearWishlist()
    await refreshWishlist()
    setIsClearing(false)
  }

  const handleRemove = async (itemId: string) => {
    await removeFromWishlist(itemId)
  }

  if (!items || items.length === 0) {
    return (
      <div className="w-full" data-testid="wishlist-page-wrapper">
        <div className="mb-8 flex flex-col gap-y-4">
          <h1 className="text-2xl-semi">Wishlist</h1>
          <p className="text-base-regular">
            Your wishlist is empty. Start adding items you love!
          </p>
        </div>

        <div>
          <LocalizedClientLink href="/store">
            <Button variant="secondary" className="w-full lg:w-auto">
              Continue shopping
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full" data-testid="wishlist-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl-semi">Wishlist</h1>
          <Button
            variant="transparent"
            onClick={handleClearAll}
            disabled={isClearing}
            className="text-ui-fg-subtle hover:text-ui-fg-base"
          >
            Clear all ({items.length})
          </Button>
        </div>
        <p className="text-base-regular">
          {items.length} {items.length === 1 ? "item" : "items"} saved for later
        </p>
      </div>

      <div className="flex flex-col gap-y-4">
        {items.map((item) => {
          const product = item.product
          const variant = item.variant || product?.variants?.[0]

          if (!product) {
            return null
          }

          // Get price from variant or product
          const price =
            variant?.calculated_price?.calculated_amount ||
            product.calculated_price?.calculated_amount

          return (
            <div
              key={item.id}
              className="grid grid-cols-[122px_1fr] gap-x-4 py-4 border-b border-gray-200"
              data-testid="wishlist-item"
            >
              <LocalizedClientLink
                href={`/products/${product.handle}`}
                className="w-full"
              >
                <Thumbnail
                  thumbnail={product.thumbnail}
                  images={product.images}
                  size="square"
                />
              </LocalizedClientLink>

              <div className="flex flex-col justify-between">
                <div className="flex flex-col flex-1">
                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    className="text-base-regular hover:text-ui-fg-base"
                  >
                    <span className="font-medium">{product.title}</span>
                  </LocalizedClientLink>

                  {variant && variant.title !== "Default" && (
                    <span className="text-sm text-ui-fg-subtle mt-1">
                      {variant.title}
                    </span>
                  )}

                  {price && (
                    <span className="text-base-semi mt-2">
                      {formatAmount({
                        amount: price,
                        region: {
                          currency_code:
                            variant?.calculated_price?.currency_code ||
                            product.calculated_price?.currency_code ||
                            "usd",
                        } as any,
                      })}
                    </span>
                  )}
                </div>

                <div className="flex gap-x-2 mt-4">
                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    className="flex-1"
                  >
                    <Button variant="secondary" className="w-full">
                      View Product
                    </Button>
                  </LocalizedClientLink>

                  <Button
                    variant="transparent"
                    onClick={() => handleRemove(item.id)}
                    className="p-2 hover:bg-ui-bg-subtle"
                    aria-label="Remove from wishlist"
                  >
                    <Trash className="text-ui-fg-subtle" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8">
        <LocalizedClientLink href="/store">
          <Button variant="secondary" className="w-full lg:w-auto">
            Continue shopping
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
