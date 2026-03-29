"use client"

/**
 * HorizontalRefinementBar
 *
 * Replaces the sidebar RefinementList with a sticky horizontal strip that
 * sits above the product grid.  It renders:
 *   - Sort option pills (Latest / Price low-high / Price high-low)
 *   - A thin vertical divider
 *   - Color/metal swatches
 *   - A "Clear filters" pill that appears only when any filter is active
 *
 * The bar becomes sticky once the user scrolls 120 px past the page header
 * (i.e. past the category title row).  A subtle shadow is added via CSS
 * class toggling handled in a lightweight useEffect.
 */

import { clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getLocale, t } from "@lib/util/translations"
import { useParams } from "next/navigation"

// ─── Color swatch map (mirrored from color-filter/index.tsx) ──────────────
const COLOR_MAP: Record<string, string> = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  "rose gold": "#B76E79",
  platinum: "#E5E4E2",
  bronze: "#CD7F32",
  copper: "#B87333",
  ruby: "#E0115F",
  emerald: "#50C878",
  sapphire: "#0F52BA",
  amethyst: "#9966CC",
  pearl: "#F0EAD6",
  crystal: "#A7D8DE",
  diamond: "#B9F2FF",
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
  multicolor: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
}

const COLOR_FILTER_PARAM = "color"

function getColorCss(name: string): string | null {
  return COLOR_MAP[name.toLowerCase().trim()] ?? null
}

// ─── Sort bubble ─────────────────────────────────────────────────────────
type SortBubbleProps = {
  label: string
  active: boolean
  onClick: () => void
}

function SortBubble({ label, active, onClick }: SortBubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clx(
        "inline-flex items-center whitespace-nowrap",
        "h-8 px-4 rounded-full border text-xs tracking-wide font-sans",
        "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-90 focus-visible:ring-offset-2",
        active
          ? "bg-grey-90 text-white border-grey-90"
          : "bg-white text-grey-60 border-grey-20 hover:border-grey-40 hover:text-grey-90"
      )}
    >
      {label}
    </button>
  )
}

// ─── Color swatch pill ────────────────────────────────────────────────────
type SwatchPillProps = {
  colorName: string
  selected: boolean
  onClick: () => void
}

