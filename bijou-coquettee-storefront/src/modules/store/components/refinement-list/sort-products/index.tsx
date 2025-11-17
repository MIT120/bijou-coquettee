"use client"

import { useParams } from "next/navigation"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { getLocale, t } from "@lib/util/translations"

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

  const sortOptions = [
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

  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
  }

  return (
    <FilterRadioGroup
      title={t("store.sortBy", locale)}
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts
