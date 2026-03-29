"use client"

import { clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

// Matches the same COLOR_MAP used in color-option-select.tsx so swatches
// look identical on the product page and on collection/store pages.
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
  multicolor: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
}

const OPTION_TITLES = ["color", "colour", "metal", "метал", "цвят"]

/** URL query param key used to store selected colors/metals. */
export const COLOR_FILTER_PARAM = "color"

function getColorCss(colorName: string): string | null {
  return COLOR_MAP[colorName.toLowerCase().trim()] ?? null
}

/** Returns true when the color is light enough that a dark outline is needed. */
function isLightColor(colorName: string): boolean {
  const light = ["white", "ivory", "pearl", "platinum", "silver", "crystal", "diamond", "beige"]
  return light.includes(colorName.toLowerCase().trim())
}

type ColorPillProps = {
  colorName: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

/**
 * A pill-shaped button containing a small color dot followed by the color
 * label. Active state fills the pill with the brand dark tone.
 */
const ColorPill = ({ colorName, selected, onClick, disabled }: ColorPillProps) => {
  const cssColor = getColorCss(colorName)
  const light = isLightColor(colorName)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${selected ? "Remove filter" : "Filter by"} ${colorName}`}
      className={clx(
        // Base pill
        "inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-full border text-xs tracking-wide font-medium",
        "transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-grey-80 focus-visible:ring-offset-2",
        "whitespace-nowrap select-none",
        // Bubble pop animation on press
        "filter-bubble-pop",
        // Inactive
        "border-grey-20 text-grey-50 bg-white hover:border-grey-40 hover:text-grey-80",
        // Active overrides
        selected && [
          "border-grey-80 bg-grey-80 text-white",
          "hover:border-grey-70 hover:bg-grey-70",
        ],
        // Disabled
        disabled && "opacity-40 cursor-not-allowed pointer-events-none"
      )}
    >
      {/* Color dot */}
      <span
        aria-hidden="true"
        className={clx(
          "w-3 h-3 rounded-full flex-shrink-0",
          light && !selected && "ring-1 ring-grey-20"
        )}
        style={{
          background: cssColor ?? "linear-gradient(135deg,#e5e5e5,#a3a3a3)",
        }}
      />
      {/* Capitalize first letter for display */}
      <span className="capitalize">{colorName}</span>
    </button>
  )
}

type ColorFilterProps = {
  /** Unique color/metal values extracted from the visible products. */
  availableColors: string[]
  /** Optional label override; defaults to "Metal / Color". */
  label?: string
}

const ColorFilter = ({ availableColors, label }: ColorFilterProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Parse currently selected colors from the URL (comma-separated).
  const selectedColors: string[] = (
    searchParams.get(COLOR_FILTER_PARAM) ?? ""
  )
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)

  const buildQuery = useCallback(
    (nextSelected: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      if (nextSelected.length === 0) {
        params.delete(COLOR_FILTER_PARAM)
      } else {
        params.set(COLOR_FILTER_PARAM, nextSelected.join(","))
      }
      // Reset to page 1 when filter changes
      params.delete("page")
      return params.toString()
    },
    [searchParams]
  )

  const toggleColor = (colorName: string) => {
    const normalized = colorName.trim()
    const isSelected = selectedColors.some(
      (c) => c.toLowerCase() === normalized.toLowerCase()
    )
    const next = isSelected
      ? selectedColors.filter(
          (c) => c.toLowerCase() !== normalized.toLowerCase()
        )
      : [...selectedColors, normalized]

    router.push(`${pathname}?${buildQuery(next)}`, { scroll: false })
  }

  if (availableColors.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {availableColors.map((colorName) => {
        const isSelected = selectedColors.some(
          (c) => c.toLowerCase() === colorName.toLowerCase()
        )
        return (
          <ColorPill
            key={colorName}
            colorName={colorName}
            selected={isSelected}
            onClick={() => toggleColor(colorName)}
          />
        )
      })}
    </div>
  )
}

export { OPTION_TITLES }
export default ColorFilter
