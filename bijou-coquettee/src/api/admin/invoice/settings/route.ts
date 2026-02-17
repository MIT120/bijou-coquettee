import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type InvoiceModuleService from "../../../../modules/invoice/service"
import type { InvoiceSettingsData } from "../../../../modules/invoice/service"

/** GET /admin/invoice/settings */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const invoiceService = req.scope.resolve<InvoiceModuleService>(
    "invoiceModuleService"
  )

  const settings = await invoiceService.getSettings()
  res.json({ settings })
}

/** POST /admin/invoice/settings */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as Partial<InvoiceSettingsData>

  if (!body || typeof body !== "object") {
    res.status(400).json({ message: "Invalid settings payload." })
    return
  }

  try {
    const invoiceService = req.scope.resolve<InvoiceModuleService>(
      "invoiceModuleService"
    )

    // Validate invoice number prefix if provided
    if (
      body.invoiceNumberPrefix !== undefined &&
      body.invoiceNumberPrefix !== "" &&
      !/^[A-Za-z0-9-]*$/.test(body.invoiceNumberPrefix)
    ) {
      res.status(400).json({
        message:
          "Префиксът може да съдържа само букви, цифри и тире (A-Z, 0-9, -).",
      })
      return
    }

    // Validate nextInvoiceNumber is not going backwards
    if (body.nextInvoiceNumber !== undefined) {
      const current = await invoiceService.getSettings()
      if (body.nextInvoiceNumber < current.nextInvoiceNumber) {
        res.status(400).json({
          message: `Следващият номер не може да бъде по-малък от текущия (${current.nextInvoiceNumber}). Това би създало дублирани номера.`,
        })
        return
      }
    }

    const effective = await invoiceService.saveSettings(body)
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
