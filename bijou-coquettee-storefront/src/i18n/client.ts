"use client"

import { useTranslations as useNextIntlTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { getLocaleFromCountryCode, defaultLocale, type Locale } from "./locale"

/**
 * Client-side hook to get translations
 * Automatically detects locale from country code in URL
 */
export function useTranslations(namespace?: string) {
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined

  // Get locale from country code
  const locale = countryCode
    ? getLocaleFromCountryCode(countryCode)
    : defaultLocale

  // Set locale cookie on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`
    }
  }, [locale])

  return useNextIntlTranslations(namespace)
}

