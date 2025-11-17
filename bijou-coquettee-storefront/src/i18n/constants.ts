/**
 * Client-safe i18n constants
 * This file can be imported by both client and server components
 */
export const locales = ["en", "bg"] as const
export const defaultLocale = "en" as const
export type Locale = (typeof locales)[number]

