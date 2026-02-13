import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import * as fs from "fs"
import * as path from "path"

const SETTINGS_FILE = path.resolve(process.cwd(), "invoice-settings.json")

export type InvoiceSettings = {
  // Seller / Company info
  companyName: string
  eik: string
  vatNumber: string
  mol: string
  address: string
  city: string
  postalCode: string
  country: string
  phone: string
  email: string
  // Bank details
  bankName: string
  iban: string
  bic: string
  // Invoice numbering
  invoiceNumberPrefix: string
  nextInvoiceNumber: number
  invoiceNumberPadding: number
  // Defaults
  defaultVatRate: number
  defaultCurrency: string
  // Optional
  logoUrl: string
  footerNote: string
}

const DEFAULT_SETTINGS: InvoiceSettings = {
  companyName: "",
  eik: "",
  vatNumber: "",
  mol: "",
  address: "",
  city: "",
  postalCode: "",
  country: "България",
  phone: "",
  email: "",
  bankName: "",
  iban: "",
  bic: "",
  invoiceNumberPrefix: "",
  nextInvoiceNumber: 1,
  invoiceNumberPadding: 10,
  defaultVatRate: 20,
  defaultCurrency: "BGN",
  logoUrl: "",
  footerNote: "",
}

export function readInvoiceSettingsFile(): Partial<InvoiceSettings> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8")
      return JSON.parse(raw) as Partial<InvoiceSettings>
    }
  } catch {
    // Ignore file read errors
  }
  return {}
}

export function writeInvoiceSettingsFile(
  settings: Partial<InvoiceSettings>
): void {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8")
}

export function getEffectiveInvoiceSettings(): InvoiceSettings {
  const file = readInvoiceSettingsFile()
  return {
    companyName: file.companyName ?? DEFAULT_SETTINGS.companyName,
    eik: file.eik ?? DEFAULT_SETTINGS.eik,
    vatNumber: file.vatNumber ?? DEFAULT_SETTINGS.vatNumber,
    mol: file.mol ?? DEFAULT_SETTINGS.mol,
    address: file.address ?? DEFAULT_SETTINGS.address,
    city: file.city ?? DEFAULT_SETTINGS.city,
    postalCode: file.postalCode ?? DEFAULT_SETTINGS.postalCode,
    country: file.country ?? DEFAULT_SETTINGS.country,
    phone: file.phone ?? DEFAULT_SETTINGS.phone,
    email: file.email ?? DEFAULT_SETTINGS.email,
    bankName: file.bankName ?? DEFAULT_SETTINGS.bankName,
    iban: file.iban ?? DEFAULT_SETTINGS.iban,
    bic: file.bic ?? DEFAULT_SETTINGS.bic,
    invoiceNumberPrefix:
      file.invoiceNumberPrefix ?? DEFAULT_SETTINGS.invoiceNumberPrefix,
    nextInvoiceNumber:
      file.nextInvoiceNumber ?? DEFAULT_SETTINGS.nextInvoiceNumber,
    invoiceNumberPadding:
      file.invoiceNumberPadding ?? DEFAULT_SETTINGS.invoiceNumberPadding,
    defaultVatRate: file.defaultVatRate ?? DEFAULT_SETTINGS.defaultVatRate,
    defaultCurrency: file.defaultCurrency ?? DEFAULT_SETTINGS.defaultCurrency,
    logoUrl: file.logoUrl ?? DEFAULT_SETTINGS.logoUrl,
    footerNote: file.footerNote ?? DEFAULT_SETTINGS.footerNote,
  }
}

/** GET /admin/invoice/settings */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const settings = getEffectiveInvoiceSettings()
  res.json({ settings })
}

/** POST /admin/invoice/settings */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as Partial<InvoiceSettings>

  if (!body || typeof body !== "object") {
    res.status(400).json({ message: "Invalid settings payload." })
    return
  }

  try {
    const existing = readInvoiceSettingsFile()
    const updated: Partial<InvoiceSettings> = { ...existing }

    // Merge only sent fields
    const fields: (keyof InvoiceSettings)[] = [
      "companyName",
      "eik",
      "vatNumber",
      "mol",
      "address",
      "city",
      "postalCode",
      "country",
      "phone",
      "email",
      "bankName",
      "iban",
      "bic",
      "invoiceNumberPrefix",
      "nextInvoiceNumber",
      "invoiceNumberPadding",
      "defaultVatRate",
      "defaultCurrency",
      "logoUrl",
      "footerNote",
    ]

    for (const field of fields) {
      if (body[field] !== undefined) {
        ;(updated as Record<string, unknown>)[field] = body[field]
      }
    }

    writeInvoiceSettingsFile(updated)

    const effective = getEffectiveInvoiceSettings()
    res.json({
      settings: effective,
      message: "Настройките са запазени успешно.",
    })
  } catch (error) {
    console.error("[Admin Invoice Settings] Error saving:", error)
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to save settings.",
    })
  }
}
