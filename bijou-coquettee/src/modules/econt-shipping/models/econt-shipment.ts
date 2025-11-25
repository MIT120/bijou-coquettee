import { model } from "@medusajs/framework/utils"
import { ECONT_SHIPPING_STATUS } from "../constants"

/**
 * Persists draft selections, created shipments, and tracking metadata for Econt deliveries.
 */
const EcontShipment = model.define("econt_shipment", {
  id: model.id().primaryKey(),
  cart_id: model.text().nullable(),
  order_id: model.text().nullable(),
  delivery_type: model.enum(["office", "address"]).default("office"),
  office_code: model.text().nullable(),
  office_name: model.text().nullable(),
  address_city: model.text().nullable(),
  address_postal_code: model.text().nullable(),
  address_line1: model.text().nullable(),
  address_line2: model.text().nullable(),
  entrance: model.text().nullable(),
  floor: model.text().nullable(),
  apartment: model.text().nullable(),
  neighborhood: model.text().nullable(),
  allow_saturday: model.boolean().default(false),
  recipient_first_name: model.text(),
  recipient_last_name: model.text(),
  recipient_phone: model.text(),
  recipient_email: model.text().nullable(),
  cod_amount: model.bigNumber().nullable(),
  status: model.enum(Object.values(ECONT_SHIPPING_STATUS)).default(
    ECONT_SHIPPING_STATUS.DRAFT
  ),
  waybill_number: model.text().nullable(),
  tracking_number: model.text().nullable(),
  label_url: model.text().nullable(),
  metadata: model.json().nullable(),
  raw_request: model.json().nullable(),
  raw_response: model.json().nullable(),
  last_synced_at: model.dateTime().nullable(),
})

export default EcontShipment

