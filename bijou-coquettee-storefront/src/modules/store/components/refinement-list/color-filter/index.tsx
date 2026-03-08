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

type ColorSwatchProps = {
  colorName: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

const ColorSwatch = ({
  colorName,
  selected,
  onClick,
  disabled,
}: ColorSwatchProps) => {
  const cssColor = getColorCss(colorName)
  const isWhite = colorName.toLowerCase().trim() === "white"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={colorName}
      aria-label={`${selected ? "Remove" : "Filter by"} ${colorName}`}
      aria-pressed={selected}
      className={clx(
        "relative w-7 h-7 rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-base focus-visible:ring-offset-2",
        "flex-shrink-0",
        {
          // Selection ring – offset so the swatch colour is fully visible
          "ring-2 ring-ui-fg-base ring-offset-2": selected,
          "hover:ring-2 hover:ring-ui-border-strong hover:ring-offset-1":
            !selected && !disabled,
          "opacity-50 cursor-not-allowed": disabled,
        }
      )}
      style={{
        background: cssColor ?? "linear-gradient(135deg, #e5e5e5, #a3a3a3)",
        // White swatches need a visible border so they don't vanish on a
        // white background.
        boxShadow: isWhite ? "inset 0 0 0 1px #d1d5db" : undefined,
      }}
    />
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

  const clearColors = () => {
    router.push(`${pathname}?${buildQuery([])}`, { scroll: false })
  }

  if (availableColors.length === 0) {
    return null
  }

  const displayLabel = label ?? "Metal / Color"

  return (
    <div className="flex flex-col gap-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="txt-compact-small-plus text-ui-fg-muted">
          {displayLabel}
        </span>
        {selectedColors.length > 0 && (
          <button
            type="button"
            onClick={clearColors}
            className="txt-compact-xsmall text-ui-fg-muted hover:text-ui-fg-base underline underline-offset-2 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Swatch grid */}
      <div className="flex flex-wrap gap-2">
        {availableColors.map((colorName) => {
          const isSelected = selectedColors.some(
            (c) => c.toLowerCase() === colorName.toLowerCase()
          )
          return (
            <div key={colorName} className="flex flex-col items-center gap-y-1">
              <ColorSwatch
                colorName={colorName}
                selected={isSelected}
                onClick={() => toggleColor(colorName)}
              />
              <span
                className={clx("text-[10px] leading-none text-center max-w-[3rem] truncate", {
                  "text-ui-fg-base font-medium": isSelected,
                  "text-ui-fg-subtle": !isSelected,
                })}
              >
                {colorName}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { OPTION_TITLES }
export default ColorFilter
