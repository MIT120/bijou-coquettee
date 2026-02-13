import { model } from "@medusajs/framework/utils"
import { INVOICE_STATUS } from "../constants"

const Invoice = model.define("invoice", {
  id: model.id().primaryKey(),

  // Sequential invoice number (unique per Bulgarian law)
  invoice_number: model.text(),
  invoice_date: model.dateTime(),

  // Link to Medusa order
  order_id: model.text(),

  // Seller snapshot (frozen at creation time — legally required)
  seller_company_name: model.text(),
  seller_eik: model.text(),
  seller_vat_number: model.text().nullable(),
  seller_mol: model.text(),
  seller_address: model.text(),
  seller_city: model.text(),
  seller_postal_code: model.text(),
  seller_country: model.text().default("Bulgaria"),
  seller_bank_name: model.text().nullable(),
  seller_iban: model.text().nullable(),
  seller_bic: model.text().nullable(),

  // Buyer info (per-invoice, editable in draft)
  buyer_name: model.text(),
  buyer_company_name: model.text().nullable(),
  buyer_eik: model.text().nullable(),
  buyer_vat_number: model.text().nullable(),
  buyer_address: model.text(),
  buyer_city: model.text(),
  buyer_postal_code: model.text(),
  buyer_country: model.text().default("Bulgaria"),

  // Line items (JSON array of InvoiceLineItem)
  line_items: model.json(),

  // Totals (stored as numbers — e.g. 19.99)
  subtotal: model.bigNumber(),
  vat_breakdown: model.json(), // { "20": 3.98, "9": 0.45, "0": 0 }
  total_vat: model.bigNumber(),
  total: model.bigNumber(),

  currency_code: model.text().default("BGN"),
  payment_method: model.text().nullable(),

  // Status
  status: model
    .enum(Object.values(INVOICE_STATUS))
    .default(INVOICE_STATUS.DRAFT),

  // PDF (base64-encoded)
  pdf_data: model.text().nullable(),

  // Metadata
  notes: model.text().nullable(),
  prepared_by: model.text().nullable(),
  received_by: model.text().nullable(),
  cancelled_reason: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default Invoice
