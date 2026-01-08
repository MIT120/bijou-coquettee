import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
  // Optional: variants to calculate stock for each option
  variants?: HttpTypes.StoreProductVariant[]
  // Optional: currently selected options to filter variants
  selectedOptions?: Record<string, string | undefined>
}

// Helper to get stock info for a specific option value
const getStockForOption = (
  optionId: string,
  optionValue: string,
  variants: HttpTypes.StoreProductVariant[] | undefined,
  selectedOptions: Record<string, string | undefined> | undefined
): { inStock: boolean; quantity: number | null } => {
  if (!variants) {
    return { inStock: true, quantity: null }
  }

  // Find all variants that have this option value
  const matchingVariants = variants.filter((variant) => {
    const variantOption = variant.options?.find((opt) => opt.option_id === optionId)
    if (variantOption?.value !== optionValue) return false

    // If we have other selected options, filter by those too
    if (selectedOptions) {
      for (const [otherOptionId, otherValue] of Object.entries(selectedOptions)) {
        if (otherOptionId === optionId) continue // Skip current option
        if (!otherValue) continue // Skip unselected options

        const otherVariantOption = variant.options?.find((opt) => opt.option_id === otherOptionId)
        if (otherVariantOption?.value !== otherValue) return false
      }
    }

    return true
  })

  if (matchingVariants.length === 0) {
    return { inStock: false, quantity: 0 }
  }

  // Sum up inventory across matching variants
  let totalQuantity = 0
  let hasUndefinedInventory = false

  for (const variant of matchingVariants) {
    if (variant.manage_inventory === false) {
      return { inStock: true, quantity: null } // Unlimited stock
    }

    if (variant.inventory_quantity === undefined || variant.inventory_quantity === null) {
      hasUndefinedInventory = true
    } else {
      totalQuantity += variant.inventory_quantity
    }
  }

  // If all inventory is undefined, we assume it's in stock (workaround for Medusa v2)
  if (hasUndefinedInventory && totalQuantity === 0) {
    return { inStock: true, quantity: null }
  }

  return {
    inStock: totalQuantity > 0 || hasUndefinedInventory,
    quantity: hasUndefinedInventory ? null : totalQuantity,
  }
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  variants,
  selectedOptions,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-medium text-ui-fg-base">Select {title}</span>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current
          const stockInfo = getStockForOption(option.id, v, variants, selectedOptions)
          const isOutOfStock = !stockInfo.inStock

          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "relative border text-sm font-medium min-h-[52px] px-3 py-2 rounded-lg transition-all duration-200",
                "flex flex-col items-center justify-center text-center gap-0.5",
                {
                  // Selected state
                  "border-ui-fg-base bg-ui-bg-base text-ui-fg-base ring-1 ring-ui-fg-base": isSelected && !isOutOfStock,
                  // Unselected state
                  "border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle hover:border-ui-fg-muted hover:bg-ui-bg-base": !isSelected && !isOutOfStock,
                  // Out of stock state
                  "border-ui-border-base bg-ui-bg-subtle text-ui-fg-disabled line-through opacity-60": isOutOfStock,
                  // Disabled state
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
              disabled={disabled || isOutOfStock}
              data-testid="option-button"
            >
              <span>{v}</span>
              {variants && (
                <span className={clx("text-xs", {
                  "text-ui-fg-muted": !isOutOfStock,
                  "text-ui-fg-disabled": isOutOfStock,
                  "text-green-600": stockInfo.quantity !== null && stockInfo.quantity > 0 && stockInfo.quantity <= 5,
                })}>
                  {isOutOfStock
                    ? "Out of stock"
                    : stockInfo.quantity !== null
                      ? stockInfo.quantity <= 5
                        ? `Only ${stockInfo.quantity} left`
                        : `${stockInfo.quantity} in stock`
                      : "In stock"}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
