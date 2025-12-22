import { isEmpty } from "./isEmpty"
import { noDivisionCurrencies } from "@lib/constants"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

/**
 * Converts an amount from Medusa's smallest currency unit (e.g., cents) to a formatted locale string.
 * Medusa stores amounts in the smallest unit (e.g., 1000 = €10.00 EUR).
 * This function divides by 100 for standard currencies and leaves zero-decimal currencies as-is.
 */
export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  // Convert from smallest currency unit to decimal
  // Most currencies need division by 100 (e.g., cents to euros)
  // Zero-decimal currencies (JPY, KRW, etc.) don't need division
  const divisor = noDivisionCurrencies.includes(currency_code.toLowerCase()) ? 1 : 100
  const convertedAmount = amount / divisor

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(convertedAmount)
}
