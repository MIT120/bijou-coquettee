"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

import { t as translate } from "@lib/util/translations"
import type { Locale } from "@/i18n/locale"
import SearchIcon from "@modules/common/icons/search"
import XIcon from "@modules/common/icons/x"

import SearchBar from "../search-bar"

type SearchOverlayProps = {
  locale: Locale
}

const SearchOverlay = ({ locale }: SearchOverlayProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsExpanded(false)
  }, [pathname])

  useEffect(() => {
    if (!isExpanded) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => {
      document.removeEventListener("mousedown", handleClick)
    }
  }, [isExpanded])

  const toggle = () => setIsExpanded((prev) => !prev)

  const searchLabel = translate("search.cta", locale)
  const closeLabel = translate("common.close", locale)

  return (
    <div ref={containerRef} className="flex items-center gap-2">
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isExpanded
            ? "opacity-100 w-64 pointer-events-auto"
            : "opacity-0 w-0 pointer-events-none"
        }`}
      >
        <SearchBar autoFocus={isExpanded} variant="compact" />
      </div>
      <button
        type="button"
        onClick={toggle}
        className="h-9 w-9 flex items-center justify-center rounded-full text-ui-fg-muted hover:text-ui-fg-base transition-colors"
        aria-label={isExpanded ? closeLabel : searchLabel}
        title={isExpanded ? closeLabel : searchLabel}
        aria-pressed={isExpanded}
      >
        {isExpanded ? <XIcon size="18" /> : <SearchIcon size="18" />}
      </button>
    </div>
  )
}

export default SearchOverlay

