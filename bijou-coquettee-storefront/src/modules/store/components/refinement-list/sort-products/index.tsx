"use client"

import { useParams } from "next/navigation"
import { getLocale, t } from "@lib/util/translations"
import { clx } from "@medusajs/ui"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const locale = getLocale(countryCode)

  const sortOptions: { value: SortOptions; label: string }[] = [
    {
      value: "created_at",
      label: t("store.latestArrivals", locale),
    },
    {
      value: "price_asc",
      label: t("store.priceLowToHigh", locale),
    },
    {
      value: "price_desc",
      label: t("store.priceHighToLow", locale),
    },
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap" data-testid={dataTestId}>
      {sortOptions.map((option) => {
        const isActive = sortBy === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setQueryParams("sortBy", option.value)}
            className={clx(
              // Base pill shape
              "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs tracking-wide font-medium",
              "transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-80 focus-visible:ring-offset-2",
              "whitespace-nowrap select-none",
              // Bubble pop animation on press
              "filter-bubble-pop",
              // Inactive
              "border-grey-20 text-grey-50 bg-white hover:border-grey-40 hover:text-grey-80",
              // Active overrides
              isActive && [
                "border-grey-80 bg-grey-80 text-white",
                "hover:border-grey-70 hover:bg-grey-70",
              ]
            )}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="w-1 h-1 rounded-full bg-white flex-shrink-0"
              />
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default SortProducts
