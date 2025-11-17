import { getLocaleFromCountryCode, defaultLocale, type Locale } from "@/i18n/locale"
import enMessages from "../../../messages/en.json"
import bgMessages from "../../../messages/bg.json"

type Messages = typeof enMessages

const messages: Record<Locale, Messages> = {
  en: enMessages,
  bg: bgMessages,
}

/**
 * Get translations for a given locale
 */
export function getTranslations(locale?: Locale): Messages {
  const targetLocale = locale || defaultLocale
  return messages[targetLocale] || messages[defaultLocale]
}

/**
 * Get translation value by key path (e.g., "common.account" -> "Account")
 */
export function t(
  key: string,
  locale?: Locale,
  params?: Record<string, string | number>
): string {
  const translations = getTranslations(locale)
  const keys = key.split(".")

  let value: any = translations
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      // Fallback to English if key not found
      const enTranslations = messages[defaultLocale]
      let enValue: any = enTranslations
      for (const enK of keys) {
        enValue = enValue?.[enK]
        if (enValue === undefined) {
          return key // Return key if not found in English either
        }
      }
      value = enValue
      break
    }
  }

  if (typeof value !== "string") {
    return key
  }

  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match
    })
  }

  return value
}

/**
 * Get locale from country code or cookie (client-side)
 * Prioritizes cookie (user preference) over country code
 */
export function getLocale(countryCode?: string): Locale {
  // First check cookie (user preference takes priority)
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split(";")
    const localeCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("NEXT_LOCALE=")
    )
    if (localeCookie) {
      const localeValue = localeCookie.split("=")[1]?.trim()
      if (localeValue === "en" || localeValue === "bg") {
        return localeValue as Locale
      }
    }
  }

  // Then check country code (fallback to automatic detection)
  if (countryCode) {
    const localeFromCountry = getLocaleFromCountryCode(countryCode)
    if (localeFromCountry !== defaultLocale) {
      return localeFromCountry
    }
  }

  return defaultLocale
}

