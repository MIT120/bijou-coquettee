import {
  AbstractFulfillmentProviderService,
} from "@medusajs/framework/utils"
import type {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CreateFulfillmentResult,
  CreateShippingOptionDTO,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  ValidateFulfillmentDataContext,
} from "@medusajs/framework/types"
import type { Logger } from "@medusajs/framework/types"
import type EcontShippingModuleService from "../econt-shipping/service"

/**
 * Fixed BGN to EUR exchange rate.
 * Bulgaria's currency board pegs BGN to EUR at this rate since 1999.
 * This rate is guaranteed by law and will remain fixed until Bulgaria adopts the EUR.
 */
const BGN_EUR_RATE = 1.9558

type InjectedDependencies = {
  logger: Logger
  econtShippingModuleService: EcontShippingModuleService
}

class EcontFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "econt"

  private logger: Logger
  private econtService: EcontShippingModuleService

  constructor({ logger, econtShippingModuleService }: InjectedDependencies) {
    super()
    this.logger = logger
    this.econtService = econtShippingModuleService
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      { id: "econt-express", name: "Econt Express" },
    ]
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    _context: ValidateFulfillmentDataContext
  ): Promise<Record<string, unknown>> {
    return data
  }

  async validateOption(_data: Record<string, unknown>): Promise<boolean> {
    return true
  }

  async canCalculate(_data: CreateShippingOptionDTO): Promise<boolean> {
    return true
  }

  async calculatePrice(
    _optionData: CalculateShippingOptionPriceDTO["optionData"],
    _data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    const cartId = context?.id

    if (!cartId) {
      this.logger.warn("[EcontFulfillment] No cart ID in context, returning 0")
      return { calculated_amount: 0, is_calculated_price_tax_inclusive: true }
    }

    try {
      const preference = await this.econtService.getCartPreference(cartId)

      if (!preference) {
        // No Econt preference saved yet — customer hasn't filled the form.
        // Return 0; the price will be recalculated once they save preferences.
        return { calculated_amount: 0, is_calculated_price_tax_inclusive: true }
      }

      let shippingCostBgn: number | null = null
      let currency: string = "BGN"

      // Use persisted cost if available (set by /store/econt/calculate route)
      if (preference.shipping_cost != null && Number(preference.shipping_cost) > 0) {
        shippingCostBgn = Number(preference.shipping_cost)
        currency = preference.shipping_cost_currency || "BGN"
      } else {
        // Calculate on the fly
        try {
          const result = await this.econtService.calculateShipment(cartId)
          shippingCostBgn = result.totalPrice ?? null
          currency = result.currency ?? "BGN"

          // Persist for future calls
          if (shippingCostBgn != null) {
            await this.econtService.updateEcontShipments([
              {
                id: preference.id,
                shipping_cost: shippingCostBgn,
                shipping_cost_currency: currency,
              },
            ])
          }
        } catch (calcError) {
          this.logger.warn(
            `[EcontFulfillment] Failed to calculate shipment for cart ${cartId}: ${calcError}`
          )
          return { calculated_amount: 0, is_calculated_price_tax_inclusive: true }
        }
      }

      if (shippingCostBgn == null || shippingCostBgn <= 0) {
        return { calculated_amount: 0, is_calculated_price_tax_inclusive: true }
      }

      // Convert BGN to EUR using the fixed exchange rate
      // Econt returns major units (e.g. 7.50 BGN)
      // Medusa expects minor units (cents) for the calculated_amount
      let amountInMinorUnits: number
      if (currency.toUpperCase() === "BGN") {
        const eurAmount = shippingCostBgn / BGN_EUR_RATE
        amountInMinorUnits = Math.round(eurAmount * 100)
      } else if (currency.toUpperCase() === "EUR") {
        amountInMinorUnits = Math.round(shippingCostBgn * 100)
      } else {
        // Fallback: treat as EUR
        amountInMinorUnits = Math.round(shippingCostBgn * 100)
      }

      return {
        calculated_amount: amountInMinorUnits,
        is_calculated_price_tax_inclusive: true,
      }
    } catch (error) {
      this.logger.error(
        `[EcontFulfillment] Error calculating price for cart ${cartId}: ${error}`
      )
      return { calculated_amount: 0, is_calculated_price_tax_inclusive: true }
    }
  }

  async createFulfillment(
    _data: Record<string, unknown>,
    _items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    _order: Partial<FulfillmentOrderDTO> | undefined,
    _fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
    // Actual Econt shipment creation is handled by the econt-shipment subscriber
    return { data: {}, labels: [] }
  }

  async cancelFulfillment(_data: Record<string, unknown>): Promise<any> {
    // Cancellation is handled by the econt-shipping module
    return {}
  }

  async createReturnFulfillment(
    _fulfillment: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    return { data: {}, labels: [] }
  }

  async getFulfillmentDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  async getReturnDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  async getShipmentDocuments(_data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  async retrieveDocuments(
    _fulfillmentData: Record<string, unknown>,
    _documentType: string
  ): Promise<void> {
    return
  }
}

export default EcontFulfillmentService
