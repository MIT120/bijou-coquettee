"use client"

import { NextIntlClientProvider } from "next-intl"
import { ReactNode, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getLocaleFromCountryCode, defaultLocale, type Locale } from "./locale"

type Props = {
  children: ReactNode
  locale: Locale
  messages: any
}

export function I18nProvider({ children, locale, messages }: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

