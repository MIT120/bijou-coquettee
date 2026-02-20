"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment, useEffect, useState } from "react"
import { useParams } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"
import { getLocale, t } from "@lib/util/translations"
import { Locale } from "@/i18n/locale"
import { NAV_ITEMS } from "@modules/layout/constants/navigation"

const SideMenu = ({
  regions,
  locale: initialLocale
}: {
  regions: HttpTypes.StoreRegion[] | null
  locale: Locale
}) => {
  const toggleState = useToggleState()
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined

  // Use server-provided locale initially, then sync with client-side locale after hydration
  const [locale, setLocale] = useState<Locale>(initialLocale)

  useEffect(() => {
    // After hydration, update to client-side locale (which respects cookie)
    const clientLocale = getLocale(countryCode)
    setLocale(clientLocale)
  }, [countryCode])

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base"
                >
                  <span className="small:hidden flex items-center justify-center w-10 h-10 -ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </span>
                  <span className="hidden small:inline">{t("navigation.menu", locale)}</span>
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-30 inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-[rgba(3,7,18,0.5)] rounded-rounded justify-between p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button data-testid="close-menu-button" onClick={close}>
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col gap-6 items-start justify-start w-full">
                      {NAV_ITEMS.map((item) => {
                        return (
                          <li key={item.key} className="w-full">
                            <LocalizedClientLink
                              href={item.href}
                              className="text-3xl leading-10 hover:text-ui-fg-disabled"
                              onClick={close}
                              data-testid={`${item.key}-link`}
                            >
                              {t(item.translationKey, locale)}
                            </LocalizedClientLink>
                            {item.children && (
                              <ul className="mt-2 ml-4 flex flex-col gap-3 text-lg leading-7">
                                {item.children.map((child) => (
                                  <li key={child.key}>
                                    <LocalizedClientLink
                                      href={child.href}
                                      className="hover:text-ui-fg-disabled"
                                      onClick={close}
                                      data-testid={`${child.key}-link`}
                                    >
                                      {t(child.translationKey, locale)}
                                    </LocalizedClientLink>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex flex-col gap-y-6">
                      <div
                        className="flex justify-between"
                        onMouseEnter={toggleState.open}
                        onMouseLeave={toggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={toggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            toggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small">
                        {t("common.copyright", locale, { year: new Date().getFullYear().toString() })}
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
