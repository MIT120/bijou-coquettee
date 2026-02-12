import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Creates the Econt Express shipping option with calculated pricing for Bulgaria.
 *
 * This script:
 * 1. Finds (or creates) a fulfillment set + service zone for Bulgaria
 * 2. Creates a shipping option with price_type: "calculated" using the econt_econt provider
 * 3. Links the fulfillment set to the existing stock location
 *
 * Run: npx medusa exec src/scripts/create-econt-shipping-option.ts
 */
export default async function createEcontShippingOption({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const storeModuleService = container.resolve(Modules.STORE)

  logger.info("Creating Econt Express shipping option...")

  // Get default store to find stock location
  const [store] = await storeModuleService.listStores()
  const stockLocationId = store?.default_location_id

  if (!stockLocationId) {
    logger.error("No default stock location found. Please seed the database first.")
    return
  }

  // Link stock location to econt fulfillment provider
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocationId,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "econt_econt",
      },
    })
    logger.info("Linked stock location to econt_econt provider.")
  } catch (err) {
    logger.warn("Stock location may already be linked to econt provider (continuing).")
  }

  // Check if Econt fulfillment set already exists
  const existingSets = await fulfillmentModuleService.listFulfillmentSets({
    name: "Econt Bulgaria Delivery",
  })

  let fulfillmentSet
  if (existingSets.length > 0) {
    fulfillmentSet = existingSets[0]
    logger.info("Econt fulfillment set already exists, reusing it.")
  } else {
    // Create a new fulfillment set for Econt Bulgaria
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Econt Bulgaria Delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Bulgaria (Econt)",
          geo_zones: [
            {
              country_code: "bg",
              type: "country",
            },
          ],
        },
      ],
    })
    logger.info("Created Econt fulfillment set for Bulgaria.")

    // Link to stock location
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocationId,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    })
    logger.info("Linked Econt fulfillment set to stock location.")
  }

  // Get or create shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })
  const shippingProfile = shippingProfiles[0]

  if (!shippingProfile) {
    logger.error("No default shipping profile found. Please seed the database first.")
    return
  }

  // Check if Econt shipping option already exists
  const existingOptions = await fulfillmentModuleService.listShippingOptions({
    name: "Econt Express",
  })

  if (existingOptions.length > 0) {
    logger.info("Econt Express shipping option already exists. Skipping creation.")
    return
  }

  // Create the calculated shipping option
  const serviceZoneId = fulfillmentSet.service_zones?.[0]?.id
  if (!serviceZoneId) {
    logger.error("No service zone found on the fulfillment set.")
    return
  }

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Econt Express",
        price_type: "calculated",
        provider_id: "econt_econt",
        service_zone_id: serviceZoneId,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Econt Express",
          description: "Econt courier delivery for Bulgaria (office or address)",
          code: "econt-express",
        },
        prices: [
          {
            currency_code: "eur",
            amount: 0,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  })

  logger.info("Successfully created Econt Express shipping option with calculated pricing.")
  logger.info("Provider ID: econt_econt")
  logger.info("Price type: calculated (price computed from Econt API at checkout)")
}
