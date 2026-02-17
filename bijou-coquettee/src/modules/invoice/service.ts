import { MedusaService } from "@medusajs/framework/utils"
import Invoice from "./models/invoice"
import InvoiceSettings from "./models/invoice-settings"
import { INVOICE_STATUS, VAT_RATES, bgnToEur } from "./constants"
import type { InvoiceLineItem } from "./types"
import { generateInvoicePdf } from "./pdf/generate-invoice-pdf"

const VALID_VAT_RATES = [VAT_RATES.STANDARD, VAT_RATES.REDUCED, VAT_RATES.EXEMPT] as number[]

const DEFAULT_SETTINGS_ID = "default"

export type InvoiceSettingsData = {
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
  bankName: string
  iban: string
  bic: string
  invoiceNumberPrefix: string
  nextInvoiceNumber: number
  invoiceNumberPadding: number
  defaultVatRate: number
  defaultCurrency: string
  logoUrl: string
  footerNote: string
}

const DEFAULT_SETTINGS: InvoiceSettingsData = {
  companyName: "",
  eik: "",
  vatNumber: "",
  mol: "",
  address: "",
  city: "",
  postalCode: "",
  country: "Bulgaria",
  phone: "",
  email: "",
  bankName: "",
  iban: "",
  bic: "",
  invoiceNumberPrefix: "",
  nextInvoiceNumber: 1,
  invoiceNumberPadding: 10,
  defaultVatRate: 20,
  defaultCurrency: "EUR",
  logoUrl: "",
  footerNote: "",
}

class InvoiceModuleService extends MedusaService({ Invoice, InvoiceSettings }) {
  /**
   * Get or create the singleton settings row.
   */
  async getSettings(): Promise<InvoiceSettingsData> {
    let rows: Array<Record<string, unknown>>
    try {
      rows = await this.listInvoiceSettings(
        { id: DEFAULT_SETTINGS_ID },
        { take: 1 }
      )
    } catch {
      rows = []
    }

    if (rows.length === 0) {
      // Create default settings row
      await this.createInvoiceSettings([{ id: DEFAULT_SETTINGS_ID }])
      rows = await this.listInvoiceSettings(
        { id: DEFAULT_SETTINGS_ID },
        { take: 1 }
      )
    }

    const row = rows[0] as Record<string, unknown>
    return this.dbRowToSettings(row)
  }

  /**
   * Update settings in the database.
   */
  async saveSettings(data: Partial<InvoiceSettingsData>): Promise<InvoiceSettingsData> {
    // Ensure the settings row exists
    await this.getSettings()

    const updateData: Record<string, unknown> = { id: DEFAULT_SETTINGS_ID }

    if (data.companyName !== undefined) updateData.company_name = data.companyName
    if (data.eik !== undefined) updateData.eik = data.eik
    if (data.vatNumber !== undefined) updateData.vat_number = data.vatNumber
    if (data.mol !== undefined) updateData.mol = data.mol
    if (data.address !== undefined) updateData.address = data.address
    if (data.city !== undefined) updateData.city = data.city
    if (data.postalCode !== undefined) updateData.postal_code = data.postalCode
    if (data.country !== undefined) updateData.country = data.country
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.email !== undefined) updateData.email = data.email
    if (data.bankName !== undefined) updateData.bank_name = data.bankName
    if (data.iban !== undefined) updateData.iban = data.iban
    if (data.bic !== undefined) updateData.bic = data.bic
    if (data.invoiceNumberPrefix !== undefined) updateData.invoice_number_prefix = data.invoiceNumberPrefix
    if (data.nextInvoiceNumber !== undefined) updateData.next_invoice_number = data.nextInvoiceNumber
    if (data.invoiceNumberPadding !== undefined) updateData.invoice_number_padding = data.invoiceNumberPadding
    if (data.defaultVatRate !== undefined) updateData.default_vat_rate = data.defaultVatRate
    if (data.defaultCurrency !== undefined) updateData.default_currency = data.defaultCurrency
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl
    if (data.footerNote !== undefined) updateData.footer_note = data.footerNote

    await this.updateInvoiceSettings([updateData])

