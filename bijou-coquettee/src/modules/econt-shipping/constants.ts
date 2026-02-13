export const ECONT_DEFAULT_BASE_URL = "https://demo.econt.com/ee/services"

// Fixed BGN/EUR exchange rate (Bulgarian currency board peg: 1 EUR = 1.95583 BGN)
export const EUR_TO_BGN = 1.95583

export const ECONT_SHIPPING_STATUS = {
  DRAFT: "draft",
  READY: "ready",
  REGISTERED: "registered",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  ERROR: "error",
} as const

export type EcontShippingStatus =
  (typeof ECONT_SHIPPING_STATUS)[keyof typeof ECONT_SHIPPING_STATUS]

