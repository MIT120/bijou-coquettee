import { model } from "@medusajs/framework/utils"

/**
 * Stores cached metadata for Econt pickup offices and address hierarchies.
 * This allows the storefront to query a local dataset instead of hitting the API on every keystroke.
 */
const EcontLocation = model.define("econt_location", {
  id: model.id().primaryKey(),
  reference_code: model.text(),
  type: model.enum(["office", "city", "street"]),
  name: model.text(),
  country_code: model.text().default("bg"),
  city: model.text().nullable(),
  address: model.text().nullable(),
  phone: model.text().nullable(),
  metadata: model.json().nullable(),
  synced_at: model.dateTime().nullable(),
})

export default EcontLocation

