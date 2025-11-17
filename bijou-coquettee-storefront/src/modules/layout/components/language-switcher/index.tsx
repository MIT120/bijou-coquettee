"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { getLocale } from "@lib/util/translations"
import { type Locale } from "@/i18n/locale"

type LanguageOption = {
  code: Locale
  name: string
  nativeName: string
}

const languageOptions: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
]

const LanguageSwitcher = ({ locale: initialLocale }: { locale: Locale }) => {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const countryCode = params?.countryCode as string | undefined
  
  // Use server-provided locale initially, then sync with client-side locale after hydration
  const [selectedLocale, setSelectedLocale] = useState<Locale>(initialLocale)
  const [isOpen, setIsOpen] = useState(false)

  // Update selected locale when pathname changes (after page reload with new cookie)
  useEffect(() => {
    // After hydration, update to client-side locale (which respects cookie)
    const clientLocale = getLocale(countryCode)
    setSelectedLocale(clientLocale)
  }, [pathname, countryCode])

  const handleChange = (option: LanguageOption) => {
    setSelectedLocale(option.code)
    setIsOpen(false)

    // Set locale cookie with proper formatting
    document.cookie = `NEXT_LOCALE=${option.code}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`

    // Force a full page reload to ensure the cookie is read and translations are updated
    // Using setTimeout to ensure cookie is set before reload
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const currentLanguage = languageOptions.find((lang) => lang.code === selectedLocale) || languageOptions[0]

  return (
    <div className="relative">
      <Listbox value={currentLanguage} onChange={handleChange}>
        {({ open }) => {
          useEffect(() => {
            setIsOpen(open)
          }, [open])

          return (
            <>
              <ListboxButton className="flex items-center gap-x-2 hover:text-ui-fg-base transition-colors">
                <span className="text-small-regular uppercase tracking-wide">
                  {currentLanguage.code.toUpperCase()}
                </span>
              </ListboxButton>
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions className="absolute right-0 top-full mt-2 min-w-[160px] z-[900] bg-white drop-shadow-md text-small-regular text-black rounded-rounded overflow-hidden">
                  {languageOptions.map((option) => (
                    <ListboxOption
                      key={option.code}
                      value={option}
                      className={({ active }) =>
                        `py-2 px-3 cursor-pointer flex items-center justify-between ${
                          active ? "bg-gray-100" : ""
                        } ${
                          selectedLocale === option.code ? "bg-gray-50 font-medium" : ""
                        }`
                      }
                    >
                      <span>{option.nativeName}</span>
                      {selectedLocale === option.code && (
                        <span className="text-ui-fg-base">✓</span>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </>
          )
        }}
      </Listbox>
    </div>
  )
}

export default LanguageSwitcher

