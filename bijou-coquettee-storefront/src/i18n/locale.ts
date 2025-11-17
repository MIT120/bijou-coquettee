import { locales, defaultLocale, type Locale } from "./constants"

/**
 * Map country codes to locales
 * This allows automatic locale detection based on country code
 */
const countryToLocaleMap: Record<string, Locale> = {
  bg: "bg", // Bulgaria -> Bulgarian
  // Add more mappings as needed
}

/**
 * Get locale from country code
 */
export function getLocaleFromCountryCode(countryCode: string): Locale {
  return countryToLocaleMap[countryCode.toLowerCase()] || defaultLocale
}

/**
 * Get locale from request headers (Accept-Language)
 */
export function getLocaleFromHeaders(headers: Headers): Locale {
  const acceptLanguage = headers.get("accept-language")
  if (!acceptLanguage) return defaultLocale

  // Check if Bulgarian is preferred
  if (acceptLanguage.toLowerCase().includes("bg")) {
    return "bg"
  }

  return defaultLocale
}

/**
 * Validate if a locale is supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export { locales, defaultLocale, type Locale }

