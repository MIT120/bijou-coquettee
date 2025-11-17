import { getRequestLocale } from "next-intl/server"
import { defaultLocale, type Locale } from "./constants"
import { cookies } from "next/headers"

/**
 * Get the current locale from the request
 * Falls back to cookie, then default locale
 */
export async function getLocale(): Promise<Locale> {
  try {
    // Try to get locale from next-intl
    const locale = await getRequestLocale()
    if (locale) {
      return locale as Locale
    }
  } catch {
    // If next-intl locale is not available, check cookie
  }

  // Fallback to cookie
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value

  if (localeCookie && (localeCookie === "en" || localeCookie === "bg")) {
    return localeCookie as Locale
  }

  return defaultLocale
}