    return this.getSettings()
  }

  /**
   * Get the next sequential invoice number and atomically increment it.
   * Uses UPDATE ... SET next_invoice_number = next_invoice_number + 1
   * to avoid race conditions.
   */
  async getNextInvoiceNumber(): Promise<string> {
    const settings = await this.getSettings()
    const num = settings.nextInvoiceNumber
    const prefix = settings.invoiceNumberPrefix || ""
    const padding = settings.invoiceNumberPadding || 10

    // Atomically increment — MedusaService update is safe at the ORM level,
    // and the unique constraint on invoice_number prevents duplicates even
    // in the unlikely case of a concurrent update.
    await this.updateInvoiceSettings([{
      id: DEFAULT_SETTINGS_ID,
      next_invoice_number: num + 1,
    }])

    return `${prefix}${String(num).padStart(padding, "0")}`
  }

  /**
   * Create an invoice from order data.
   * The caller (API route) is responsible for fetching order details
   * and passing them via the input parameter.
   */
  async createInvoiceFromOrder(input: {
    order_id: string
    // Order data (passed by the API route)
    order_email: string
    order_items: Array<{
      title: string
      quantity: number
      unit_price: number
      product_title?: string
    }>
    order_subtotal: number
    order_shipping_total: number
    order_total: number
    order_currency_code: string
    order_payment_method?: string
    shipping_address?: {
      first_name?: string
      last_name?: string
      company?: string
      address_1?: string
      address_2?: string
      city?: string
      postal_code?: string
      country_code?: string
    }
    billing_address?: {
      first_name?: string
      last_name?: string
      company?: string
      address_1?: string
      address_2?: string
      city?: string
      postal_code?: string
      country_code?: string
    }
    // Buyer overrides (from admin form)
    buyer_name?: string
    buyer_company_name?: string
    buyer_eik?: string
    buyer_vat_number?: string
    buyer_address?: string
    buyer_city?: string
    buyer_postal_code?: string
    buyer_country?: string
    // Other
    notes?: string
    vat_rate_override?: number
    prepared_by?: string
    // Econt link
    econt_shipment_id?: string
  }) {
    const settings = await this.getSettings()

    // Validate that required seller info is configured
    const requiredFields = ["companyName", "eik", "mol", "address", "city"] as const
    for (const field of requiredFields) {
      if (!settings[field]) {
        throw new Error(
          `Настройките за фактури са непълни: липсва "${field}".`
        )
      }
    }

    const vatRate = input.vat_rate_override ?? settings.defaultVatRate

    // Validate VAT rate (Bulgarian law: 0%, 9%, or 20%)
    if (!VALID_VAT_RATES.includes(vatRate)) {
      throw new Error(
        `Невалидна ДДС ставка: ${vatRate}%. Допустими: 0%, 9%, 20%.`
      )
    }

    // Validate B2B: if buyer company name is provided, EIK is required
    if (input.buyer_company_name && !input.buyer_eik) {
      throw new Error(
        "За фактури към юридически лица е задължително да се посочи ЕИК."
      )
    }

    const invoiceNumber = await this.getNextInvoiceNumber()

    // Determine if we need to convert from BGN to EUR.
    // Invoice is always stored in EUR; BGN equivalent is computed at PDF time
    // using the fixed exchange rate (1 EUR = 1.95583 BGN).
    const orderCurrency = input.order_currency_code?.toUpperCase() || "EUR"
    const toEur = (amount: number): number =>
      orderCurrency === "BGN" ? bgnToEur(amount) : amount

    // Build line items from order
    // Medusa v2 graph query returns amounts in major units (e.g. 65.00 EUR)
    const lineItems: InvoiceLineItem[] = input.order_items.map((item) => {
      const unitPrice = toEur(item.unit_price)
      const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100
      const vatAmount =
        Math.round(((lineTotal * vatRate) / 100) * 100) / 100

      return {
        description: item.product_title || item.title,
        quantity: item.quantity,
        unit_price: unitPrice,
        vat_rate: vatRate,
        line_total: lineTotal,
        vat_amount: vatAmount,
      }
    })

    // Add shipping as a line item if applicable
    if (input.order_shipping_total > 0) {
      const shippingTotal = toEur(input.order_shipping_total)
      const shippingVat =
        Math.round(((shippingTotal * vatRate) / 100) * 100) / 100

      lineItems.push({
        description: "Доставка",
        quantity: 1,
        unit_price: shippingTotal,
        vat_rate: vatRate,
        line_total: shippingTotal,
        vat_amount: shippingVat,
      })
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0)
    const totalVat = lineItems.reduce((sum, item) => sum + item.vat_amount, 0)
    const total = Math.round((subtotal + totalVat) * 100) / 100

    // Build VAT breakdown
    const vatBreakdown: Record<string, number> = {}
    for (const item of lineItems) {
      const rateKey = String(item.vat_rate)
      vatBreakdown[rateKey] = (vatBreakdown[rateKey] || 0) + item.vat_amount
    }
    // Round all values
    for (const key of Object.keys(vatBreakdown)) {
      vatBreakdown[key] = Math.round(vatBreakdown[key] * 100) / 100
    }

    // Determine buyer info from order address or overrides
    const addr = input.billing_address || input.shipping_address
    const buyerName =
      input.buyer_name ||
      [addr?.first_name, addr?.last_name].filter(Boolean).join(" ") ||
      input.order_email

    const countryMap: Record<string, string> = {
      bg: "България",
      de: "Германия",
      at: "Австрия",
      fr: "Франция",
      it: "Италия",
      es: "Испания",
      gb: "Великобритания",
      us: "САЩ",
    }

    // Use Bulgarian timezone for the invoice date
    const bgDateStr = new Date().toLocaleDateString("en-CA", {
      timeZone: "Europe/Sofia",
    }) // YYYY-MM-DD
    const invoiceDate = new Date(bgDateStr + "T00:00:00+02:00")

    const invoiceData = {
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      order_id: input.order_id,
      // Seller snapshot
      seller_company_name: settings.companyName,
      seller_eik: settings.eik,
      seller_vat_number: settings.vatNumber || null,
      seller_mol: settings.mol,
      seller_address: settings.address,
      seller_city: settings.city,
      seller_postal_code: settings.postalCode,
      seller_country: settings.country,
      seller_bank_name: settings.bankName || null,
      seller_iban: settings.iban || null,
      seller_bic: settings.bic || null,
      // Buyer
      buyer_name: buyerName,
      buyer_company_name: input.buyer_company_name || addr?.company || null,
      buyer_eik: input.buyer_eik || null,
      buyer_vat_number: input.buyer_vat_number || null,
      buyer_address:
        input.buyer_address ||
        [addr?.address_1, addr?.address_2].filter(Boolean).join(", ") ||
        "",
      buyer_city: input.buyer_city || addr?.city || "",
      buyer_postal_code: input.buyer_postal_code || addr?.postal_code || "",
      buyer_country:
        input.buyer_country ||
        countryMap[addr?.country_code?.toLowerCase() || ""] ||
        addr?.country_code ||
        "България",
      // Items & totals
      line_items: lineItems as any,
      subtotal,
      vat_breakdown: vatBreakdown,
      total_vat: Math.round(totalVat * 100) / 100,
      total,
      // Invoice is always in EUR; BGN equivalent shown on PDF via fixed rate
      currency_code: "EUR",
      payment_method: input.order_payment_method || null,
      // Status
      status: INVOICE_STATUS.DRAFT,
      // Other
      notes: input.notes || null,
      prepared_by: input.prepared_by || settings.mol || null,
      received_by: null,
      pdf_data: null,
      metadata: null,
      // Econt link
      econt_shipment_id: input.econt_shipment_id || null,
    }

    const [invoice] = await this.createInvoices([invoiceData])

    return invoice
  }

  /**
   * Issue an invoice — changes status from draft to issued and generates PDF.
   */
  async issueInvoice(invoiceId: string) {
    const [invoice] = await this.listInvoices(
      { id: invoiceId },
      { take: 1 }
    )

    if (!invoice) {
      throw new Error("Фактурата не е намерена.")
    }

    if (invoice.status !== INVOICE_STATUS.DRAFT) {
      throw new Error(
        `Фактурата не може да бъде издадена. Текущ статус: ${invoice.status}`
      )
    }

    // Generate PDF
    const pdfBytes = await this.generatePdfForInvoice(invoice)
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64")

    // Update status and store PDF
    const [updated] = await this.updateInvoices([
      {
        id: invoiceId,
        status: INVOICE_STATUS.ISSUED,
        pdf_data: pdfBase64,
      },
    ])

    return updated
  }

  /**
   * Cancel an invoice (cannot delete per Bulgarian law).
   */
  async cancelInvoice(invoiceId: string, reason?: string) {
    const [invoice] = await this.listInvoices(
      { id: invoiceId },
      { take: 1 }
    )

    if (!invoice) {
      throw new Error("Фактурата не е намерена.")
    }

    if (invoice.status === INVOICE_STATUS.CANCELLED) {
      throw new Error("Фактурата вече е анулирана.")
    }

    const [updated] = await this.updateInvoices([
      {
        id: invoiceId,
        status: INVOICE_STATUS.CANCELLED,
        cancelled_reason: reason || null,
      },
    ])

    return updated
  }

  /**
   * Generate PDF for an invoice (or return cached).
   */
  async getPdfBuffer(invoiceId: string): Promise<Buffer> {
    const [invoice] = await this.listInvoices(
      { id: invoiceId },
      { take: 1 }
    )

    if (!invoice) {
      throw new Error("Фактурата не е намерена.")
    }

    // If we already have a cached PDF, return it
    if (invoice.pdf_data) {
      return Buffer.from(invoice.pdf_data, "base64")
    }

    // Generate fresh PDF
    const pdfBytes = await this.generatePdfForInvoice(invoice)
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64")

    // Cache it
    await this.updateInvoices([
      { id: invoiceId, pdf_data: pdfBase64 },
    ])

    return Buffer.from(pdfBytes)
  }

  /**
   * Migrate existing BGN invoices to EUR and regenerate all PDFs.
   * Converts stored amounts from BGN to EUR using the fixed rate,
   * then regenerates the PDF with dual-currency display.
   * Returns the count of invoices updated.
   */
  async regenerateAllInvoices(): Promise<{ updated: number; skipped: number }> {
    const allInvoices = await this.listInvoices(
      {},
      { take: 1000, order: { created_at: "ASC" } }
    )

    let updated = 0
    let skipped = 0

    for (const inv of allInvoices as Array<Record<string, unknown>>) {
      const invoiceId = inv.id as string

      if (inv.status === INVOICE_STATUS.CANCELLED) {
        skipped++
        continue
      }

      // If the invoice is still in BGN, convert amounts to EUR
      if ((inv.currency_code as string)?.toUpperCase() === "BGN") {
        const lineItems = (inv.line_items as InvoiceLineItem[]).map((item) => ({
          ...item,
          unit_price: bgnToEur(item.unit_price),
          line_total: bgnToEur(item.line_total),
          vat_amount: bgnToEur(item.vat_amount),
        }))

        const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0)
        const totalVat = lineItems.reduce((sum, item) => sum + item.vat_amount, 0)
        const total = Math.round((subtotal + totalVat) * 100) / 100

        const vatBreakdown: Record<string, number> = {}
        for (const item of lineItems) {
          const rateKey = String(item.vat_rate)
          vatBreakdown[rateKey] = (vatBreakdown[rateKey] || 0) + item.vat_amount
        }
        for (const key of Object.keys(vatBreakdown)) {
          vatBreakdown[key] = Math.round(vatBreakdown[key] * 100) / 100
        }

        await this.updateInvoices([{
          id: invoiceId,
          line_items: lineItems as any,
          subtotal: Math.round(subtotal * 100) / 100,
          total_vat: Math.round(totalVat * 100) / 100,
          total,
          vat_breakdown: vatBreakdown,
          currency_code: "EUR",
          pdf_data: null,
        }])
      } else {
        // Just clear the cached PDF so it regenerates with new template
        await this.updateInvoices([{ id: invoiceId, pdf_data: null }])
      }

      // Re-fetch to get updated data and generate fresh PDF
      const [freshInvoice] = await this.listInvoices(
        { id: invoiceId },
        { take: 1 }
      )

      const pdfBytes = await this.generatePdfForInvoice(
        freshInvoice as Record<string, unknown>
      )
      const pdfBase64 = Buffer.from(pdfBytes).toString("base64")

      await this.updateInvoices([{ id: invoiceId, pdf_data: pdfBase64 }])
      updated++
    }

    return { updated, skipped }
  }

  /**
   * Detect gaps in invoice numbering sequence.
   * Returns list of missing invoice numbers.
   */
  async detectInvoiceNumberGaps(): Promise<{
    gaps: string[]
    total_invoices: number
    first_number: string | null
    last_number: string | null
  }> {
    const allInvoices = await this.listInvoices(
      {},
      { take: 10000, order: { created_at: "ASC" } }
    )

    if (allInvoices.length === 0) {
      return { gaps: [], total_invoices: 0, first_number: null, last_number: null }
    }

    const settings = await this.getSettings()
    const prefix = settings.invoiceNumberPrefix || ""
    const padding = settings.invoiceNumberPadding || 10

    // Extract numeric parts from invoice numbers
    const numbers: number[] = []
    for (const inv of allInvoices as Array<Record<string, unknown>>) {
      const invoiceNum = inv.invoice_number as string
      // Strip prefix and parse the number
      const numStr = prefix ? invoiceNum.replace(prefix, "") : invoiceNum
      const num = parseInt(numStr, 10)
      if (!isNaN(num)) {
        numbers.push(num)
      }
    }

    if (numbers.length === 0) {
      return { gaps: [], total_invoices: allInvoices.length, first_number: null, last_number: null }
    }

    numbers.sort((a, b) => a - b)

    const gaps: string[] = []
    for (let i = 0; i < numbers.length - 1; i++) {
      const current = numbers[i]
      const next = numbers[i + 1]
      for (let missing = current + 1; missing < next; missing++) {
        gaps.push(`${prefix}${String(missing).padStart(padding, "0")}`)
      }
    }

    const formatNum = (n: number) => `${prefix}${String(n).padStart(padding, "0")}`

    return {
      gaps,
      total_invoices: allInvoices.length,
      first_number: formatNum(numbers[0]),
      last_number: formatNum(numbers[numbers.length - 1]),
    }
  }

  /**
   * Internal: generate PDF bytes from invoice data.
   */
  private async generatePdfForInvoice(invoice: Record<string, unknown>): Promise<Uint8Array> {
    const settings = await this.getSettings()

    return generateInvoicePdf({
      invoice_number: invoice.invoice_number as string,
      invoice_date: String(invoice.invoice_date),
      seller_company_name: invoice.seller_company_name as string,
      seller_eik: invoice.seller_eik as string,
      seller_vat_number: (invoice.seller_vat_number as string) || null,
      seller_mol: invoice.seller_mol as string,
      seller_address: invoice.seller_address as string,
      seller_city: invoice.seller_city as string,
      seller_postal_code: invoice.seller_postal_code as string,
      seller_country: invoice.seller_country as string,
      seller_bank_name: (invoice.seller_bank_name as string) || null,
      seller_iban: (invoice.seller_iban as string) || null,
      seller_bic: (invoice.seller_bic as string) || null,
      buyer_name: invoice.buyer_name as string,
      buyer_company_name: (invoice.buyer_company_name as string) || null,
      buyer_eik: (invoice.buyer_eik as string) || null,
      buyer_vat_number: (invoice.buyer_vat_number as string) || null,
      buyer_address: invoice.buyer_address as string,
      buyer_city: invoice.buyer_city as string,
      buyer_postal_code: invoice.buyer_postal_code as string,
      buyer_country: invoice.buyer_country as string,
      line_items: invoice.line_items as InvoiceLineItem[],
      subtotal: Number(invoice.subtotal),
      vat_breakdown: invoice.vat_breakdown as Record<string, number>,
      total_vat: Number(invoice.total_vat),
      total: Number(invoice.total),
      currency_code: invoice.currency_code as string,
      payment_method: (invoice.payment_method as string) || null,
      notes: (invoice.notes as string) || null,
      prepared_by: (invoice.prepared_by as string) || null,
      received_by: (invoice.received_by as string) || null,
      footer_note: settings.footerNote || null,
    })
  }

  /**
   * Convert a DB row to the InvoiceSettingsData shape used by the API.
   */
  private dbRowToSettings(row: Record<string, unknown>): InvoiceSettingsData {
    return {
      companyName: (row.company_name as string) || DEFAULT_SETTINGS.companyName,
      eik: (row.eik as string) || DEFAULT_SETTINGS.eik,
      vatNumber: (row.vat_number as string) || DEFAULT_SETTINGS.vatNumber,
      mol: (row.mol as string) || DEFAULT_SETTINGS.mol,
      address: (row.address as string) || DEFAULT_SETTINGS.address,
      city: (row.city as string) || DEFAULT_SETTINGS.city,
      postalCode: (row.postal_code as string) || DEFAULT_SETTINGS.postalCode,
      country: (row.country as string) || DEFAULT_SETTINGS.country,
      phone: (row.phone as string) || DEFAULT_SETTINGS.phone,
      email: (row.email as string) || DEFAULT_SETTINGS.email,
      bankName: (row.bank_name as string) || DEFAULT_SETTINGS.bankName,
      iban: (row.iban as string) || DEFAULT_SETTINGS.iban,
      bic: (row.bic as string) || DEFAULT_SETTINGS.bic,
      invoiceNumberPrefix: (row.invoice_number_prefix as string) ?? DEFAULT_SETTINGS.invoiceNumberPrefix,
      nextInvoiceNumber: (row.next_invoice_number as number) ?? DEFAULT_SETTINGS.nextInvoiceNumber,
      invoiceNumberPadding: (row.invoice_number_padding as number) ?? DEFAULT_SETTINGS.invoiceNumberPadding,
      defaultVatRate: (row.default_vat_rate as number) ?? DEFAULT_SETTINGS.defaultVatRate,
      defaultCurrency: (row.default_currency as string) || DEFAULT_SETTINGS.defaultCurrency,
      logoUrl: (row.logo_url as string) ?? DEFAULT_SETTINGS.logoUrl,
      footerNote: (row.footer_note as string) ?? DEFAULT_SETTINGS.footerNote,
    }
  }
}

export default InvoiceModuleService
