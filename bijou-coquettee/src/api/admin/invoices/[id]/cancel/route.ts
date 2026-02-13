import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type InvoiceModuleService from "../../../../../modules/invoice/service"

type RouteParams = { id: string }

/** POST /admin/invoices/:id/cancel — Cancel an invoice */
export async function POST(
  req: MedusaRequest<RouteParams>,
  res: MedusaResponse
) {
  const { id } = req.params
  const body = req.body as { reason?: string }

  const invoiceService = req.scope.resolve<InvoiceModuleService>(
    "invoiceModuleService"
  )

  try {
    const invoice = await invoiceService.cancelInvoice(id, body?.reason)

    const { pdf_data, ...rest } = invoice as Record<string, unknown>
    res.json({
      invoice: { ...rest, has_pdf: !!pdf_data },
      message: "Фактурата е анулирана.",
    })
  } catch (error) {
    console.error("[Admin Invoice Cancel] Error:", error)
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Грешка при анулиране на фактурата",
    })
  }
}
