import type { MedusaContainer } from "@medusajs/framework/types"
import type EcontShippingModuleService from "../modules/econt-shipping/service"
import { ECONT_SHIPPING_STATUS } from "../modules/econt-shipping/constants"
import { sendShipmentStatusEmail, buildDestinationString } from "../modules/econt-shipping/email-service"

const STATUS_LABELS: Record<string, string> = {
  draft: "Чернова",
  ready: "Готова",
  registered: "Регистрирана",
  in_transit: "В доставка",
  delivered: "Доставена",
  cancelled: "Отменена",
  error: "Грешка",
}

/**
 * Scheduled job to automatically sync Econt shipment statuses.
 * Runs every 30 minutes to update tracking information for active shipments.
 * Logs status transitions prominently so admin can monitor delivery progress.
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
    const allStatusChanges: Array<{
      shipmentId: string
      orderId: string | null
      waybill: string | null
      previousStatus: string
      newStatus: string
      recipientName: string
    }> = []

    for (let i = 0; i < shipmentsWithWaybill.length; i += batchSize) {
      const batch = shipmentsWithWaybill.slice(i, i + batchSize)
      const shipmentIds = batch.map(s => s.id)

      try {
        const { statusChanges } = await econtService.syncMultipleShipments(shipmentIds)
        syncedCount += batch.length
        allStatusChanges.push(...statusChanges)

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

    // Log status changes prominently and send email notifications
    if (allStatusChanges.length > 0) {
      logger.info(
        `[SyncEcontShipments] *** ${allStatusChanges.length} STATUS CHANGE(S) DETECTED ***`
      )

      // Fetch full shipment data for email notifications
      const changedIds = allStatusChanges.map(c => c.shipmentId)
      const changedShipments = await econtService.listEcontShipments(
        { id: changedIds },
        { take: changedIds.length }
      )
      const shipmentMap = new Map(changedShipments.map(s => [s.id, s]))

      for (const change of allStatusChanges) {
        const fromLabel = STATUS_LABELS[change.previousStatus] || change.previousStatus
        const toLabel = STATUS_LABELS[change.newStatus] || change.newStatus
        logger.info(
          `[SyncEcontShipments] Shipment ${change.waybill || change.shipmentId} ` +
          `(Order: ${change.orderId || "N/A"}, ${change.recipientName}): ` +
          `${fromLabel} -> ${toLabel}`
        )

        // Log critical transitions as warnings for higher visibility
        if (change.newStatus === "delivered") {
          logger.warn(
            `[SyncEcontShipments] DELIVERED: Shipment ${change.waybill} for ${change.recipientName} (Order: ${change.orderId})`
          )
        } else if (change.newStatus === "cancelled") {
          logger.warn(
            `[SyncEcontShipments] CANCELLED: Shipment ${change.waybill} for ${change.recipientName} (Order: ${change.orderId})`
          )
        }

        // Send email notification for status change
        const emailStatus = change.newStatus as "registered" | "in_transit" | "delivered" | "cancelled"
        if (["registered", "in_transit", "delivered", "cancelled"].includes(emailStatus)) {
          const shipment = shipmentMap.get(change.shipmentId)
          try {
            await sendShipmentStatusEmail({
              status: emailStatus,
              recipientEmail: shipment?.recipient_email ?? "",
              recipientName: change.recipientName,
              waybillNumber: change.waybill || "",
              destination: shipment ? buildDestinationString(shipment) : "N/A",
              orderId: change.orderId,
              expectedDeliveryDate: shipment?.expected_delivery_date ?? null,
            })
          } catch (emailError) {
            logger.error(
              `[SyncEcontShipments] Failed to send email for shipment ${change.waybill}: ${emailError instanceof Error ? emailError.message : "Unknown error"}`
            )
          }
        }
      }
    }

    logger.info(
      `[SyncEcontShipments] Sync complete. Synced: ${syncedCount}, Errors: ${errorCount}, Status changes: ${allStatusChanges.length}`
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
