import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type InvoiceModuleService from "../../../../modules/invoice/service"

type RouteParams = { id: string }

/** GET /admin/invoices/:id — Get invoice details */
export async function GET(
  req: MedusaRequest<RouteParams>,
  res: MedusaResponse
) {
  const { id } = req.params

  const invoiceService = req.scope.resolve<InvoiceModuleService>(
    "invoiceModuleService"
  )

  const [invoice] = await invoiceService.listInvoices(
    { id },
    { take: 1 }
  )

  if (!invoice) {
    res.status(404).json({ message: "Фактурата не е намерена." })
    return
  }

  // Strip pdf_data from response
  const { pdf_data, ...rest } = invoice as Record<string, unknown>
  res.json({ invoice: { ...rest, has_pdf: !!pdf_data } })
}

/** PATCH /admin/invoices/:id — Update invoice (draft only) */
export async function PATCH(
  req: MedusaRequest<RouteParams>,
  res: MedusaResponse
) {
  const { id } = req.params
  const body = req.body as {
    buyer_name?: string
    buyer_company_name?: string
    buyer_eik?: string
    buyer_vat_number?: string
    buyer_address?: string
    buyer_city?: string
    buyer_postal_code?: string
    buyer_country?: string
    notes?: string
    prepared_by?: string
    received_by?: string
    payment_method?: string
  }

  const invoiceService = req.scope.resolve<InvoiceModuleService>(
    "invoiceModuleService"
  )

  const [invoice] = await invoiceService.listInvoices(
    { id },
    { take: 1 }
  )

  if (!invoice) {
    res.status(404).json({ message: "Фактурата не е намерена." })
    return
  }

  if ((invoice as Record<string, unknown>).status !== "draft") {
    res.status(400).json({
      message: "Само фактури в състояние 'чернова' могат да бъдат редактирани.",
    })
    return
  }

  try {
    const updateData: Record<string, unknown> = { id }

    const allowedFields = [
      "buyer_name",
      "buyer_company_name",
      "buyer_eik",
      "buyer_vat_number",
      "buyer_address",
      "buyer_city",
      "buyer_postal_code",
      "buyer_country",
      "notes",
      "prepared_by",
      "received_by",
      "payment_method",
    ]

    for (const field of allowedFields) {
      if ((body as Record<string, unknown>)[field] !== undefined) {
        updateData[field] = (body as Record<string, unknown>)[field]
      }
    }

    // Clear cached PDF when editing
    updateData.pdf_data = null

    const [updated] = await invoiceService.updateInvoices([updateData])

    const { pdf_data: _pd, ...rest } = updated as Record<string, unknown>
    res.json({ invoice: { ...rest, has_pdf: false } })
  } catch (error) {
    console.error("[Admin Invoice] Error updating:", error)
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Грешка при обновяване",
    })
  }
}
