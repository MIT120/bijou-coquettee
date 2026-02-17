import { MedusaService } from "@medusajs/framework/utils"
import Invoice from "./models/invoice"
import { INVOICE_STATUS } from "./constants"
import type { CreateInvoiceInput, InvoiceLineItem } from "./types"
import {
  readInvoiceSettingsFile,
  writeInvoiceSettingsFile,
  getEffectiveInvoiceSettings,
} from "../../api/admin/invoice/settings/route"
import { generateInvoicePdf } from "./pdf/generate-invoice-pdf"

class InvoiceModuleService extends MedusaService({ Invoice }) {
  /**
   * Get the next sequential invoice number and atomically increment it.
   */
  async getNextInvoiceNumber(): Promise<string> {
    const settings = getEffectiveInvoiceSettings()
    const num = settings.nextInvoiceNumber
    const prefix = settings.invoiceNumberPrefix || ""
    const padding = settings.invoiceNumberPadding || 10

    // Increment and save
    const file = readInvoiceSettingsFile()
    file.nextInvoiceNumber = num + 1
    writeInvoiceSettingsFile(file)

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
  }) {
    const settings = getEffectiveInvoiceSettings()
    const invoiceNumber = await this.getNextInvoiceNumber()
    const vatRate =
      input.vat_rate_override ?? settings.defaultVatRate

    // Build line items from order
    // Medusa v2 graph query returns amounts in major units (e.g. 65.00 EUR)
    const lineItems: InvoiceLineItem[] = input.order_items.map((item) => {
      const unitPrice = item.unit_price
      const lineTotal = unitPrice * item.quantity
      const vatAmount =
        Math.round(((lineTotal * vatRate) / 100) * 100) / 100

      return {
        description: item.product_title || item.title,
        quantity: item.quantity,
        unit_price: unitPrice,
        vat_rate: vatRate,
        line_total: Math.round(lineTotal * 100) / 100,
        vat_amount: vatAmount,
      }
    })

    // Add shipping as a line item if applicable
    if (input.order_shipping_total > 0) {
      const shippingTotal = input.order_shipping_total
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

    const invoiceData = {
      invoice_number: invoiceNumber,
      invoice_date: new Date(),
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
      currency_code:
        input.order_currency_code?.toUpperCase() ||
        settings.defaultCurrency,
      payment_method: input.order_payment_method || null,
      // Status
      status: INVOICE_STATUS.DRAFT,
      // Other
      notes: input.notes || null,
      prepared_by: input.prepared_by || settings.mol || null,
      received_by: null,
      pdf_data: null,
      metadata: null,
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
   * Internal: generate PDF bytes from invoice data.
   */
  private async generatePdfForInvoice(invoice: Record<string, unknown>): Promise<Uint8Array> {
    const settings = getEffectiveInvoiceSettings()

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
}

export default InvoiceModuleService
