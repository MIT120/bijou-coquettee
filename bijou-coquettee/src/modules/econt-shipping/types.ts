import type { EcontShippingStatus } from "./constants"

export type EcontDeliveryType = "office" | "address"

export type EcontRecipientInput = {
  firstName: string
  lastName: string
  phone: string
  email?: string | null
}

export type EcontOfficeSelection = {
  officeCode: string
  officeName?: string
  city?: string
}

export type EcontAddressSelection = {
  city: string
  postalCode?: string
  addressLine1: string
  addressLine2?: string | null
  entrance?: string | null
  floor?: string | null
  apartment?: string | null
  neighborhood?: string | null
  allowSaturdayDelivery?: boolean
}

export type UpsertCartPreferenceInput = {
  cartId: string
  deliveryType: EcontDeliveryType
  recipient: EcontRecipientInput
  codAmount: number
  office?: EcontOfficeSelection
  address?: EcontAddressSelection
  metadata?: Record<string, unknown> | null
}

export type CreateShipmentPayload = {
  orderId: string
  cartId?: string | null
  deliveryType: EcontDeliveryType
  recipient: EcontRecipientInput
  codAmount: number
  office?: EcontOfficeSelection
  address?: EcontAddressSelection
  metadata?: Record<string, unknown> | null
}

export type SyncStatusInput = {
  shipmentId: string
  refreshTracking?: boolean
}

export type EcontLocationType = "office" | "city" | "street"

export type LocationSearchInput = {
  type: EcontLocationType
  search?: string
  city?: string
  countryCode?: string
  limit?: number
}

export type TrackedEcontShipment = {
  id: string
  order_id: string | null
  cart_id: string | null
  waybill_number: string | null
  status: EcontShippingStatus
  delivery_type: EcontDeliveryType
  office_code: string | null
  address_city: string | null
  cod_amount: number | null
  metadata: Record<string, unknown> | null
  last_synced_at: Date | null
}

