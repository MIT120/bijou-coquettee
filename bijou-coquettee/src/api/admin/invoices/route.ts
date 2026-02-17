import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type InvoiceModuleService from "../../../modules/invoice/service"

/** GET /admin/invoices — List invoices with pagination and filters */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { query } = req
  const filter: Record<string, unknown> = {}

  if (query.status && typeof query.status === "string" && query.status !== "all") {
    filter.status = query.status
  }
  if (query.order_id && typeof query.order_id === "string") {
    filter.order_id = query.order_id
  }

  const invoiceService = req.scope.resolve<InvoiceModuleService>(
    "invoiceModuleService"
  )

  const take = typeof query.limit === "string" ? Number(query.limit) : 20
  const skip = typeof query.offset === "string" ? Number(query.offset) : 0

  const [invoices, count] = await invoiceService.listAndCountInvoices(
    filter,
    {
      skip,
      take,
      order: { created_at: "DESC" },
    }
  )

  // Strip pdf_data from list response (too large)
  const stripped = invoices.map((inv: Record<string, unknown>) => {
    const { pdf_data, ...rest } = inv as Record<string, unknown>
    return { ...rest, has_pdf: !!pdf_data }
  })

  res.json({
    invoices: stripped,
    count,
    offset: skip,
    limit: take,
  })
}

/** POST /admin/invoices — Create invoice from order */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as {
    order_id: string
    buyer_name?: string
    buyer_company_name?: string
    buyer_eik?: string
    buyer_vat_number?: string
    buyer_address?: string
    buyer_city?: string
    buyer_postal_code?: string
    buyer_country?: string
    notes?: string
    vat_rate_override?: number
    prepared_by?: string
  }

  if (!body?.order_id) {
    res.status(400).json({ message: "order_id е задължително поле." })
    return
  }

  const invoiceService = req.scope.resolve<InvoiceModuleService>(
    "invoiceModuleService"
  )

  // Check for existing non-cancelled invoice for this order
  const existingInvoices = await invoiceService.listInvoices(
    { order_id: body.order_id },
    { take: 10 }
  )

  const activeInvoice = (existingInvoices as Array<Record<string, unknown>>).find(
    (inv) => inv.status !== "cancelled"
  )

  if (activeInvoice) {
    res.status(400).json({
      message: "Вече съществува фактура за тази поръчка.",
      invoice: activeInvoice,
    })
    return
  }

  try {
    // Fetch order data via Medusa's query
    const query = req.scope.resolve("query") as {
      graph: (params: {
        entity: string
        fields: string[]
        filters: Record<string, unknown>
      }) => Promise<{ data: unknown[] }>
    }

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "subtotal",
        "shipping_total",
        "total",
        "items.*",
        "items.variant.*",
        "items.variant.product.*",
        "shipping_address.*",
        "billing_address.*",
      ],
      filters: { id: body.order_id },
    })

    if (!orders || orders.length === 0) {
      res.status(404).json({ message: "Поръчката не е намерена." })
      return
    }

    const order = orders[0] as Record<string, unknown>
    const items = (order.items || []) as Array<Record<string, unknown>>
    const shippingAddr = order.shipping_address as Record<string, unknown> | null
    const billingAddr = order.billing_address as Record<string, unknown> | null

    const orderItems = items.map((item) => {
      const variant = item.variant as Record<string, unknown> | null
      const product = variant?.product as Record<string, unknown> | null
      return {
        title: (item.title as string) || "Артикул",
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        product_title: (product?.title as string) || (item.title as string) || "Артикул",
      }
    })

    const invoice = await invoiceService.createInvoiceFromOrder({
      order_id: body.order_id,
      order_email: (order.email as string) || "",
      order_items: orderItems,
      order_subtotal: Number(order.subtotal) || 0,
      order_shipping_total: Number(order.shipping_total) || 0,
      order_total: Number(order.total) || 0,
      order_currency_code: (order.currency_code as string) || "BGN",
      shipping_address: shippingAddr
        ? {
            first_name: shippingAddr.first_name as string,
            last_name: shippingAddr.last_name as string,
            company: shippingAddr.company as string,
            address_1: shippingAddr.address_1 as string,
            address_2: shippingAddr.address_2 as string,
            city: shippingAddr.city as string,
            postal_code: shippingAddr.postal_code as string,
            country_code: shippingAddr.country_code as string,
          }
        : undefined,
      billing_address: billingAddr
        ? {
            first_name: billingAddr.first_name as string,
            last_name: billingAddr.last_name as string,
            company: billingAddr.company as string,
            address_1: billingAddr.address_1 as string,
            address_2: billingAddr.address_2 as string,
            city: billingAddr.city as string,
            postal_code: billingAddr.postal_code as string,
            country_code: billingAddr.country_code as string,
          }
        : undefined,
      // Buyer overrides
      buyer_name: body.buyer_name,
      buyer_company_name: body.buyer_company_name,
      buyer_eik: body.buyer_eik,
      buyer_vat_number: body.buyer_vat_number,
      buyer_address: body.buyer_address,
      buyer_city: body.buyer_city,
      buyer_postal_code: body.buyer_postal_code,
      buyer_country: body.buyer_country,
      notes: body.notes,
      vat_rate_override: body.vat_rate_override,
      prepared_by: body.prepared_by,
    })

    res.json({ invoice })
  } catch (error) {
    console.error("[Admin Invoices] Error creating invoice:", error)
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Грешка при създаване на фактура",
    })
  }
}
