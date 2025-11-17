import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { locales, defaultLocale, type Locale } from "./constants"

export default getRequestConfig(async () => {
  // Get locale from cookie or default
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value

  // Try to get country code from URL if available
  // This is a workaround since we don't have locale in URL
  let locale: Locale = defaultLocale

  if (localeCookie && (localeCookie === "en" || localeCookie === "bg")) {
    locale = localeCookie as Locale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})

