"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import SizeGuideButton from "@modules/products/components/size-guide-button"
import WishlistButton from "@modules/products/components/wishlist-button"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    if (!selectedVariant) {
      return false
    }

    // If we don't manage inventory, we can always add to cart
    if (selectedVariant.manage_inventory === false) {
      return true
    }

    // If manage_inventory is null/undefined, default to allowing purchase
    // (This handles cases where inventory management isn't configured)
    if (selectedVariant.manage_inventory === null || selectedVariant.manage_inventory === undefined) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant.allow_backorder === true) {
      return true
    }

    // If manage_inventory is true, check inventory quantity
    if (selectedVariant.manage_inventory === true) {
      const inventoryQty = selectedVariant.inventory_quantity

      // If inventory_quantity is explicitly set and greater than 0, it's in stock
      if (inventoryQty !== null && inventoryQty !== undefined && inventoryQty > 0) {
        return true
      }

      // WORKAROUND: In Medusa v2, inventory_quantity may return undefined even when
      // stock exists at the warehouse level. This happens when the inventory linkage
      // between sales channels, stock locations, and fulfillment sets isn't complete.
      // For now, if inventory_quantity is undefined (not 0), allow the purchase.
      // The backend will validate actual availability when adding to cart.
      if (inventoryQty === undefined || inventoryQty === null) {
        return true
      }

      // Only block if inventory_quantity is explicitly 0
      if (inventoryQty === 0) {
        return false
      }
    }

    // Otherwise, allow purchase (backend will validate)
    return true
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    setIsAdding(false)
  }

  // Determine if product needs a size guide based on tags or categories
  // You can customize this logic based on your product structure
  const getSizeGuideCategory = (): "ring" | "necklace" | "bracelet" | "chain" | null => {
    const tags = product.tags?.map((t) => t.value.toLowerCase()) || []
    const categories = product.categories?.map((c) => c.name.toLowerCase()) || []
    const title = product.title?.toLowerCase() || ""

    // Check for ring
    if (tags.includes("ring") || categories.includes("rings") || title.includes("ring")) {
      return "ring"
    }

    // Check for necklace
    if (tags.includes("necklace") || categories.includes("necklaces") || title.includes("necklace")) {
      return "necklace"
    }

    // Check for bracelet
    if (tags.includes("bracelet") || categories.includes("bracelets") || title.includes("bracelet")) {
      return "bracelet"
    }

    // Check for chain
    if (tags.includes("chain") || categories.includes("chains") || title.includes("chain")) {
      return "chain"
    }

    return null
  }

  const sizeGuideCategory = getSizeGuideCategory()

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                      variants={product.variants ?? undefined}
                      selectedOptions={options}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        {/* Size Guide Button */}
        {sizeGuideCategory && (
          <div className="mb-2">
            <SizeGuideButton category={sizeGuideCategory} />
          </div>
        )}

        <ProductPrice product={product} variant={selectedVariant} />

        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className="flex-1 h-10"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? "Select options"
              : !inStock
                ? "Out of stock"
                : "Add to cart"}
          </Button>

          <WishlistButton
            productId={product.id!}
            variantId={selectedVariant?.id}
            size="lg"
          />
        </div>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