function SwatchPill({ colorName, selected, onClick }: SwatchPillProps) {
  const css = getColorCss(colorName)
  const isWhite = colorName.toLowerCase().trim() === "white"

  return (
    <button
      type="button"
      onClick={onClick}
      title={colorName}
      aria-label={`${selected ? "Remove" : "Filter by"} ${colorName}`}
      aria-pressed={selected}
      className={clx(
        "inline-flex items-center gap-x-1.5 h-8 pl-1.5 pr-3 rounded-full border",
        "text-xs tracking-wide font-sans",
        "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-90 focus-visible:ring-offset-2",
        selected
          ? "border-grey-90 bg-grey-5 text-grey-90 font-medium"
          : "border-grey-20 bg-white text-grey-60 hover:border-grey-40 hover:text-grey-90"
      )}
    >
      {/* Mini swatch dot */}
      <span
        className="w-4 h-4 rounded-full flex-shrink-0"
        style={{
          background: css ?? "linear-gradient(135deg, #e5e5e5, #a3a3a3)",
          boxShadow: isWhite ? "inset 0 0 0 1px #d1d5db" : undefined,
        }}
        aria-hidden="true"
      />
      <span className="max-w-[5rem] truncate capitalize">{colorName}</span>
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────
type HorizontalRefinementBarProps = {
  sortBy: SortOptions
  availableColors: string[]
}

export default function HorizontalRefinementBar({
  sortBy,
  availableColors,
}: HorizontalRefinementBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const locale = getLocale(countryCode)

  // ── Sticky shadow state ───────────────────────────────────────────────
  const barRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    // IntersectionObserver fires when the sentinel (a 1px element placed just
    // above the bar) leaves the viewport.
    const sentinel = document.createElement("div")
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;"
    bar.parentElement?.insertBefore(sentinel, bar)

    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [])

  // ── URL helpers ───────────────────────────────────────────────────────
  const buildQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const p = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          p.delete(key)
        } else {
          p.set(key, value)
        }
      }
      return p.toString()
    },
    [searchParams]
  )

  const selectedColors: string[] = (searchParams.get(COLOR_FILTER_PARAM) ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)

  const handleSort = (value: SortOptions) => {
    router.push(`${pathname}?${buildQuery({ sortBy: value, page: null })}`, {
      scroll: false,
    })
  }

  const toggleColor = (colorName: string) => {
    const normalized = colorName.trim()
    const isSelected = selectedColors.some(
      (c) => c.toLowerCase() === normalized.toLowerCase()
    )
    const next = isSelected
      ? selectedColors.filter((c) => c.toLowerCase() !== normalized.toLowerCase())
      : [...selectedColors, normalized]
    const colorValue = next.length ? next.join(",") : null
    router.push(
      `${pathname}?${buildQuery({ [COLOR_FILTER_PARAM]: colorValue, page: null })}`,
      { scroll: false }
    )
  }

  const clearAll = () => {
    router.push(
      `${pathname}?${buildQuery({ [COLOR_FILTER_PARAM]: null, sortBy: null, page: null })}`,
      { scroll: false }
    )
  }

  const sortOptions: { value: SortOptions; label: string }[] = [
    { value: "created_at", label: t("store.latestArrivals", locale) },
    { value: "price_asc", label: t("store.priceLowToHigh", locale) },
    { value: "price_desc", label: t("store.priceHighToLow", locale) },
  ]

  const hasActiveFilters = selectedColors.length > 0 || sortBy !== "created_at"

  return (
    <div
      ref={barRef}
      className={clx(
        // Layout & spacing
        "sticky top-16 z-30 w-full",
        // Background & border
        "bg-cream-100 border-b border-grey-10",
        // Transition for shadow
        "transition-shadow duration-200",
        isSticky && "shadow-sm"
      )}
      data-testid="horizontal-refinement-bar"
    >
      {/* Inner scroll container — allows the pills to overflow on small screens */}
      <div className="content-container">
        <div
          className={clx(
            "flex items-center gap-2 py-3",
            "overflow-x-auto scrollbar-hide",
            // Fade edges on mobile to hint scrollability
            "[-webkit-overflow-scrolling:touch]"
          )}
        >
          {/* Sort section label */}
          <span className="flex-shrink-0 text-[0.65rem] uppercase tracking-widest text-grey-40 font-sans mr-1 hidden small:block">
            {t("store.sortBy", locale)}
          </span>

          {/* Sort bubbles */}
          {sortOptions.map((opt) => (
            <SortBubble
              key={opt.value}
              label={opt.label}
              active={sortBy === opt.value}
              onClick={() => handleSort(opt.value)}
            />
          ))}

          {/* Divider — only shown when colors exist */}
          {availableColors.length > 0 && (
            <span
              className="flex-shrink-0 w-px h-5 bg-grey-20 mx-1"
              aria-hidden="true"
            />
          )}

          {/* Color / metal swatches */}
          {availableColors.map((colorName) => {
            const selected = selectedColors.some(
              (c) => c.toLowerCase() === colorName.toLowerCase()
            )
            return (
              <SwatchPill
                key={colorName}
                colorName={colorName}
                selected={selected}
                onClick={() => toggleColor(colorName)}
              />
            )
          })}

          {/* Clear-all pill — only visible when filters are active */}
          {hasActiveFilters && (
            <>
              <span
                className="flex-shrink-0 w-px h-5 bg-grey-20 mx-1"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={clearAll}
                className={clx(
                  "flex-shrink-0 inline-flex items-center gap-x-1",
                  "h-8 px-4 rounded-full border border-muted-rose bg-rose-50 text-rose-600",
                  "text-xs tracking-wide font-sans",
                  "transition-all duration-150 hover:bg-rose-100 hover:border-rose-400",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-90 focus-visible:ring-offset-2"
                )}
              >
                {/* X icon */}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1L9 9M9 1L1 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {t("store.clearFilters", locale)}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
