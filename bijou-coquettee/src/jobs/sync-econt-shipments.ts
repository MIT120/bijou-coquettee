import type { MedusaContainer } from "@medusajs/framework/types"
import type EcontShippingModuleService from "../modules/econt-shipping/service"
import { ECONT_SHIPPING_STATUS } from "../modules/econt-shipping/constants"

/**
 * Scheduled job to automatically sync Econt shipment statuses.
 * Runs every 30 minutes to update tracking information for active shipments.
 */
export default async function syncEcontShipments(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const econtService = container.resolve<EcontShippingModuleService>(
    "econtShippingModuleService"
  )

  logger.info("[SyncEcontShipments] Starting automatic shipment status sync...")

  try {
    // Get all shipments that need syncing:
    // - Have a waybill number (registered with Econt)
    // - Not in terminal states (delivered, cancelled)
    const shipments = await econtService.listEcontShipments(
      {
        status: [
          ECONT_SHIPPING_STATUS.REGISTERED,
          ECONT_SHIPPING_STATUS.IN_TRANSIT,
          ECONT_SHIPPING_STATUS.READY,
        ],
      },
      {
        take: 100,
        order: { updated_at: "ASC" }, // Prioritize oldest updates
      }
    )

    const shipmentsWithWaybill = shipments.filter(s => s.waybill_number)

    if (shipmentsWithWaybill.length === 0) {
      logger.info("[SyncEcontShipments] No active shipments to sync.")
      return
    }

    logger.info(
      `[SyncEcontShipments] Found ${shipmentsWithWaybill.length} shipments to sync.`
    )

    // Sync in batches of 20 to avoid overwhelming the API
    const batchSize = 20
    let syncedCount = 0
    let errorCount = 0

    for (let i = 0; i < shipmentsWithWaybill.length; i += batchSize) {
      const batch = shipmentsWithWaybill.slice(i, i + batchSize)
      const shipmentIds = batch.map(s => s.id)

      try {
        await econtService.syncMultipleShipments(shipmentIds)
        syncedCount += batch.length
        logger.info(
          `[SyncEcontShipments] Synced batch ${Math.floor(i / batchSize) + 1}: ${batch.length} shipments`
        )
      } catch (error) {
        errorCount += batch.length
        logger.error(
          `[SyncEcontShipments] Error syncing batch: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      }

      // Small delay between batches to be nice to the API
      if (i + batchSize < shipmentsWithWaybill.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    logger.info(
      `[SyncEcontShipments] Sync complete. Synced: ${syncedCount}, Errors: ${errorCount}`
    )
  } catch (error) {
    logger.error(
      `[SyncEcontShipments] Failed to sync shipments: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

export const config = {
  name: "sync-econt-shipments",
  // Run every 30 minutes
  schedule: "*/30 * * * *",
}
