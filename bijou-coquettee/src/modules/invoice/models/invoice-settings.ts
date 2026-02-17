import { model } from "@medusajs/framework/utils"

const InvoiceSettings = model.define("invoice_settings", {
  id: model.id().primaryKey(),

  // Seller / Company info
  company_name: model.text().default(""),
  eik: model.text().default(""),
  vat_number: model.text().default(""),
  mol: model.text().default(""),
  address: model.text().default(""),
  city: model.text().default(""),
  postal_code: model.text().default(""),
  country: model.text().default("Bulgaria"),
  phone: model.text().default(""),
  email: model.text().default(""),

  // Bank details
  bank_name: model.text().default(""),
  iban: model.text().default(""),
  bic: model.text().default(""),

  // Invoice numbering
  invoice_number_prefix: model.text().default(""),
  next_invoice_number: model.number().default(1),
  invoice_number_padding: model.number().default(10),

  // Defaults
  default_vat_rate: model.number().default(20),
  default_currency: model.text().default("EUR"),

  // Optional
  logo_url: model.text().default(""),
  footer_note: model.text().default(""),
})

export default InvoiceSettings
