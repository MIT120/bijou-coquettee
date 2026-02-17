import { ExecArgs } from "@medusajs/framework/types";
import {
    ContainerRegistrationKeys,
    Modules,
} from "@medusajs/framework/utils";

/**
 * Fix inventory availability - ensures stocked_quantity matches available calculation
 *
 * In Medusa v2, the `inventory_quantity` shown on storefront comes from
 * available inventory at locations linked to the sales channel.
 *
 * Run with: npx medusa exec ./src/scripts/fix-inventory-availability.ts
 */
export default async function fixInventoryAvailability({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const link = container.resolve(ContainerRegistrationKeys.LINK);
    const inventoryModuleService = container.resolve(Modules.INVENTORY);
    const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

    logger.info("=== Fixing Inventory Availability ===\n");

    // Step 1: Get all stock locations
    const { data: stockLocations } = await query.graph({
        entity: "stock_location",
        fields: ["id", "name"],
    });

    logger.info(`Found ${stockLocations?.length || 0} stock locations`);

    // Step 2: Get default sales channel
    const salesChannels = await salesChannelModuleService.listSalesChannels({});
    const defaultSalesChannel = salesChannels[0];

    if (!defaultSalesChannel) {
        logger.error("No sales channel found!");
        return;
    }

    logger.info(`Default Sales Channel: ${defaultSalesChannel.name} (${defaultSalesChannel.id})`);

    // Step 3: Ensure all stock locations are linked to sales channel
    logger.info("\nLinking stock locations to sales channel...");

    for (const location of stockLocations || []) {
        try {
            // Check if link exists
            const { data: existingLinks } = await query.graph({
                entity: "stock_location",
                fields: ["id", "sales_channels.id"],
                filters: { id: location.id },
            });

            const hasLink = existingLinks?.[0]?.sales_channels?.some(
                (sc: any) => sc.id === defaultSalesChannel.id
            );

            if (!hasLink) {
                await link.create({
                    [Modules.SALES_CHANNEL]: {
                        sales_channel_id: defaultSalesChannel.id,
                    },
                    [Modules.STOCK_LOCATION]: {
                        stock_location_id: location.id,
                    },
                });
                logger.info(`✓ Linked ${location.name} to sales channel`);
            } else {
                logger.info(`✓ ${location.name} already linked to sales channel`);
            }
        } catch (error: any) {
            if (error.message?.includes("already exists")) {
                logger.info(`✓ ${location.name} already linked`);
            } else {
                logger.warn(`⚠ Error linking ${location.name}: ${error.message}`);
            }
        }
    }

    // Step 4: Get all inventory levels and update them
    logger.info("\nUpdating inventory levels...");

    const { data: allLevels } = await query.graph({
        entity: "inventory_level",
        fields: ["id", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity"],
    });

    logger.info(`Found ${allLevels?.length || 0} inventory levels to check`);

    let updatedCount = 0;
    for (const level of allLevels || []) {
        try {
            // In Medusa, available_quantity = stocked_quantity - reserved_quantity
            // We need to ensure the inventory service calculates this correctly
            // by updating the inventory level
            const stockedQty = level.stocked_quantity || 0;
            const reservedQty = level.reserved_quantity || 0;

            // Update the inventory level to trigger recalculation
            await inventoryModuleService.updateInventoryLevels([
                {
                    id: level.id,
                    stocked_quantity: stockedQty,
                }
            ]);
            updatedCount++;
        } catch (error: any) {
            logger.warn(`⚠ Error updating level ${level.id}: ${error.message}`);
        }
    }

    logger.info(`✓ Updated ${updatedCount} inventory levels`);

    // Step 5: Verify the fix
    logger.info("\nVerifying inventory...");

    const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title", "variants.id", "variants.sku", "variants.inventory_quantity"],
        pagination: { take: 3 },
    });

    for (const product of products || []) {
        logger.info(`\nProduct: ${product.title}`);
        for (const variant of product.variants || []) {
            logger.info(`  Variant ${variant.sku}: inventory_quantity = ${variant.inventory_quantity}`);
        }
    }

    logger.info("\n=== Fix Complete ===");
    logger.info("\nIMPORTANT: You may need to:");
    logger.info("1. Clear the storefront cache: cd bijou-coquettee-storefront && rm -rf .next");
    logger.info("2. Restart the backend: npm run dev");
    logger.info("3. Restart the storefront: npm run dev");
}
