import { ExecArgs } from "@medusajs/framework/types";
import {
    ContainerRegistrationKeys,
    Modules,
} from "@medusajs/framework/utils";

/**
 * Diagnostic script to check inventory setup and see what's missing
 * 
 * Run with: npx medusa exec ./src/scripts/check-inventory-setup.ts
 */
export default async function checkInventorySetup({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const inventoryModuleService = container.resolve(Modules.INVENTORY);
    const productModuleService = container.resolve(Modules.PRODUCT);

    logger.info("=== Inventory Setup Diagnostic ===");

    // 1. Check stock locations
    logger.info("\n1. Checking stock locations...");
    const { data: stockLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id", "name", "address"],
    });

    logger.info(`Found ${stockLocations?.length || 0} stock locations:`);
    stockLocations?.forEach((loc: any) => {
        logger.info(`  - ${loc.name} (ID: ${loc.id})`);
        logger.info(`    Address: ${loc.address?.city || "N/A"}, ${loc.address?.country_code || "N/A"}`);
    });

    // 2. Check inventory items
    logger.info("\n2. Checking inventory items...");
    const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id", "sku"],
    });

    logger.info(`Found ${inventoryItems?.length || 0} inventory items`);

    // 3. Check inventory levels for Sofia location
    logger.info("\n3. Checking inventory levels...");
    const sofiaLocation = stockLocations?.find((loc: any) =>
        loc.name?.includes("Sofia") || loc.address?.city === "Sofia"
    );

    if (sofiaLocation) {
        logger.info(`Found Sofia location: ${sofiaLocation.name} (ID: ${sofiaLocation.id})`);

        const { data: sofiaLevels } = await query.graph({
            entity: "inventory_level",
            fields: ["id", "inventory_item_id", "stocked_quantity", "available_quantity"],
            filters: {
                location_id: sofiaLocation.id,
            },
        });

        logger.info(`Found ${sofiaLevels?.length || 0} inventory levels at Sofia location`);

        if (sofiaLevels && sofiaLevels.length > 0) {
            logger.info("Sample inventory levels:");
            sofiaLevels.slice(0, 5).forEach((level: any) => {
                logger.info(`  - Item ID: ${level.inventory_item_id}, Stocked: ${level.stocked_quantity}, Available: ${level.available_quantity}`);
            });
        } else {
            logger.warn("⚠️  No inventory levels found at Sofia location!");
        }
    } else {
        logger.warn("⚠️  Sofia location not found!");
    }

    // 4. Check product variants and their inventory items
    logger.info("\n4. Checking product variants...");
    const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title"],
        limit: 5,
    });

    if (products && products.length > 0) {
        logger.info(`Checking first ${products.length} products...`);

        for (const product of products) {
            const { data: variants } = await query.graph({
                entity: "product_variant",
                fields: ["id", "sku", "manage_inventory"],
                filters: {
                    product_id: product.id,
                },
            });

            if (variants && variants.length > 0) {
                logger.info(`\n  Product: ${product.title}`);
                for (const variant of variants) {
                    // Check if variant has an inventory item
                    const { data: variantInventoryItems } = await query.graph({
                        entity: "inventory_item",
                        fields: ["id", "sku"],
                        filters: {
                            sku: variant.sku,
                        },
                    });

                    logger.info(`    Variant: ${variant.sku} (manage_inventory: ${variant.manage_inventory})`);
                    if (variantInventoryItems && variantInventoryItems.length > 0) {
                        logger.info(`      ✓ Has inventory item: ${variantInventoryItems[0].id}`);

                        // Check inventory levels for this item at Sofia
                        if (sofiaLocation) {
                            const { data: itemLevels } = await query.graph({
                                entity: "inventory_level",
                                fields: ["stocked_quantity", "available_quantity"],
                                filters: {
                                    inventory_item_id: variantInventoryItems[0].id,
                                    location_id: sofiaLocation.id,
                                },
                            });

                            if (itemLevels && itemLevels.length > 0) {
                                logger.info(`      ✓ Has inventory at Sofia: ${itemLevels[0].stocked_quantity} stocked, ${itemLevels[0].available_quantity} available`);
                            } else {
                                logger.warn(`      ✗ No inventory at Sofia location for this item!`);
                            }
                        }
                    } else {
                        logger.warn(`      ✗ No inventory item found for variant ${variant.sku}`);
                    }
                }
            }
        }
    }

    // 5. Check sales channel links
    logger.info("\n5. Checking sales channel links...");
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
    const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    });

    if (defaultSalesChannel.length > 0) {
        logger.info(`Default Sales Channel: ${defaultSalesChannel[0].id}`);
        logger.info("Note: Sales channel should be linked to stock locations for inventory to be available");
        logger.info("Note: Stock locations should be linked to fulfillment sets for region-based inventory");
    } else {
        logger.warn("⚠️  Default sales channel not found!");
    }

    // 6. Check region and fulfillment setup
    logger.info("\n6. Checking region setup...");
    const { data: regions } = await query.graph({
        entity: "region",
        fields: ["id", "name", "currency_code"],
    });

    if (regions && regions.length > 0) {
        logger.info(`Found ${regions.length} regions:`);
        regions.forEach((region: any) => {
            logger.info(`  - ${region.name} (${region.currency_code})`);
        });
    }

    logger.info("\n=== Diagnostic Complete ===");
    logger.info("\nIf inventory levels exist but products show out of stock:");
    logger.info("1. Ensure stock locations are linked to sales channels");
    logger.info("2. Ensure stock locations are linked to fulfillment providers");
    logger.info("3. Verify variants have manage_inventory set correctly");
    logger.info("4. Check that the region has access to the stock location");
}

