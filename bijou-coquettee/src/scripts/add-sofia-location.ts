import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
    ContainerRegistrationKeys,
    Modules,
} from "@medusajs/framework/utils";
import {
    createInventoryLevelsWorkflow,
    createStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Script to add a stock location in Sofia, Bulgaria and assign inventory to it
 * 
 * Run with: npx medusa db:seed --file src/scripts/add-sofia-location.ts
 */
export default async function addSofiaLocation({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

    logger.info("Creating Sofia, Bulgaria stock location...");

    // Check if Sofia location already exists
    const { data: existingLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id", "name"],
        filters: {
            name: "Bijou Coquettee Sofia Warehouse",
        },
    });

    let sofiaLocation;

    if (existingLocations && existingLocations.length > 0) {
        logger.info("Sofia location already exists, using existing location...");
        sofiaLocation = existingLocations[0];
    } else {
        // Create the Sofia stock location
        const { result: stockLocationResult } = await createStockLocationsWorkflow(
            container
        ).run({
            input: {
                locations: [
                    {
                        name: "Bijou Coquettee Sofia Warehouse",
                        address: {
                            city: "Sofia",
                            country_code: "BG",
                            address_1: "bul. Vitosha 1",
                            postal_code: "1000",
                        },
                    },
                ],
            },
        });

        sofiaLocation = stockLocationResult[0];
        logger.info(`Created Sofia location with ID: ${sofiaLocation.id}`);
    }

    // Link the Sofia location to the fulfillment set
    // This is CRITICAL - in Medusa v2, stock locations must be linked to fulfillment sets
    // for inventory to be available for regions that use those fulfillment sets
    try {
        // Find the fulfillment set used by the Europe region (which includes Bulgaria)
        const { data: fulfillmentSets } = await query.graph({
            entity: "fulfillment_set",
            fields: ["id", "name"],
        });

        if (fulfillmentSets && fulfillmentSets.length > 0) {
            // Find the "European Jewelry Delivery" fulfillment set or use the first one
            const europeanFulfillmentSet = fulfillmentSets.find((fs: any) =>
                fs.name?.includes("European") || fs.name?.includes("Europe")
            ) || fulfillmentSets[0];

            await link.create({
                [Modules.STOCK_LOCATION]: {
                    stock_location_id: sofiaLocation.id,
                },
                [Modules.FULFILLMENT]: {
                    fulfillment_set_id: europeanFulfillmentSet.id,
                },
            });
            logger.info(`Linked Sofia location to fulfillment set: ${europeanFulfillmentSet.name} (${europeanFulfillmentSet.id})`);
        } else {
            logger.warn("No fulfillment sets found. Inventory may not be available for this location.");
        }
    } catch (error: any) {
        // Link might already exist, which is fine
        if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
            logger.info("Sofia location already linked to fulfillment set");
        } else {
            logger.warn(`Warning linking Sofia location to fulfillment set: ${error.message}`);
        }
    }

    // Link the Sofia location to the default sales channel
    // This ensures inventory at this location is available for the storefront
    try {
        const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
            name: "Default Sales Channel",
        });

        if (defaultSalesChannel.length > 0) {
            // Use the link service to connect sales channel to stock location
            await link.create({
                [Modules.SALES_CHANNEL]: {
                    sales_channel_id: defaultSalesChannel[0].id,
                },
                [Modules.STOCK_LOCATION]: {
                    stock_location_id: sofiaLocation.id,
                },
            });
            logger.info("Linked Sofia location to default sales channel");
        } else {
            logger.warn("Default sales channel not found, skipping sales channel link");
        }
    } catch (error: any) {
        // Link might already exist, which is fine
        if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
            logger.info("Sofia location already linked to sales channel");
        } else {
            logger.warn(`Warning linking Sofia location to sales channel: ${error.message}`);
        }
    }

    // Get all inventory items
    logger.info("Fetching all inventory items...");
    const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id"],
    });

    if (!inventoryItems || inventoryItems.length === 0) {
        logger.warn("No inventory items found. Make sure products are seeded first.");
        return;
    }

    logger.info(`Found ${inventoryItems.length} inventory items`);

    // Check which inventory items already have levels at Sofia location
    const { data: existingLevels } = await query.graph({
        entity: "inventory_level",
        fields: ["id", "inventory_item_id"],
        filters: {
            location_id: sofiaLocation.id,
        },
    });

    const existingItemIds = new Set(
        existingLevels?.map((level: any) => level.inventory_item_id) || []
    );

    // Create inventory levels for items that don't have them yet
    const inventoryLevels: CreateInventoryLevelInput[] = [];
    for (const inventoryItem of inventoryItems) {
        if (!existingItemIds.has(inventoryItem.id)) {
            inventoryLevels.push({
                location_id: sofiaLocation.id,
                stocked_quantity: 50, // Set stock to 50 for Sofia location
                inventory_item_id: inventoryItem.id,
            });
        }
    }

    if (inventoryLevels.length > 0) {
        logger.info(`Creating ${inventoryLevels.length} inventory levels for Sofia location...`);
        await createInventoryLevelsWorkflow(container).run({
            input: {
                inventory_levels: inventoryLevels,
            },
        });
        logger.info(`Successfully created ${inventoryLevels.length} inventory levels`);
    } else {
        logger.info("All inventory items already have levels at Sofia location");
    }

    logger.info("Finished adding Sofia location and inventory!");
    logger.info(`Sofia Location ID: ${sofiaLocation.id}`);
    logger.info(`Total inventory items: ${inventoryItems.length}`);
    logger.info(`Inventory levels created: ${inventoryLevels.length}`);
}

