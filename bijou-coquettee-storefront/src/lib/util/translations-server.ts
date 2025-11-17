import { cookies } from "next/headers"
import { getLocaleFromCountryCode, defaultLocale, type Locale } from "@/i18n/locale"
import { t as clientT } from "./translations"

/**
 * Server-side translation function
 * Gets locale from cookies (user preference) or country code
 * Prioritizes cookie over country code
 */
export async function t(
  key: string,
  countryCode?: string,
  params?: Record<string, string | number>
): Promise<string> {
  let locale: Locale = defaultLocale

  // First check cookie (user preference takes priority)
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value
  if (localeCookie && (localeCookie === "en" || localeCookie === "bg")) {
    locale = localeCookie as Locale
  } else if (countryCode) {
    // Fallback to country code if no cookie is set
    locale = getLocaleFromCountryCode(countryCode)
  }

  return clientT(key, locale, params)
}

/**
 * Get locale on server side
 * Prioritizes cookie (user preference) over country code
 */
export async function getServerLocale(countryCode?: string): Promise<Locale> {
  // First check cookie (user preference takes priority)
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value
  if (localeCookie && (localeCookie === "en" || localeCookie === "bg")) {
    return localeCookie as Locale
  }

  // Fallback to country code if no cookie is set
  if (countryCode) {
    return getLocaleFromCountryCode(countryCode)
  }

  return defaultLocale
}

