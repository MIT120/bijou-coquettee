import { ECONT_DEFAULT_BASE_URL, EUR_TO_BGN } from "../constants"
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
  // Sender info (required for label creation)
  senderName?: string
  senderPhone?: string
  senderCity?: string
  senderPostCode?: string
  senderStreet?: string
  senderStreetNum?: string
  senderOfficeCode?: string
  // COD payout configuration
  cdAgreementNum?: string
  payoutMethod?: "bank" | "office" | "door"
  payoutIban?: string
  payoutBic?: string
}

export type CDPayOptions = {
  num?: string
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

export type EcontCalculateServicePrice = {
  type?: string
  description?: string
  count?: number
  paymentSide?: string
  price?: number
  currency?: string
}

export type EcontCalculateResult = {
  totalPrice?: number
  currency?: string
  discountPercent?: number
  discountAmount?: number
  discountDescription?: string
  senderDueAmount?: number
  receiverDueAmount?: number
  otherDueAmount?: number
  services?: EcontCalculateServicePrice[]
  expectedDeliveryDate?: string
  warnings?: string
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
    //       LabelService -> Shipments/LabelService.createLabel.json
    //       ShipmentService -> Shipments/ShipmentService.getShipmentStatuses.json
    const categoryMap: Record<string, string> = {
      LabelService: "Shipments",
      ShipmentService: "Shipments",
    }
    const serviceCategory =
      categoryMap[service] ?? service.replace("Service", "")
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

  async calculateShipment(payload: CreateShipmentPayload): Promise<EcontCalculateResult> {
    const label: Record<string, unknown> = {
      senderClient: {
        clientNumber: this.config.clientNumber,
      },
      shipmentType: "pack",
      packCount: 1,
      weight: 0.5,
      receiverClient: {
        name: `${payload.recipient.firstName} ${payload.recipient.lastName}`,
        phones: [payload.recipient.phone],
      },
    }

    // Sender address is required for Econt to calculate shipping cost
    if (this.config.senderOfficeCode) {
      label.senderOfficeCode = this.config.senderOfficeCode
    } else {
      label.senderAddress = {
        city: {
          name: this.config.senderCity || "София",
          postCode: this.config.senderPostCode || "1000",
        },
      }
    }

    // COD configuration for calculate
    // codAmount is in EUR (store currency), convert to BGN for Econt API
    if (payload.codAmount && payload.codAmount > 0) {
      const cdAmountBgn = Math.round(payload.codAmount * EUR_TO_BGN * 100) / 100
      label.services = {
        cdAmount: cdAmountBgn,
        cdType: "get",
        cdCurrency: "BGN",
      }
    }

    if (payload.deliveryType === "office" && payload.office) {
      label.receiverOfficeCode = payload.office.officeCode
    }

    if (payload.deliveryType === "address" && payload.address) {
      // For calculate, Econt only requires valid city + postCode
      label.receiverAddress = {
        city: {
          name: payload.address.city,
          postCode: payload.address.postalCode,
        },
        street: payload.address.addressLine1 || "",
        other: [
          payload.address.entrance ? `вх. ${payload.address.entrance}` : "",
          payload.address.floor ? `ет. ${payload.address.floor}` : "",
          payload.address.apartment ? `ап. ${payload.address.apartment}` : "",
          payload.address.neighborhood || "",
          payload.address.addressLine2 || "",
        ].filter(Boolean).join(", ") || undefined,
      }
    }

    const result = await this.request<{ label?: EcontCalculateResult }>(
      "LabelService",
      "createLabel",
      {
        label,
        mode: "calculate",
      }
    )

    return result.label ?? ({} as EcontCalculateResult)
  }

  async createShipment(payload: CreateShipmentPayload) {
    return this.request("LabelService", "createLabel", {
      label: this.buildShipmentPayload(payload),
      mode: "create",
    })
  }

  async deleteShipment(waybillNumber: string) {
    return this.request("LabelService", "deleteLabels", {
      shipmentNumbers: [waybillNumber],
    })
  }

  async trackShipment(waybillNumber: string) {
    return this.request<EcontTrackingResponse>("ShipmentService", "getShipmentStatuses", {
      shipmentNumbers: [waybillNumber],
      full_tracking: "ON",
    })
  }

  async trackMultipleShipments(waybillNumbers: string[]) {
    return this.request<EcontTrackingResponse>("ShipmentService", "getShipmentStatuses", {
      shipmentNumbers: waybillNumbers,
      full_tracking: "ON",
    })
  }

  private buildShipmentPayload(payload: CreateShipmentPayload) {
    // Demo defaults for when env vars aren't set
    const senderName = this.config.senderName || (this.config.isDemo ? "Bijou Coquettee" : "")
    const senderPhone = this.config.senderPhone || (this.config.isDemo ? "0888888888" : "")
    const senderCity = this.config.senderCity || "София"
    const senderPostCode = this.config.senderPostCode || "1000"
    const senderStreet = this.config.senderStreet || (this.config.isDemo ? "Витошка" : "")
    const senderStreetNum = this.config.senderStreetNum || (this.config.isDemo ? "1" : "")

    const label: Record<string, unknown> = {
      senderClient: {
        clientNumber: this.config.clientNumber || undefined,
        name: senderName,
        phones: senderPhone ? [senderPhone] : undefined,
      },
      shipmentType: "pack",
      packCount: 1,
      weight: payload.weight || 0.5,
      shipmentDescription: payload.shipmentDescription || "Бижута",
      receiverClient: {
        name: `${payload.recipient.firstName} ${payload.recipient.lastName}`,
        phones: [payload.recipient.phone],
        email: payload.recipient.email,
      },
    }

    // Sender address
    if (this.config.senderOfficeCode) {
      label.senderOfficeCode = this.config.senderOfficeCode
    } else {
      label.senderAddress = {
        city: {
          name: senderCity,
          postCode: senderPostCode,
        },
        street: senderStreet,
        num: senderStreetNum,
      }
    }

    // Order reference
    if (payload.orderId) {
      label.orderNumber = payload.orderId
    }

    // COD (Cash on Delivery / Наложен платеж) configuration
    // codAmount is in EUR (store currency), convert to BGN for Econt API
    if (payload.codAmount && payload.codAmount > 0) {
      const cdAmountBgn = Math.round(payload.codAmount * EUR_TO_BGN * 100) / 100
      const services: Record<string, unknown> = {
        cdAmount: cdAmountBgn,
        cdType: "get",
        cdCurrency: "BGN",
      }

      // CDPayOptions with agreement number or bank details
      const cdPayOptions = this.buildCdPayOptions()
      if (cdPayOptions) {
        services.cdPayOptions = cdPayOptions
      }

      label.services = services
    }

    if (payload.deliveryType === "office" && payload.office) {
      label.receiverOfficeCode = payload.office.officeCode
    }

    if (payload.deliveryType === "address" && payload.address) {
      label.receiverAddress = this.buildAddressPayload(payload.address)
    }

    return label
  }

  private buildCdPayOptions(): CDPayOptions | undefined {
    if (!this.config.cdAgreementNum && !this.config.payoutIban) return undefined

    const options: CDPayOptions = {
      method: this.config.payoutMethod || "bank",
    }

    if (this.config.cdAgreementNum) {
      options.num = this.config.cdAgreementNum
    }

    if (this.config.payoutMethod === "bank" && this.config.payoutIban) {
      options.IBAN = this.config.payoutIban
      options.BIC = this.config.payoutBic
      options.bankCurrency = "BGN"
    }

    return options
  }

  private buildAddressPayload(address: EcontAddressSelection) {
    return {
      city: {
        name: address.city,
        postCode: address.postalCode,
      },
      street: address.addressLine1 || "",
      other: [
        address.entrance ? `вх. ${address.entrance}` : "",
        address.floor ? `ет. ${address.floor}` : "",
        address.apartment ? `ап. ${address.apartment}` : "",
        address.neighborhood || "",
        address.addressLine2 || "",
      ].filter(Boolean).join(", ") || undefined,
    }
  }
}

export default EcontApiClient

