import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type InvoiceModuleService from "../../../../../modules/invoice/service"

type RouteParams = { id: string }

/** GET /admin/invoices/:id/pdf — Download invoice PDF */
export async function GET(
  req: MedusaRequest<RouteParams>,
  res: MedusaResponse
) {
  const { id } = req.params

  const invoiceService = req.scope.resolve<InvoiceModuleService>(
    "invoiceModuleService"
  )

  try {
    const buffer = await invoiceService.getPdfBuffer(id)

    // Get invoice number for filename
    const [invoice] = await invoiceService.listInvoices(
      { id },
      { take: 1 }
    )
    const invoiceNumber =
      (invoice as Record<string, unknown>)?.invoice_number || id
    const safeFilename = String(invoiceNumber).replace(/[^a-zA-Z0-9_-]/g, "_")

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Length": buffer.length,
      "Content-Disposition": `inline; filename="faktura-${safeFilename}.pdf"`,
    })
    res.end(buffer)
  } catch (error) {
    console.error("[Admin Invoice PDF] Error:", error)
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Грешка при генериране на PDF",
    })
  }
}
