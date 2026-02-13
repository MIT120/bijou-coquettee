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
