import { ECONT_DEFAULT_BASE_URL } from "../constants"
import type {
  CreateShipmentPayload,
  EcontAddressSelection,
  EcontOfficeSelection,
  LocationSearchInput,
} from "../types"

export type EcontClientConfig = {
  baseUrl?: string
  username: string
  password: string
  clientNumber?: string
  isDemo?: boolean
}

type EcontApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: {
    code?: string
    message: string
  }
}

export class EcontApiClient {
  private readonly baseUrl: string
  private readonly authHeader: string

  constructor(private readonly config: EcontClientConfig) {
    this.baseUrl = (config.baseUrl || ECONT_DEFAULT_BASE_URL).replace(/\/$/, "")
    this.authHeader = `Basic ${Buffer.from(
      `${config.username}:${config.password}`
    ).toString("base64")}`
  }

  private buildUrl(service: string, method: string) {
    return `${this.baseUrl}/${service}.${method}.json`
  }

  private async request<T>(
    service: string,
    method: string,
    payload: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(this.buildUrl(service, method), {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        `Econt API ${service}.${method} failed with ${response.status}: ${text}`
      )
    }

    const envelope = (await response.json()) as EcontApiEnvelope<T>

    if (envelope.error) {
      throw new Error(
        `Econt API ${service}.${method} error: ${envelope.error.message}`
      )
    }

    return envelope.data as T
  }

  async fetchOffices(input: LocationSearchInput) {
    return this.request(
      "NomenclaturesService",
      "getOffices",
      this.buildLocationPayload(input)
    )
  }

  async fetchCities(input: LocationSearchInput) {
    return this.request(
      "NomenclaturesService",
      "getCities",
      this.buildLocationPayload(input)
    )
  }

  async fetchStreets(input: LocationSearchInput & { cityId?: string }) {
    return this.request(
      "NomenclaturesService",
      "getStreets",
      this.buildLocationPayload(input)
    )
  }

  private buildLocationPayload(input: LocationSearchInput) {
    const payload: Record<string, unknown> = {
      countryCode: input.countryCode || "BGR",
    }

    if (input.search) {
      payload.name = input.search
    }

    if (input.city) {
      payload.city = input.city
    }

    if (input.limit) {
      payload.size = input.limit
    }

    return payload
  }

  async calculateShipment(payload: CreateShipmentPayload) {
    return this.request("ShipmentsService", "calculate", {
      shipment: this.buildShipmentPayload(payload),
    })
  }

  async createShipment(payload: CreateShipmentPayload) {
    return this.request("ShipmentsService", "create", {
      shipment: this.buildShipmentPayload(payload),
    })
  }

  async deleteShipment(waybillNumber: string) {
    return this.request("ShipmentsService", "delete", {
      shipmentNumber: waybillNumber,
    })
  }

  async trackShipment(waybillNumber: string) {
    return this.request("ShipmentsService", "track", {
      shipmentNumber: waybillNumber,
    })
  }

  private buildShipmentPayload(payload: CreateShipmentPayload) {
    const base: Record<string, unknown> = {
      clientNumber: this.config.clientNumber,
      shipmentType: payload.deliveryType === "office" ? "OFFICE" : "ADDRESS",
      cod: {
        amount: payload.codAmount,
        currency: "BGN",
      },
      receiver: {
        name: `${payload.recipient.firstName} ${payload.recipient.lastName}`,
        phones: [{ number: payload.recipient.phone }],
        email: payload.recipient.email,
      },
      metadata: payload.metadata ?? undefined,
    }

    if (payload.deliveryType === "office" && payload.office) {
      base.office = this.buildOfficePayload(payload.office)
    }

    if (payload.deliveryType === "address" && payload.address) {
      base.address = this.buildAddressPayload(payload.address)
    }

    return base
  }

  private buildOfficePayload(office: EcontOfficeSelection) {
    const result: Record<string, unknown> = {
      code: office.officeCode,
    }

    if (office.officeName) {
      result.name = office.officeName
    }

    if (office.city) {
      result.city = office.city
    }

    return result
  }

  private buildAddressPayload(address: EcontAddressSelection) {
    return {
      city: address.city,
      postalCode: address.postalCode,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      entrance: address.entrance,
      floor: address.floor,
      apartment: address.apartment,
      neighborhood: address.neighborhood,
      saturdayDelivery: address.allowSaturdayDelivery ?? false,
    }
  }
}

export default EcontApiClient

