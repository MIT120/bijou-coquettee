"use client"

import { useState, useEffect } from "react"
import { usePathname, useParams } from "next/navigation"
import { useToggleState } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"
import { getLocale, t } from "@lib/util/translations"
import { Locale } from "@/i18n/locale"
import { NAV_ITEMS } from "@modules/layout/constants/navigation"

const SideMenu = ({
  regions,
  locale: initialLocale,
}: {
  regions: HttpTypes.StoreRegion[] | null
  locale: Locale
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const toggleState = useToggleState()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const clientLocale = getLocale(countryCode)
    setLocale(clientLocale)
  }, [countryCode])

  // Close on route change
  useEffect(() => {
    setIsOpen(false)
    setExpandedItem(null)
  }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    setExpandedItem(null)
  }

  return (
    <div className="h-full">
      {/* Hamburger → X morph button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-10 h-10 -ml-2 focus:outline-none text-grey-90"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        data-testid="nav-menu-button"
      >
        <div className="flex flex-col justify-center gap-[5px] w-[18px]">
          <span
            className={`block h-px bg-current transition-all duration-300 ease-in-out origin-center ${
              isOpen ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px bg-current transition-all duration-300 ease-in-out ${
              isOpen ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block h-px bg-current transition-all duration-300 ease-in-out origin-center ${
              isOpen ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </div>
      </button>

      {/* Full-screen overlay — starts below the sticky nav bar (top-16 = h-16 = 64px) */}
      <div
        className={`fixed top-16 left-0 right-0 bottom-0 z-[100] bg-cream flex flex-col transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2"
        }`}
        data-testid="nav-menu-popup"
        aria-hidden={!isOpen}
      >
        {/* Scrollable nav items */}
        <nav className="flex-1 overflow-y-auto px-8 pt-3 pb-2">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.key} className="border-b border-grey-10 last:border-b-0">

                {/* Parent item row */}
                {item.children && item.children.length > 0 ? (
                  <button
                    onClick={() =>
                      setExpandedItem(expandedItem === item.key ? null : item.key)
                    }
                    className="w-full flex items-center justify-between py-5 text-left focus:outline-none"
                  >
                    <span
                      className="font-display text-[2.3rem] leading-none font-light text-grey-90 transition-all duration-500 ease-out"
                      style={{
                        opacity: mounted && isOpen ? 1 : 0,
                        transform: mounted && isOpen ? "translateY(0)" : "translateY(12px)",
                        transitionDelay: isOpen ? `${index * 65 + 80}ms` : "0ms",
                      }}
                    >
                      {t(item.translationKey, locale)}
                    </span>
                    <span
                      className={`flex-shrink-0 ml-4 text-grey-30 transition-all duration-300 ease-in-out ${
                        expandedItem === item.key ? "rotate-45 !text-soft-gold" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="0.8">
                        <line x1="6.5" y1="0" x2="6.5" y2="13" />
                        <line x1="0" y1="6.5" x2="13" y2="6.5" />
                      </svg>
                    </span>
                  </button>
                ) : (
                  <LocalizedClientLink
                    href={item.href}
                    onClick={handleClose}
                    data-testid={`${item.key}-link`}
                    className="block py-5 font-display text-[2.3rem] leading-none font-light text-grey-90 hover:text-soft-gold transition-colors duration-200"
                    style={{
                      opacity: mounted && isOpen ? 1 : 0,
                      transform: mounted && isOpen ? "translateY(0)" : "translateY(12px)",
                      transition: "opacity 500ms ease-out, transform 500ms ease-out, color 200ms",
                      transitionDelay: isOpen ? `${index * 65 + 80}ms` : "0ms",
                    }}
                  >
                    {t(item.translationKey, locale)}
                  </LocalizedClientLink>
                )}

                {/* Accordion children — CSS grid-rows height trick */}
                {item.children && item.children.length > 0 && (
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      expandedItem === item.key
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden min-h-0">
                      <ul className="flex flex-col pb-5 pt-0 pl-1">
                        {item.children.map((child, childIndex) => (
                          <li key={child.key}>
                            <LocalizedClientLink
                              href={child.href}
                              onClick={handleClose}
                              data-testid={`${child.key}-link`}
                              className="block py-2.5 font-sans text-xs tracking-[0.14em] uppercase text-grey-50 hover:text-grey-90 transition-colors duration-200"
                              style={{
                                opacity: expandedItem === item.key ? 1 : 0,
                                transform:
                                  expandedItem === item.key
                                    ? "translateX(0)"
                                    : "translateX(-8px)",
                                transition: "opacity 300ms ease-out, transform 300ms ease-out, color 200ms",
                                transitionDelay:
                                  expandedItem === item.key
                                    ? `${childIndex * 50 + 80}ms`
                                    : "0ms",
                              }}
                            >
                              {t(child.translationKey, locale)}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer utility area */}
        <div
          className="px-8 py-5 border-t border-grey-10 flex flex-col gap-4"
          style={{
            opacity: mounted && isOpen ? 1 : 0,
            transform: mounted && isOpen ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 500ms ease-out, transform 500ms ease-out",
            transitionDelay: isOpen ? `${NAV_ITEMS.length * 65 + 100}ms` : "0ms",
          }}
        >
          {/* Quick utility links */}
          <div className="flex items-center gap-6">
            <LocalizedClientLink
              href="/account"
              onClick={handleClose}
              className="font-sans text-[0.65rem] tracking-[0.16em] uppercase text-grey-50 hover:text-grey-90 transition-colors duration-200"
            >
              {t("common.account", locale)}
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account/wishlist"
              onClick={handleClose}
              className="font-sans text-[0.65rem] tracking-[0.16em] uppercase text-grey-50 hover:text-grey-90 transition-colors duration-200"
            >
              {t("common.wishlist", locale)}
            </LocalizedClientLink>
          </div>

          {/* Region / country selector */}
          {regions && (
            <div
              className="flex items-center justify-between"
              onMouseEnter={toggleState.open}
              onMouseLeave={toggleState.close}
            >
              <CountrySelect toggleState={toggleState} regions={regions} />
            </div>
          )}

          {/* Copyright */}
          <p className="font-sans text-[0.6rem] tracking-wide text-grey-30">
            {t("common.copyright", locale, {
              year: new Date().getFullYear().toString(),
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SideMenu
