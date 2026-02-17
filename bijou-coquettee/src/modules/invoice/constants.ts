export const INVOICE_STATUS = {
  DRAFT: "draft",
  ISSUED: "issued",
  CANCELLED: "cancelled",
} as const

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS]

export const VAT_RATES = {
  STANDARD: 20,
  REDUCED: 9,
  EXEMPT: 0,
} as const

export type VatRate = (typeof VAT_RATES)[keyof typeof VAT_RATES]

// Official fixed exchange rate: 1 EUR = 1.95583 BGN
// This is the irrevocable rate set by Bulgaria's currency board arrangement.
export const EUR_TO_BGN_RATE = 1.95583

/**
 * Convert BGN amount to EUR using the fixed exchange rate.
 */
export function bgnToEur(bgn: number): number {
  return Math.round((bgn / EUR_TO_BGN_RATE) * 100) / 100
}

/**
 * Convert EUR amount to BGN using the fixed exchange rate.
 */
export function eurToBgn(eur: number): number {
  return Math.round(eur * EUR_TO_BGN_RATE * 100) / 100
}
