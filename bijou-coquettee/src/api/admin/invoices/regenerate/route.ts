import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type InvoiceModuleService from "../../../../modules/invoice/service"

/** POST /admin/invoices/regenerate — Regenerate all invoice PDFs (and convert BGN → EUR) */
export async function POST(_req: MedusaRequest, res: MedusaResponse) {
  const invoiceService = _req.scope.resolve<InvoiceModuleService>(
    "invoiceModuleService"
  )

  try {
    const result = await invoiceService.regenerateAllInvoices()

    res.json({
      message: `Регенерирани ${result.updated} фактури, пропуснати ${result.skipped} (анулирани).`,
      ...result,
    })
  } catch (error) {
    console.error("[Admin Invoices Regenerate] Error:", error)
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Грешка при регенериране на фактурите",
    })
  }
}
