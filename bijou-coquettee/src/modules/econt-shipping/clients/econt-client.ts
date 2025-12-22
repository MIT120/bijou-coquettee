import { ECONT_DEFAULT_BASE_URL } from "../constants"
import type {
  CreateShipmentPayload,
  EcontAddressSelection,
  LocationSearchInput,
} from "../types"

export type EcontClientConfig = {
  baseUrl?: string
  username: string
  password: string
  clientNumber?: string
  isDemo?: boolean
  // COD payout configuration
  cdAgreementNum?: string
  payoutMethod?: "bank" | "office" | "door"
  payoutIban?: string
  payoutBic?: string
}

export type CDPayOptions = {
  method: "bank" | "office" | "door"
  IBAN?: string
  BIC?: string
  bankCurrency?: string
  officeCode?: string
  payDays?: number[]
}

type EcontOfficeResponse = {
  offices: Array<{
    id: number
    code: string
    name: string
    nameEn: string
    address: {
      city: {
        id: number
        name: string
        nameEn: string
        postCode: string
      }
      fullAddress: string
      fullAddressEn: string
    }
  }>
}

type EcontCityResponse = {
  cities: Array<{
    id: number
    name: string
    nameEn: string
    postCode: string
    regionName: string
    regionNameEn: string
  }>
}

type EcontStreetResponse = {
  streets: Array<{
    id: number
    name: string
    nameEn: string
  }>
}

export type EcontTrackingEvent = {
  destinationType: string // client, courier, office, delivery, etc.
  destinationDetails: {
    officeName?: string
    officeNameEn?: string
    cityName?: string
    cityNameEn?: string
    countryCode?: string
  }
  date: string
  time: string
  returnReceiptEvent?: boolean
}

export type EcontShipmentStatus = {
  shipmentNumber: string
  createdTime?: string
  sendTime?: string
  deliveryTime?: string
  deliveryAttemptCount?: number
  cdCollectedTime?: string
  cdPaidTime?: string
  shortDeliveryStatus?: string
  shortDeliveryStatusEn?: string
  trackingEvents?: EcontTrackingEvent[]
  pdfURL?: string
  primaryShipment?: boolean
  returnShipmentNumber?: string
  expectedDeliveryDate?: string
  weight?: number
  sizeWeight?: number
}

type EcontTrackingResponse = {
  shipmentStatuses?: EcontShipmentStatus[]
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
    // Econt API requires a subdirectory matching the service category
    // e.g., NomenclaturesService -> Nomenclatures/NomenclaturesService.getOffices.json
    //       ShipmentsService -> Shipments/ShipmentsService.create.json
    const serviceCategory = service.replace("Service", "")
    return `${this.baseUrl}/${serviceCategory}/${service}.${method}.json`
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

    const data = (await response.json()) as T

    // Check for error in response
    if (data && typeof data === "object" && "type" in data && (data as any).type === "ExException") {
      throw new Error(
        `Econt API ${service}.${method} error: ${(data as any).message}`
      )
    }

    return data
  }

  async fetchOffices(input: LocationSearchInput) {
    const response = await this.request<EcontOfficeResponse>(
      "NomenclaturesService",
      "getOffices",
      this.buildOfficesPayload(input)
    )

    // Transform to normalized format
    return (response.offices || []).map((office) => ({
      id: office.id,
      code: office.code,
      name: office.name,
      nameEn: office.nameEn,
      cityId: office.address?.city?.id,
      cityName: office.address?.city?.name,
      cityNameEn: office.address?.city?.nameEn,
      address: office.address?.fullAddress,
      addressEn: office.address?.fullAddressEn,
    }))
  }

  async fetchCities(input: LocationSearchInput) {
    const response = await this.request<EcontCityResponse>(
      "NomenclaturesService",
      "getCities",
      this.buildCitiesPayload(input)
    )

    // Transform to normalized format
    return (response.cities || []).map((city) => ({
      id: city.id,
      name: city.name,
      nameEn: city.nameEn,
      postCode: city.postCode,
      regionName: city.regionName,
      regionNameEn: city.regionNameEn,
    }))
  }

  async fetchStreets(input: LocationSearchInput & { cityId?: number }) {
    const response = await this.request<EcontStreetResponse>(
      "NomenclaturesService",
      "getStreets",
      this.buildStreetsPayload(input)
    )

    return (response.streets || []).map((street) => ({
      id: street.id,
      name: street.name,
      nameEn: street.nameEn,
    }))
  }

  private buildOfficesPayload(input: LocationSearchInput) {
    const payload: Record<string, unknown> = {
      countryCode: input.countryCode || "BGR",
    }

    // Filter by city ID if provided
    if (input.cityId) {
      payload.cityID = input.cityId
    }

    return payload
  }

  private buildCitiesPayload(input: LocationSearchInput) {
    const payload: Record<string, unknown> = {
      countryCode: input.countryCode || "BGR",
    }

    // Search by name if provided
    if (input.search) {
      payload.name = input.search
    }

    return payload
  }

  private buildStreetsPayload(input: LocationSearchInput & { cityId?: number }) {
    const payload: Record<string, unknown> = {
      countryCode: input.countryCode || "BGR",
    }

    if (input.cityId) {
      payload.cityID = input.cityId
    }

    if (input.search) {
      payload.name = input.search
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
    return this.request<EcontTrackingResponse>("ShipmentsService", "getShipmentStatuses", {
      shipmentNumbers: [waybillNumber],
      full_tracking: "ON",
    })
  }

  async trackMultipleShipments(waybillNumbers: string[]) {
    return this.request<EcontTrackingResponse>("ShipmentsService", "getShipmentStatuses", {
      shipmentNumbers: waybillNumbers,
      full_tracking: "ON",
    })
  }

  private buildShipmentPayload(payload: CreateShipmentPayload) {
    const base: Record<string, unknown> = {
      clientNumber: this.config.clientNumber,
      shipmentType: payload.deliveryType === "office" ? "OFFICE" : "ADDRESS",
      receiver: {
        name: `${payload.recipient.firstName} ${payload.recipient.lastName}`,
        phones: [{ number: payload.recipient.phone }],
        email: payload.recipient.email,
      },
      metadata: payload.metadata ?? undefined,
    }

    // COD (Cash on Delivery / Наложен платеж) configuration
    if (payload.codAmount && payload.codAmount > 0) {
      base.services = {
        ...(base.services as object || {}),
        cdAmount: payload.codAmount,
        cdType: "get", // "get" = collect from receiver
        cdCurrency: "BGN",
      }

      // If we have an agreement number, use it (recommended approach)
      // Otherwise, specify cdPayOptions for where to send the money
      if (this.config.cdAgreementNum) {
        (base.services as Record<string, unknown>).cdAgreementNum = this.config.cdAgreementNum
      } else if (this.config.payoutIban && this.config.payoutBic) {
        // Fallback: specify bank details per shipment
        (base.services as Record<string, unknown>).cdPayOptions = this.buildCdPayOptions()
      }
    }

    if (payload.deliveryType === "office" && payload.office) {
      base.receiverOfficeCode = payload.office.officeCode
    }

    if (payload.deliveryType === "address" && payload.address) {
      base.receiverAddress = this.buildAddressPayload(payload.address)
    }

    return base
  }

  private buildCdPayOptions(): CDPayOptions | undefined {
    if (!this.config.payoutMethod) return undefined

    const options: CDPayOptions = {
      method: this.config.payoutMethod,
    }

    if (this.config.payoutMethod === "bank") {
      options.IBAN = this.config.payoutIban
      options.BIC = this.config.payoutBic
      options.bankCurrency = "BGN"
    }

    return options
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

