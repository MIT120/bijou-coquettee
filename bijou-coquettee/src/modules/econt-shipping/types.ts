import type { EcontShippingStatus } from "./constants";

export type EcontDeliveryType = "office" | "address";

export type EcontRecipientInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
};

export type EcontOfficeSelection = {
  officeCode: string;
  officeName?: string;
  city?: string;
};

export type EcontAddressSelection = {
  city: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string | null;
  entrance?: string | null;
  floor?: string | null;
  apartment?: string | null;
  neighborhood?: string | null;
  allowSaturdayDelivery?: boolean;
};

export type UpsertCartPreferenceInput = {
  cartId: string;
  deliveryType: EcontDeliveryType;
  recipient: EcontRecipientInput;
  codAmount: number;
  office?: EcontOfficeSelection;
  address?: EcontAddressSelection;
  metadata?: Record<string, unknown> | null;
};

export type CreateShipmentPayload = {
  orderId: string;
  cartId?: string | null;
  deliveryType: EcontDeliveryType;
  recipient: EcontRecipientInput;
  codAmount: number;
  weight?: number;
  shipmentDescription?: string;
  office?: EcontOfficeSelection;
  address?: EcontAddressSelection;
  metadata?: Record<string, unknown> | null;
};

export type SyncStatusInput = {
  shipmentId: string;
  refreshTracking?: boolean;
};

export type EcontLocationType = "office" | "city" | "street";

export type LocationSearchInput = {
  type: EcontLocationType;
  search?: string;
  city?: string;
  cityId?: number;
  countryCode?: string;
  limit?: number;
};

export type TrackedEcontShipment = {
  id: string;
  order_id: string | null;
  cart_id: string | null;
  waybill_number: string | null;
  status: EcontShippingStatus;
  delivery_type: EcontDeliveryType;
  office_code: string | null;
  address_city: string | null;
  cod_amount: number | null;
  metadata: Record<string, unknown> | null;
  last_synced_at: Date | null;
};

/**
 * Response from Econt API when creating a shipment
 */
export type EcontCreateShipmentResponse = {
  shipmentNumber?: string;
  trackingNumber?: string;
  pdfURL?: string;
  labelUrl?: string;
  error?: string;
  [key: string]: unknown;
};

/**
 * Helper to safely extract shipment data from Econt API response
 */
export function parseShipmentResponse(response: unknown): {
  waybillNumber: string | null;
  trackingNumber: string | null;
  labelUrl: string | null;
} {
  if (!response || typeof response !== "object") {
    return { waybillNumber: null, trackingNumber: null, labelUrl: null };
  }

  // LabelService.createLabel returns { label: { shipmentNumber, pdfURL, ... } }
  const raw = response as Record<string, unknown>;
  const res = (raw.label && typeof raw.label === "object" ? raw.label : raw) as Record<string, unknown>;

  return {
    waybillNumber:
      typeof res.shipmentNumber === "string" ? res.shipmentNumber : null,
    trackingNumber:
      typeof res.trackingNumber === "string" ? res.trackingNumber : null,
    labelUrl:
      (typeof res.pdfURL === "string" ? res.pdfURL : null) ||
      (typeof res.labelUrl === "string" ? res.labelUrl : null),
  };
}

/**
 * Helper to safely parse a date string from Econt API
 */
export function parseEcontDate(dateString: unknown): Date | null {
  if (typeof dateString !== "string" || !dateString) {
    return null;
  }

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}
