"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { useParams } from "next/navigation"
import { clx } from "@medusajs/ui"

import SortProducts, { SortOptions } from "./sort-products"
import ColorFilter, { COLOR_FILTER_PARAM } from "./color-filter"
import { getLocale, t } from "@lib/util/translations"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  availableColors?: string[]
  "data-testid"?: string
}

/**
 * ActiveFiltersSummary
 *
 * Shows a count badge like "3 filters active" with a "Clear all" pill.
 * Only renders when at least one filter is applied.
 */
const ActiveFiltersSummary = ({
  activeCount,
  onClearAll,
  locale,
}: {
  activeCount: number
  onClearAll: () => void
  locale: string
}) => {
  if (activeCount === 0) return null

  const label =
    activeCount === 1
      ? t("store.filterActive", locale, { count: 1 })
      : t("store.filtersActive", locale, { count: activeCount })

  return (
    <div className="flex items-center gap-3 pt-2 border-t border-grey-10">
      {/* Badge */}
      <span className="inline-flex items-center gap-1.5 text-xs text-grey-50 font-medium">
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-grey-80 text-white text-[10px] font-semibold leading-none"
        >
          {activeCount}
        </span>
        {label}
      </span>

      {/* Clear all pill */}
      <button
        type="button"
        onClick={onClearAll}
        className={clx(
          "inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium",
          "border-grey-20 text-grey-50 bg-white",
          "hover:border-grey-40 hover:text-grey-80",
          "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-80 focus-visible:ring-offset-2"
        )}
      >
        {/* Small × icon */}
        <svg
          aria-hidden="true"
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="none"
          className="flex-shrink-0"
        >
          <path
            d="M1 1l6 6M7 1L1 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {t("store.clearFilters", locale)}
      </button>
    </div>
  )
}

/**
 * RefinementList
 *
 * Horizontal sticky filter bar that sits ABOVE the product grid.
 *
 * Layout:
 *   ┌────────────────────────────────────────────────────┐
 *   │ SORT BY  [Latest] [Price ↑] [Price ↓]             │  ← sort section
 *   │ METAL / COLOR  [● Gold] [● Silver] [● Rose Gold]  │  ← color section
 *   │ ─────────────────────────────────────────────────  │
 *   │ 2 filters active                    [× Clear all] │  ← summary row
 *   └────────────────────────────────────────────────────┘
 *
 * On mobile the bar scrolls horizontally inside each row (no wrapping
 * overflow) so the product grid is never pushed down by many filter pills.
 */
const RefinementList = ({
  sortBy,
  availableColors,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const locale = getLocale(countryCode)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const p = new URLSearchParams(searchParams)
      p.set(name, value)
      return p.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`, { scroll: false })
  }

  // Count active filters for the summary row.
  const activeSortCount = sortBy !== "created_at" ? 1 : 0
  const activeColorCount = (searchParams.get(COLOR_FILTER_PARAM) ?? "")
    .split(",")
    .filter(Boolean).length
  const totalActive = activeSortCount + activeColorCount

  const clearAll = () => {
    const p = new URLSearchParams(searchParams.toString())
    p.delete("sortBy")
    p.delete(COLOR_FILTER_PARAM)
    p.delete("page")
    router.push(`${pathname}?${p.toString()}`, { scroll: false })
  }

  const hasColors = availableColors && availableColors.length > 0

  return (
    /*
     * Outer wrapper: sticky strip across the full width of the content area.
     * `top-[var(--nav-height,0px)]` keeps it beneath any sticky nav.
     * The `z-10` ensures it sits above the product cards during scroll.
     */
    <div
      data-testid={dataTestId}
      className={clx(
        "w-full sticky top-0 z-10",
        "bg-white/95 backdrop-blur-sm",
        "border-b border-grey-10",
        "py-3 mb-6",
        // Negative horizontal margins + matching padding so the bar bleeds
        // to the full content-container width without extra wrappers.
        "px-0"
      )}
    >
      <div className="flex flex-col gap-3">

        {/* ── Sort row ── */}
        <div className="flex items-center gap-3 flex-wrap small:flex-nowrap">
          {/* Section label */}
          <span className="text-[11px] font-semibold tracking-widest uppercase text-grey-40 flex-shrink-0 w-24 hidden small:block">
            {t("store.sortBy", locale)}
          </span>

          {/* Horizontal-scroll container on mobile, wrapping on desktop */}
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 pb-0.5">
              <SortProducts
                sortBy={sortBy}
                setQueryParams={setQueryParams}
              />
            </div>
          </div>
        </div>

        {/* ── Color / Metal row ── */}
        {hasColors && (
          <div className="flex items-center gap-3 flex-wrap small:flex-nowrap">
            {/* Section label */}
            <span className="text-[11px] font-semibold tracking-widest uppercase text-grey-40 flex-shrink-0 w-24 hidden small:block">
              {t("store.metalColor", locale)}
            </span>

            {/* Horizontal-scroll container on mobile */}
            <div className="flex-1 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 pb-0.5">
                <ColorFilter availableColors={availableColors} />
              </div>
            </div>
          </div>
        )}

        {/* ── Active filters summary ── */}
        <ActiveFiltersSummary
          activeCount={totalActive}
          onClearAll={clearAll}
          locale={locale ?? "en"}
        />
      </div>
    </div>
  )
}

export default RefinementList
