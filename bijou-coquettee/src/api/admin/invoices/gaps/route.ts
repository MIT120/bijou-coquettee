import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type InvoiceModuleService from "../../../../modules/invoice/service"

/** GET /admin/invoices/gaps — Detect gaps in invoice numbering */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const invoiceService = req.scope.resolve<InvoiceModuleService>(
      "invoiceModuleService"
    )

    const result = await invoiceService.detectInvoiceNumberGaps()
    res.json(result)
  } catch (error) {
    console.error("[Admin Invoices] Error detecting gaps:", error)
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Грешка при проверка на номерацията",
    })
  }
}
