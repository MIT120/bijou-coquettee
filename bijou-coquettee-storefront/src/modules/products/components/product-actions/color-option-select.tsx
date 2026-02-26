"use client"

import { Listbox, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import ChevronDown from "@modules/common/icons/chevron-down"
import { Fragment } from "react"

const COLOR_MAP: Record<string, string> = {
  // Metals
  gold: "#FFD700",
  silver: "#C0C0C0",
  "rose gold": "#B76E79",
  platinum: "#E5E4E2",
  bronze: "#CD7F32",
  copper: "#B87333",
  // Gem tones
  ruby: "#E0115F",
  emerald: "#50C878",
  sapphire: "#0F52BA",
  amethyst: "#9966CC",
  pearl: "#F0EAD6",
  crystal: "#A7D8DE",
  diamond: "#B9F2FF",
  // Standard colors
  red: "#DC2626",
  blue: "#2563EB",
  green: "#16A34A",
  black: "#1A1A1A",
  white: "#FFFFFF",
  pink: "#EC4899",
  purple: "#9333EA",
  teal: "#0D9488",
  coral: "#FF6B6B",
  ivory: "#FFFFF0",
  navy: "#1E3A5F",
  burgundy: "#800020",
  orange: "#EA580C",
  yellow: "#EAB308",
  brown: "#92400E",
  grey: "#6B7280",
  gray: "#6B7280",
  beige: "#F5F5DC",
  turquoise: "#40E0D0",
  multicolor:
    "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
}

function getColorCss(colorName: string): string | null {
  return COLOR_MAP[colorName.toLowerCase().trim()] ?? null
}

const getStockForOption = (
  optionId: string,
  optionValue: string,
  variants: HttpTypes.StoreProductVariant[] | undefined,
  selectedOptions: Record<string, string | undefined> | undefined
): { inStock: boolean; quantity: number | null } => {
  if (!variants) return { inStock: true, quantity: null }

  const matchingVariants = variants.filter((variant) => {
    const variantOption = variant.options?.find(
      (opt) => opt.option_id === optionId
    )
    if (variantOption?.value !== optionValue) return false

    if (selectedOptions) {
      for (const [otherOptionId, otherValue] of Object.entries(
        selectedOptions
      )) {
        if (otherOptionId === optionId || !otherValue) continue
        const otherVariantOption = variant.options?.find(
          (opt) => opt.option_id === otherOptionId
        )
        if (otherVariantOption?.value !== otherValue) return false
      }
    }
    return true
  })

  if (matchingVariants.length === 0) return { inStock: false, quantity: 0 }

  let totalQuantity = 0
  let hasUndefinedInventory = false

  for (const variant of matchingVariants) {
    if (variant.manage_inventory === false)
      return { inStock: true, quantity: null }
    if (
      variant.inventory_quantity === undefined ||
      variant.inventory_quantity === null
    ) {
      hasUndefinedInventory = true
    } else {
      totalQuantity += variant.inventory_quantity
    }
  }

  if (hasUndefinedInventory && totalQuantity === 0)
    return { inStock: true, quantity: null }

  return {
    inStock: totalQuantity > 0 || hasUndefinedInventory,
    quantity: hasUndefinedInventory ? null : totalQuantity,
  }
}

type ColorOptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (optionId: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
  variants?: HttpTypes.StoreProductVariant[]
  selectedOptions?: Record<string, string | undefined>
}

const ColorSwatch = ({
  colorName,
  size = "sm",
}: {
  colorName: string
  size?: "sm" | "md"
}) => {
  const cssColor = getColorCss(colorName)
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5"

  if (!cssColor) {
    return (
      <span
        className={clx(
          sizeClass,
          "rounded-full border border-ui-border-base flex-shrink-0"
        )}
        style={{ background: "linear-gradient(135deg, #e5e5e5, #a3a3a3)" }}
        aria-hidden="true"
      />
    )
  }

  return (
    <span
      className={clx(
        sizeClass,
        "rounded-full border border-ui-border-base flex-shrink-0",
        { "border-gray-300": colorName.toLowerCase() === "white" }
      )}
      style={{ background: cssColor }}
      aria-hidden="true"
    />
  )
}

const ColorOptionSelect: React.FC<ColorOptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  variants,
  selectedOptions,
}) => {
  const values = (option.values ?? []).map((v) => v.value)

  const handleChange = (value: string) => {
    updateOption(option.id, value)
  }

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-medium text-ui-fg-base">
        Select {title}
      </span>
      <Listbox
        value={current ?? ""}
        onChange={handleChange}
        disabled={disabled}
      >
        <div className="relative" data-testid={dataTestId}>
          <Listbox.Button
            className={clx(
              "relative w-full flex items-center justify-between gap-x-2",
              "px-4 py-3 text-left bg-ui-bg-base rounded-lg",
              "border border-ui-border-base",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-base focus-visible:ring-offset-2",
              "transition-all duration-200",
              "hover:border-ui-fg-muted",
              { "opacity-50 cursor-not-allowed": disabled }
            )}
          >
            {current ? (
              <span className="flex items-center gap-x-2 text-sm text-ui-fg-base">
                <ColorSwatch colorName={current} size="md" />
                {current}
              </span>
            ) : (
              <span className="text-sm text-ui-fg-muted">Choose a color</span>
            )}
            <ChevronDown size="20" />
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={clx(
                "absolute z-30 mt-1 w-full",
                "max-h-60 overflow-auto",
                "bg-ui-bg-base rounded-lg",
                "border border-ui-border-base shadow-lg",
                "focus:outline-none",
                "py-1"
              )}
            >
              {values.map((value) => {
                const stockInfo = getStockForOption(
                  option.id,
                  value,
                  variants,
                  selectedOptions
                )
                const isOutOfStock = !stockInfo.inStock

                return (
                  <Listbox.Option
                    key={value}
                    value={value}
                    disabled={isOutOfStock}
                    className={({ active, selected }) =>
                      clx(
                        "relative cursor-pointer select-none px-4 py-2.5",
                        "flex items-center justify-between",
                        "transition-colors duration-100",
                        {
                          "bg-ui-bg-base-hover": active && !selected,
                          "bg-ui-bg-subtle": selected,
                          "opacity-50 cursor-not-allowed": isOutOfStock,
                        }
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={clx("flex items-center gap-x-2 text-sm", {
                            "font-medium text-ui-fg-base": selected,
                            "text-ui-fg-subtle": !selected && !isOutOfStock,
                            "line-through text-ui-fg-disabled": isOutOfStock,
                          })}
                        >
                          <ColorSwatch colorName={value} />
                          {value}
                        </span>
                        <span className="flex items-center gap-x-2">
                          {variants && (
                            <span
                              className={clx("text-xs", {
                                "text-ui-fg-muted": !isOutOfStock,
                                "text-ui-fg-disabled": isOutOfStock,
                                "text-green-600":
                                  stockInfo.quantity !== null &&
                                  stockInfo.quantity > 0 &&
                                  stockInfo.quantity <= 5,
                              })}
                            >
                              {isOutOfStock
                                ? "Out of stock"
                                : stockInfo.quantity !== null
                                  ? stockInfo.quantity <= 5
                                    ? `Only ${stockInfo.quantity} left`
                                    : `${stockInfo.quantity} in stock`
                                  : "In stock"}
                            </span>
                          )}
                          {selected && (
                            <svg
                              className="w-4 h-4 text-ui-fg-base"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          )}
                        </span>
                      </>
                    )}
                  </Listbox.Option>
                )
              })}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}

export default ColorOptionSelect
