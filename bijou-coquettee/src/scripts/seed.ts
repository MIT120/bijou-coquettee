import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/workflows-sdk";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it", "bg"];

  logger.info("Seeding Bijou Coquettee jewelry store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "eur",
          is_default: true,
        },
        {
          currency_code: "usd",
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Bijou Coquettee Atelier",
          address: {
            city: "Paris",
            country_code: "FR",
            address_1: "123 Rue de la Paix",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  // Link stock location to Econt fulfillment provider
  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "econt_econt",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  // European fulfillment set (excluding Bulgaria — Bulgaria uses Econt)
  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Jewelry Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  // Econt fulfillment set (Bulgaria only — calculated pricing from Econt API)
  const econtFulfillmentSet =
    await fulfillmentModuleService.createFulfillmentSets({
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
    });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: econtFulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      // Standard flat-rate shipping for non-BG European countries
      {
        name: "Standard Jewelry Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Secure jewelry packaging, 3-5 business days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 15,
          },
          {
            currency_code: "eur",
            amount: 15,
          },
          {
            region_id: region.id,
            amount: 15,
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
      // Express flat-rate shipping for non-BG European countries
      {
        name: "Express Jewelry Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Priority jewelry delivery, 1-2 business days.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 35,
          },
          {
            currency_code: "eur",
            amount: 35,
          },
          {
            region_id: region.id,
            amount: 35,
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
      // Econt calculated shipping for Bulgaria
      {
        name: "Econt Express",
        price_type: "calculated",
        provider_id: "econt_econt",
        service_zone_id: econtFulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Econt Express",
          description:
            "Econt courier delivery for Bulgaria (office or address)",
          code: "econt-express",
        },
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
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Bijou Coquettee Storefront",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Rings",
          is_active: true,
          description: "Elegant rings for every occasion",
        },
        {
          name: "Necklaces",
          is_active: true,
          description: "Statement necklaces and delicate chains",
        },
        {
          name: "Earrings",
          is_active: true,
          description: "Sophisticated earrings to complete your look",
        },
        {
          name: "Bracelets",
          is_active: true,
          description: "Charming bracelets and bangles",
        },
        {
          name: "Sets",
          is_active: true,
          description: "Matching jewelry sets for a complete look",
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Rose Gold Pearl Ring",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Rings")!.id,
          ],
          description:
            "A delicate rose gold ring featuring a lustrous freshwater pearl. This timeless piece adds elegance to any outfit and makes a perfect gift for special occasions.",
          handle: "rose-gold-pearl-ring",
          weight: 5,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop&crop=center",
            },
            {
              url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&crop=center",
            },
            {
              url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop&crop=center",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["5", "6", "7", "8", "9"],
            },
            {
              title: "Metal",
              values: ["Rose Gold", "Yellow Gold", "White Gold"],
            },
          ],
          variants: [
            {
              title: "5 / Rose Gold",
              sku: "RING-5-RG",
              options: {
                Size: "5",
                Metal: "Rose Gold",
              },
              prices: [
                {
                  amount: 89,
                  currency_code: "eur",
                },
                {
                  amount: 95,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "6 / Rose Gold",
              sku: "RING-6-RG",
              options: {
                Size: "6",
                Metal: "Rose Gold",
              },
              prices: [
                {
                  amount: 89,
                  currency_code: "eur",
                },
                {
                  amount: 95,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "7 / Rose Gold",
              sku: "RING-7-RG",
              options: {
                Size: "7",
                Metal: "Rose Gold",
              },
              prices: [
                {
                  amount: 89,
                  currency_code: "eur",
                },
                {
                  amount: 95,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "8 / Rose Gold",
              sku: "RING-8-RG",
              options: {
                Size: "8",
                Metal: "Rose Gold",
              },
              prices: [
                {
                  amount: 89,
                  currency_code: "eur",
                },
                {
                  amount: 95,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "9 / Rose Gold",
              sku: "RING-9-RG",
              options: {
                Size: "9",
                Metal: "Rose Gold",
              },
              prices: [
                {
                  amount: 89,
                  currency_code: "eur",
                },
                {
                  amount: 95,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Diamond Heart Necklace",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Necklaces")!.id,
          ],
          description:
            "A stunning diamond heart pendant on a delicate chain. This romantic piece features brilliant-cut diamonds and is perfect for expressing your love.",
          handle: "diamond-heart-necklace",
          weight: 8,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&crop=center",
            },
            {
              url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop&crop=center",
            },
            {
              url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop&crop=center",
            },
          ],
          options: [
            {
              title: "Chain Length",
              values: ["16 inches", "18 inches", "20 inches"],
            },
            {
              title: "Metal",
              values: ["White Gold", "Yellow Gold", "Rose Gold"],
            },
          ],
          variants: [
            {
              title: "16 inches / White Gold",
              sku: "NECKLACE-16-WG",
              options: {
                "Chain Length": "16 inches",
                Metal: "White Gold",
              },
              prices: [
                {
                  amount: 299,
                  currency_code: "eur",
                },
                {
                  amount: 325,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "18 inches / White Gold",
              sku: "NECKLACE-18-WG",
              options: {
                "Chain Length": "18 inches",
                Metal: "White Gold",
              },
              prices: [
                {
                  amount: 299,
                  currency_code: "eur",
                },
                {
                  amount: 325,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "20 inches / White Gold",
              sku: "NECKLACE-20-WG",
              options: {
                "Chain Length": "20 inches",
                Metal: "White Gold",
              },
              prices: [
                {
                  amount: 299,
                  currency_code: "eur",
                },
                {
                  amount: 325,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Pearl Drop Earrings",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Earrings")!.id,
          ],
          description:
            "Classic pearl drop earrings that exude timeless elegance. These handcrafted pieces feature lustrous freshwater pearls and are perfect for both casual and formal occasions.",
          handle: "pearl-drop-earrings",
          weight: 6,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop&crop=center",
            },
            {
              url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&crop=center",
            },
            {
              url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop&crop=center",
            },
          ],
          options: [
            {
              title: "Pearl Size",
              values: ["6mm", "8mm", "10mm"],
            },
            {
              title: "Metal",
              values: ["Sterling Silver", "Gold Plated", "Rose Gold Plated"],
            },
          ],
          variants: [
            {
              title: "6mm / Sterling Silver",
              sku: "EARRINGS-6MM-SS",
              options: {
                "Pearl Size": "6mm",
                Metal: "Sterling Silver",
              },
              prices: [
                {
                  amount: 45,
                  currency_code: "eur",
                },
                {
                  amount: 49,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "8mm / Sterling Silver",
              sku: "EARRINGS-8MM-SS",
              options: {
                "Pearl Size": "8mm",
                Metal: "Sterling Silver",
              },
              prices: [
                {
                  amount: 55,
                  currency_code: "eur",
                },
                {
                  amount: 59,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "10mm / Sterling Silver",
              sku: "EARRINGS-10MM-SS",
              options: {
                "Pearl Size": "10mm",
                Metal: "Sterling Silver",
              },
              prices: [
                {
                  amount: 65,
                  currency_code: "eur",
                },
                {
                  amount: 69,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Charm Bracelet",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Bracelets")!.id,
          ],
          description:
            "A dainty charm bracelet featuring delicate charms and a secure clasp. This versatile piece can be customized with additional charms and makes a perfect everyday accessory.",
          handle: "charm-bracelet",
          weight: 4,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop&crop=center",
            },
            {
              url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&crop=center",
            },
            {
              url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop&crop=center",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["Small (6 inches)", "Medium (7 inches)", "Large (8 inches)"],
            },
            {
              title: "Metal",
              values: ["Sterling Silver", "Gold Plated", "Rose Gold Plated"],
            },
          ],
          variants: [
            {
              title: "Small / Sterling Silver",
              sku: "BRACELET-S-SS",
              options: {
                Size: "Small (6 inches)",
                Metal: "Sterling Silver",
              },
              prices: [
                {
                  amount: 35,
                  currency_code: "eur",
                },
                {
                  amount: 39,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Medium / Sterling Silver",
              sku: "BRACELET-M-SS",
              options: {
                Size: "Medium (7 inches)",
                Metal: "Sterling Silver",
              },
              prices: [
                {
                  amount: 35,
                  currency_code: "eur",
                },
                {
                  amount: 39,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Large / Sterling Silver",
              sku: "BRACELET-L-SS",
              options: {
                Size: "Large (8 inches)",
                Metal: "Sterling Silver",
              },
              prices: [
                {
                  amount: 35,
                  currency_code: "eur",
                },
                {
                  amount: 39,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Pearl & Diamond Set",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Sets")!.id,
          ],
          description:
            "A complete jewelry set featuring a pearl necklace, matching earrings, and a coordinating bracelet. This elegant ensemble is perfect for special occasions and formal events.",
          handle: "pearl-diamond-set",
          weight: 25,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&crop=center",
            },
            {
              url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop&crop=center",
            },
            {
              url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop&crop=center",
            },
          ],
          options: [
            {
              title: "Set Size",
              values: ["Small", "Medium", "Large"],
            },
            {
              title: "Metal",
              values: ["White Gold", "Yellow Gold", "Rose Gold"],
            },
          ],
          variants: [
            {
              title: "Small / White Gold",
              sku: "SET-S-WG",
              options: {
                "Set Size": "Small",
                Metal: "White Gold",
              },
              prices: [
                {
                  amount: 599,
                  currency_code: "eur",
                },
                {
                  amount: 649,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Medium / White Gold",
              sku: "SET-M-WG",
              options: {
                "Set Size": "Medium",
                Metal: "White Gold",
              },
              prices: [
                {
                  amount: 699,
                  currency_code: "eur",
                },
                {
                  amount: 749,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Large / White Gold",
              sku: "SET-L-WG",
              options: {
                "Set Size": "Large",
                Metal: "White Gold",
              },
              prices: [
                {
                  amount: 799,
                  currency_code: "eur",
                },
                {
                  amount: 849,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 50, // Lower quantity for jewelry
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding Bijou Coquettee jewelry inventory levels data.");
}
