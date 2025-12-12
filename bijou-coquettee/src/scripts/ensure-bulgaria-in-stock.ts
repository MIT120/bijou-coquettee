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
 * Migration/Script to ensure ALL products are in stock and available for shipping in Bulgaria
 * 
 * This script:
 * 1. Creates or finds the Sofia, Bulgaria stock location
 * 2. Ensures it's linked to fulfillment sets and sales channels
 * 3. Creates inventory levels for all products at Sofia location (if missing)
 * 4. Updates existing inventory levels to ensure they have stock (minimum 100)
 * 
 * Run with: npx medusa exec ./src/scripts/ensure-bulgaria-in-stock.ts
 */
export default async function ensureBulgariaInStock({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const inventoryModuleService = container.resolve(Modules.INVENTORY);
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

    logger.info("=== Ensuring All Products In Stock for Bulgaria ===");
    logger.info("This will set inventory levels at Sofia location for all products\n");

    // ============================================
    // Step 1: Find or Create Sofia Location
    // ============================================
    logger.info("Step 1: Setting up Sofia stock location...");
    const { data: existingLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id", "name", "address"],
        filters: {
            name: "Bijou Coquettee Sofia Warehouse",
        },
    });

    let sofiaLocation;

    if (existingLocations && existingLocations.length > 0) {
        logger.info(`✓ Sofia location already exists: ${existingLocations[0].name} (ID: ${existingLocations[0].id})`);
        sofiaLocation = existingLocations[0];
    } else {
        logger.info("Creating Sofia stock location...");
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
        logger.info(`✓ Created Sofia location: ${sofiaLocation.name} (ID: ${sofiaLocation.id})`);
    }

    // ============================================
    // Step 2: Link Sofia Location to Fulfillment Set
    // ============================================
    logger.info("\nStep 2: Linking Sofia location to fulfillment sets...");
    try {
        const { data: fulfillmentSets } = await query.graph({
            entity: "fulfillment_set",
            fields: ["id", "name"],
        });

        if (fulfillmentSets && fulfillmentSets.length > 0) {
            // Find European fulfillment set or use the first one
            const europeanFulfillmentSet = fulfillmentSets.find((fs: any) =>
                fs.name?.includes("European") || fs.name?.includes("Europe") || fs.name?.includes("Bulgaria")
            ) || fulfillmentSets[0];

            // Check if link already exists
            const { data: existingLinks } = await query.graph({
                entity: "fulfillment_set_stock_location",
                fields: ["id"],
                filters: {
                    stock_location_id: sofiaLocation.id,
                    fulfillment_set_id: europeanFulfillmentSet.id,
                },
            });

            if (!existingLinks || existingLinks.length === 0) {
                await link.create({
                    [Modules.STOCK_LOCATION]: {
                        stock_location_id: sofiaLocation.id,
                    },
                    [Modules.FULFILLMENT]: {
                        fulfillment_set_id: europeanFulfillmentSet.id,
                    },
                });
                logger.info(`✓ Linked Sofia location to fulfillment set: ${europeanFulfillmentSet.name}`);
            } else {
                logger.info(`✓ Sofia location already linked to fulfillment set: ${europeanFulfillmentSet.name}`);
            }
        } else {
            logger.warn("⚠ No fulfillment sets found. Inventory may not be available for this location.");
        }
    } catch (error: any) {
        if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
            logger.info("✓ Sofia location already linked to fulfillment set");
        } else {
            logger.warn(`⚠ Warning linking Sofia location to fulfillment set: ${error.message}`);
        }
    }

    // ============================================
    // Step 3: Link Sofia Location to Sales Channel
    // ============================================
    logger.info("\nStep 3: Linking Sofia location to sales channels...");
    try {
        const salesChannels = await salesChannelModuleService.listSalesChannels({});

        if (salesChannels && salesChannels.length > 0) {
            // Link to all sales channels to ensure availability
            for (const salesChannel of salesChannels) {
                try {
                    // Check if link already exists
                    const { data: existingLinks } = await query.graph({
                        entity: "sales_channel_stock_location",
                        fields: ["id"],
                        filters: {
                            stock_location_id: sofiaLocation.id,
                            sales_channel_id: salesChannel.id,
                        },
                    });

                    if (!existingLinks || existingLinks.length === 0) {
                        await link.create({
                            [Modules.SALES_CHANNEL]: {
                                sales_channel_id: salesChannel.id,
                            },
                            [Modules.STOCK_LOCATION]: {
                                stock_location_id: sofiaLocation.id,
                            },
                        });
                        logger.info(`✓ Linked Sofia location to sales channel: ${salesChannel.name}`);
                    } else {
                        logger.info(`✓ Sofia location already linked to sales channel: ${salesChannel.name}`);
                    }
                } catch (error: any) {
                    if (!error.message?.includes("already exists") && !error.message?.includes("duplicate")) {
                        logger.warn(`⚠ Warning linking to sales channel ${salesChannel.name}: ${error.message}`);
                    }
                }
            }
        } else {
            logger.warn("⚠ No sales channels found.");
        }
    } catch (error: any) {
        logger.warn(`⚠ Warning linking Sofia location to sales channels: ${error.message}`);
    }

    // ============================================
    // Step 4: Get All Inventory Items
    // ============================================
    logger.info("\nStep 4: Fetching all inventory items...");
    const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id", "sku"],
    });

    if (!inventoryItems || inventoryItems.length === 0) {
        logger.warn("⚠ No inventory items found. Make sure products are seeded first.");
        return;
    }

    logger.info(`✓ Found ${inventoryItems.length} inventory items`);

    // ============================================
    // Step 5: Get Existing Inventory Levels at Sofia
    // ============================================
    logger.info("\nStep 5: Checking existing inventory levels at Sofia location...");
    const { data: existingLevels } = await query.graph({
        entity: "inventory_level",
        fields: ["id", "inventory_item_id", "stocked_quantity", "available_quantity"],
        filters: {
            location_id: sofiaLocation.id,
        },
    });

    const existingLevelsMap = new Map(
        existingLevels?.map((level: any) => [level.inventory_item_id, level]) || []
    );

    logger.info(`✓ Found ${existingLevelsMap.size} existing inventory levels at Sofia location`);

    // ============================================
    // Step 6: Create or Update Inventory Levels
    // ============================================
    logger.info("\nStep 6: Ensuring all products have stock at Sofia location...");

    const MIN_STOCK_QUANTITY = 100; // Set minimum stock to 100 for all products
    const itemsToCreate: CreateInventoryLevelInput[] = [];
    const itemsToUpdate: Array<{ id: string; inventory_item_id: string }> = [];

    for (const inventoryItem of inventoryItems) {
        const existingLevel = existingLevelsMap.get(inventoryItem.id);

        if (!existingLevel) {
            // Create new inventory level
            itemsToCreate.push({
                location_id: sofiaLocation.id,
                stocked_quantity: MIN_STOCK_QUANTITY,
                inventory_item_id: inventoryItem.id,
            });
        } else if (existingLevel.stocked_quantity < MIN_STOCK_QUANTITY) {
            // Mark for update if it's below minimum
            itemsToUpdate.push({
                id: existingLevel.id,
                inventory_item_id: inventoryItem.id,
            });
        }
    }

    // For items that need updating, delete and recreate to ensure proper stock
    if (itemsToUpdate.length > 0) {
        logger.info(`Updating ${itemsToUpdate.length} inventory levels that are below minimum...`);
        const levelIdsToDelete = itemsToUpdate.map(item => item.id);

        try {
            await inventoryModuleService.deleteInventoryLevels(levelIdsToDelete);
            logger.info(`✓ Deleted ${levelIdsToDelete.length} inventory levels for recreation`);

            // Add them to the create list
            for (const itemToUpdate of itemsToUpdate) {
                itemsToCreate.push({
                    location_id: sofiaLocation.id,
                    stocked_quantity: MIN_STOCK_QUANTITY,
                    inventory_item_id: itemToUpdate.inventory_item_id,
                });
            }
        } catch (error: any) {
            logger.warn(`⚠ Warning deleting inventory levels: ${error.message}`);
            logger.info(`   Will attempt to create new levels anyway (may fail if duplicates exist)`);
        }
    }

    // Create all inventory levels (new ones + recreated ones)
    if (itemsToCreate.length > 0) {
        logger.info(`Creating ${itemsToCreate.length} inventory levels...`);
        try {
            await createInventoryLevelsWorkflow(container).run({
                input: {
                    inventory_levels: itemsToCreate,
                },
            });
            logger.info(`✓ Created ${itemsToCreate.length} inventory levels with stock of ${MIN_STOCK_QUANTITY}`);
        } catch (error: any) {
            // Some might fail if they already exist, which is fine
            if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
                logger.info(`✓ Some inventory levels already exist (this is expected)`);
            } else {
                logger.warn(`⚠ Warning creating inventory levels: ${error.message}`);
            }
        }
    } else {
        logger.info("✓ All inventory items already have adequate stock at Sofia location");
    }

    // ============================================
    // Step 7: Summary
    // ============================================
    logger.info("\n=== Summary ===");
    logger.info(`Sofia Location ID: ${sofiaLocation.id}`);
    logger.info(`Total inventory items: ${inventoryItems.length}`);
    logger.info(`Inventory levels processed: ${itemsToCreate.length}`);
    logger.info(`Minimum stock quantity: ${MIN_STOCK_QUANTITY} units per item`);
    logger.info("\n✓ All products should now be in stock and available for shipping in Bulgaria!");
    logger.info("\nNext steps:");
    logger.info("1. Verify in admin UI: Inventory → Stock Locations → Sofia");
    logger.info("2. Check a product page in storefront - 'Add to cart' button should be enabled");
    logger.info("3. Run diagnostic: npx medusa exec ./src/scripts/check-inventory-setup.ts");
    logger.info("\nNote: If some products still show 'Out of stock', verify:");
    logger.info("   - Product variants have 'manage_inventory' set to true");
    logger.info("   - Sofia location is linked to the fulfillment set used by your region");
    logger.info("   - Clear storefront cache: cd bijou-coquettee-storefront && rm -rf .next");
}

