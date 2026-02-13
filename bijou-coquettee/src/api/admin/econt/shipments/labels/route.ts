import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type EcontShippingModuleService from "../../../../../modules/econt-shipping/service"
import { PDFDocument } from "pdf-lib"

/**
 * Merge multiple Econt shipment label PDFs into a single multi-page PDF.
 * POST body: { shipment_ids: string[] }
 * Returns the merged PDF as application/pdf.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    const body = req.body as { shipment_ids?: string[] }

    if (!body?.shipment_ids || !Array.isArray(body.shipment_ids) || body.shipment_ids.length === 0) {
        res.status(400).json({ message: "shipment_ids array is required." })
        return
    }

    const econtService = req.scope.resolve<EcontShippingModuleService>(
        "econtShippingModuleService"
    )

    try {
        const shipments = await econtService.listEcontShipments(
            { id: body.shipment_ids },
            { take: body.shipment_ids.length }
        )

        const labelUrls = shipments
            .filter(s => s.label_url)
            .map(s => s.label_url as string)

        console.info(`[Labels] Merging ${labelUrls.length} PDFs from ${shipments.length} shipments`)

        if (labelUrls.length === 0) {
            res.status(404).json({ message: "No shipments with labels found." })
            return
        }

        const mergedPdf = await PDFDocument.create()

        for (const url of labelUrls) {
            try {
                const response = await fetch(url)
                if (!response.ok) continue
                const pdfBytes = new Uint8Array(await response.arrayBuffer())
                const sourcePdf = await PDFDocument.load(pdfBytes)
                const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices())
                for (const page of pages) {
                    mergedPdf.addPage(page)
                }
            } catch (err) {
                console.error(`[Labels] Failed to fetch/merge PDF from ${url}:`, err)
            }
        }

        if (mergedPdf.getPageCount() === 0) {
            res.status(500).json({ message: "Failed to merge any PDFs." })
            return
        }

        const mergedBytes = await mergedPdf.save()
        const buffer = Buffer.from(mergedBytes)

        res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Length": buffer.length,
            "Content-Disposition": `inline; filename="econt-labels-${Date.now()}.pdf"`,
        })
        res.end(buffer)
    } catch (error) {
        console.error("[Labels] Error merging PDFs:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "Failed to merge labels",
        })
    }
}
