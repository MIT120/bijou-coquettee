"use client"

/**
 * EmptyFilterState
 *
 * Shown inside the product grid area when filters produce zero results.
 * Uses a minimal illustration (SVG ring outline) and a "Clear filters"
 * call-to-action that resets all query params.
 */

import { usePathname, useRouter } from "next/navigation"
import { getLocale, t } from "@lib/util/translations"
import { useParams } from "next/navigation"

export default function EmptyFilterState() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const locale = getLocale(countryCode)

  const handleClear = () => {
    router.push(pathname, { scroll: false })
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-24 px-4 text-center"
      data-testid="empty-filter-state"
      role="status"
    >
      {/* Decorative ring illustration */}
      <div className="mb-8 opacity-30" aria-hidden="true">
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring */}
          <circle
            cx="36"
            cy="36"
            r="32"
            stroke="#CAB08E"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Inner gemstone outline */}
          <path
            d="M36 18L44 28H28L36 18Z"
            stroke="#CAB08E"
            strokeWidth="1.2"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M28 28H44L36 50L28 28Z"
            stroke="#CAB08E"
            strokeWidth="1.2"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Heading */}
      <h3 className="font-display text-xl text-grey-70 mb-2 tracking-wide">
        {t("store.noProducts", locale)}
      </h3>

      {/* Supporting text */}
      <p className="text-sm text-grey-40 font-sans max-w-xs leading-relaxed mb-8">
        {t("store.noProductsDescription", locale)}
      </p>

      {/* CTA */}
      <button
        type="button"
        onClick={handleClear}
        className="inline-flex items-center h-10 px-6 rounded-full border border-grey-90 bg-grey-90 text-white text-xs tracking-widest uppercase font-sans transition-all duration-150 hover:bg-grey-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-90 focus-visible:ring-offset-2"
      >
        {t("store.clearFilters", locale)}
      </button>
    </div>
  )
}
