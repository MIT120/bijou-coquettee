import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ServiceHighlightModuleService from "../../../modules/service-highlight/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const service = req.scope.resolve<ServiceHighlightModuleService>(
            "serviceHighlightModuleService"
        )
        const highlights = await service.getAllHighlights()
        res.json({ highlights })
    } catch (error) {
        console.error("Error listing service highlights:", error)
        res.status(500).json({ error: "Failed to list service highlights" })
    }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const {
            title,
            description,
            icon_name = "shipping",
            sort_order = 0,
            is_active = true,
        } = req.body as {
            title: string
            description?: string
            icon_name?: string
            sort_order?: number
            is_active?: boolean
        }

        if (!title) {
            return res.status(400).json({
                error: "Bad Request",
                message: "title is required",
            })
        }

        const service = req.scope.resolve<ServiceHighlightModuleService>(
            "serviceHighlightModuleService"
        )

        const [highlight] = await service.createServiceHighlights([
            {
                title,
                description: description || null,
                icon_name,
                sort_order,
                is_active,
            },
        ])

        res.status(201).json({ highlight })
    } catch (error) {
        console.error("Error creating service highlight:", error)
        res.status(500).json({ error: "Failed to create service highlight" })
    }
}
