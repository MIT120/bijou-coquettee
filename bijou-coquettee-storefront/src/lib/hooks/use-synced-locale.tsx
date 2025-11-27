"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import type { Locale } from "@/i18n/locale"
import { getLocale } from "@lib/util/translations"

/**
 * Keeps a locale value in sync between the server-rendered initial value
 * and any client-side preference stored in cookies.
 */
export const useSyncedLocale = (initialLocale: Locale) => {
  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const [locale, setLocale] = useState<Locale>(initialLocale)

  useEffect(() => {
    const clientLocale = getLocale(countryCode)
    setLocale(clientLocale)
  }, [countryCode])

  return locale
}



