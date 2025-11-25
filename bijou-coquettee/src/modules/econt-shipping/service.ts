import { MedusaService } from "@medusajs/framework/utils"
import { ECONT_DEFAULT_BASE_URL, ECONT_SHIPPING_STATUS } from "./constants"
import EcontLocation from "./models/econt-location"
import EcontShipment from "./models/econt-shipment"
import EcontApiClient from "./clients/econt-client"
import type {
  CreateShipmentPayload,
  LocationSearchInput,
  SyncStatusInput,
  UpsertCartPreferenceInput,
} from "./types"

/**
 * Handles persistence, synchronization, and remote API orchestration for the
 * custom Econt shipping integration.
 */
class EcontShippingModuleService extends MedusaService({
  EcontLocation,
  EcontShipment,
}) {
  private readonly client: EcontApiClient

  constructor(...args: any[]) {
    // @ts-ignore - MedusaService requires the container/options arguments
    super(...args)

    const username = process.env.ECONT_API_USERNAME || "iasp-dev"
    const password = process.env.ECONT_API_PASSWORD || "1Asp-dev"

    if (!process.env.ECONT_API_USERNAME || !process.env.ECONT_API_PASSWORD) {
      console.warn(
        "[EcontShipping] Falling back to demo credentials. Please configure ECONT_API_USERNAME and ECONT_API_PASSWORD for production."
      )
    }

    this.client = new EcontApiClient({
      baseUrl: process.env.ECONT_API_BASE_URL || ECONT_DEFAULT_BASE_URL,
      username,
      password,
      clientNumber: process.env.ECONT_SENDER_CLIENT_NUMBER,
      isDemo: process.env.ECONT_IS_DEMO === "true",
    })
  }

  async searchLocations(input: LocationSearchInput) {
    switch (input.type) {
      case "city":
        return this.client.fetchCities(input)
      case "street":
        return this.client.fetchStreets(input)
      default:
        return this.client.fetchOffices(input)
    }
  }

  async saveCartPreference(input: UpsertCartPreferenceInput) {
    const [existing] = await this.listEcontShipments(
      { cart_id: input.cartId },
      { take: 1 }
    )

    const payload = {
      cart_id: input.cartId,
      delivery_type: input.deliveryType,
      office_code: input.office?.officeCode ?? null,
      office_name: input.office?.officeName ?? null,
      address_city: input.address?.city ?? null,
      address_postal_code: input.address?.postalCode ?? null,
      address_line1: input.address?.addressLine1 ?? null,
      address_line2: input.address?.addressLine2 ?? null,
      entrance: input.address?.entrance ?? null,
      floor: input.address?.floor ?? null,
      apartment: input.address?.apartment ?? null,
      neighborhood: input.address?.neighborhood ?? null,
      allow_saturday: input.address?.allowSaturdayDelivery ?? false,
      recipient_first_name: input.recipient.firstName,
      recipient_last_name: input.recipient.lastName,
      recipient_phone: input.recipient.phone,
      recipient_email: input.recipient.email ?? null,
      cod_amount: input.codAmount,
      metadata: input.metadata ?? null,
      status: existing?.status ?? ECONT_SHIPPING_STATUS.DRAFT,
    }

    if (existing) {
      const [updated] = await this.updateEcontShipments([
        {
          id: existing.id,
          ...payload,
        },
      ])

      return updated
    }

    const [created] = await this.createEcontShipments([payload])
    return created
  }

  async getCartPreference(cartId: string) {
    const [preference] = await this.listEcontShipments(
      { cart_id: cartId },
      { take: 1 }
    )
    return preference ?? null
  }

  async createShipmentFromOrder(orderId: string, cartId?: string | null) {
    if (!cartId) {
      throw new Error(
        "[EcontShipping] Cannot create shipment without associated cart id."
      )
    }

    const preference = await this.getCartPreference(cartId)

    if (!preference) {
      throw new Error(
        `[EcontShipping] No stored Econt preference found for cart ${cartId}`
      )
    }

    const payload: CreateShipmentPayload = {
      cartId,
      orderId,
      codAmount: Number(preference.cod_amount || 0),
      deliveryType: preference.delivery_type as "office" | "address",
      recipient: {
        firstName: preference.recipient_first_name,
        lastName: preference.recipient_last_name,
        phone: preference.recipient_phone,
        email: preference.recipient_email ?? undefined,
      },
      office: preference.office_code
        ? {
            officeCode: preference.office_code,
            officeName: preference.office_name ?? undefined,
            city: preference.address_city ?? undefined,
          }
        : undefined,
      address: preference.address_line1
        ? {
            city: preference.address_city ?? "",
            postalCode: preference.address_postal_code ?? undefined,
            addressLine1: preference.address_line1,
            addressLine2: preference.address_line2 ?? undefined,
            entrance: preference.entrance ?? undefined,
            floor: preference.floor ?? undefined,
            apartment: preference.apartment ?? undefined,
            neighborhood: preference.neighborhood ?? undefined,
            allowSaturdayDelivery: preference.allow_saturday ?? false,
          }
        : undefined,
      metadata: preference.metadata ?? undefined,
    }

    const apiResponse = await this.client.createShipment(payload)

    const [shipment] = await this.updateEcontShipments([
      {
        id: preference.id,
        order_id: orderId,
        status: ECONT_SHIPPING_STATUS.REGISTERED,
        waybill_number: (apiResponse as any)?.shipmentNumber ?? null,
        tracking_number: (apiResponse as any)?.trackingNumber ?? null,
        label_url: (apiResponse as any)?.labelUrl ?? null,
        raw_response: apiResponse,
      },
    ])

    return shipment
  }

  async calculateShipment(cartId: string) {
    const preference = await this.getCartPreference(cartId)

    if (!preference) {
      throw new Error(
        `[EcontShipping] No stored Econt preference found for cart ${cartId}`
      )
    }

    const payload: CreateShipmentPayload = {
      cartId,
      orderId: "",
      codAmount: Number(preference.cod_amount || 0),
      deliveryType: preference.delivery_type as "office" | "address",
      recipient: {
        firstName: preference.recipient_first_name,
        lastName: preference.recipient_last_name,
        phone: preference.recipient_phone,
        email: preference.recipient_email ?? undefined,
      },
      office: preference.office_code
        ? {
            officeCode: preference.office_code,
            officeName: preference.office_name ?? undefined,
            city: preference.address_city ?? undefined,
          }
        : undefined,
      address: preference.address_line1
        ? {
            city: preference.address_city ?? "",
            postalCode: preference.address_postal_code ?? undefined,
            addressLine1: preference.address_line1,
            addressLine2: preference.address_line2 ?? undefined,
            entrance: preference.entrance ?? undefined,
            floor: preference.floor ?? undefined,
            apartment: preference.apartment ?? undefined,
            neighborhood: preference.neighborhood ?? undefined,
            allowSaturdayDelivery: preference.allow_saturday ?? false,
          }
        : undefined,
      metadata: preference.metadata ?? undefined,
    }

    return this.client.calculateShipment(payload)
  }

  async syncShipmentStatus({ shipmentId, refreshTracking = false }: SyncStatusInput) {
    const shipment = await this.retrieveEcontShipment(shipmentId)

    if (!shipment.waybill_number) {
      throw new Error(
        `[EcontShipping] Shipment ${shipmentId} does not have a registered waybill number`
      )
    }

    if (!refreshTracking && shipment.last_synced_at) {
      const diff = Date.now() - new Date(shipment.last_synced_at).getTime()
      const FIFTEEN_MIN = 15 * 60 * 1000
      if (diff < FIFTEEN_MIN) {
        return shipment
      }
    }

    const tracking = await this.client.trackShipment(shipment.waybill_number)

    const normalizedStatus =
      ((tracking as any)?.status as string)?.toLowerCase() || "in_transit"

    const [updated] = await this.updateEcontShipments([
      {
        id: shipmentId,
        status: this.mapRemoteStatus(normalizedStatus),
        raw_response: tracking,
        last_synced_at: new Date(),
      },
    ])

    return updated
  }

  async cancelShipment(shipmentId: string) {
    const shipment = await this.retrieveEcontShipment(shipmentId)

    if (!shipment?.waybill_number) {
      return shipment
    }

    await this.client.deleteShipment(shipment.waybill_number)

    const [updated] = await this.updateEcontShipments([
      {
        id: shipmentId,
        status: ECONT_SHIPPING_STATUS.CANCELLED,
      },
    ])

    return updated
  }

  private mapRemoteStatus(remote: string) {
    if (remote.includes("delivered")) {
      return ECONT_SHIPPING_STATUS.DELIVERED
    }

    if (remote.includes("cancel")) {
      return ECONT_SHIPPING_STATUS.CANCELLED
    }

    if (remote.includes("ready") || remote.includes("registered")) {
      return ECONT_SHIPPING_STATUS.REGISTERED
    }

    return ECONT_SHIPPING_STATUS.IN_TRANSIT
  }
}

export default EcontShippingModuleService

