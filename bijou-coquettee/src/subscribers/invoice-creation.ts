import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type InvoiceModuleService from "../modules/invoice/service"

type OrderPlacedPayload = {
  id: string
  cart_id?: string | null
}

/**
 * Automatically creates a draft invoice when an order is placed.
 *
 * Bulgarian regulations require invoices within 5 days of the taxable event.
 * This subscriber creates a draft so the admin can review and issue it.
 *
 * Flow:
 * 1. Order is placed -> this handler runs
 * 2. Draft invoice is created from order data
 * 3. Admin reviews in the Invoices admin page
 * 4. Admin issues the invoice (generates PDF)
 *
 * Errors are logged but never block the order flow.
 */
export default async function invoiceOrderPlacedHandler({
  event,
  container,
}: SubscriberArgs<OrderPlacedPayload>) {
  const orderId = event.data?.id

  const logger = container.resolve("logger") as {
    info: (msg: string, meta?: Record<string, unknown>) => void
    warn: (msg: string, meta?: Record<string, unknown>) => void
    error: (msg: string, meta?: Record<string, unknown>) => void
  }

  if (!orderId) {
    return
  }

  try {
    const invoiceService = container.resolve<InvoiceModuleService>(
      "invoiceModuleService"
    )

    // Check if an active invoice already exists for this order
    const existing = await invoiceService.listInvoices(
      { order_id: orderId },
      { take: 10 }
    )

    const activeInvoice = (existing as Array<Record<string, unknown>>).find(
      (inv) => inv.status !== "cancelled"
    )

    if (activeInvoice) {
      logger?.info?.("[Invoice] Draft invoice already exists for order", {
        orderId,
        invoiceId: activeInvoice.id,
      })
      return
    }

    // Fetch order data via Medusa's query
    const query = container.resolve("query") as {
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
      filters: { id: orderId },
    })

    if (!orders || orders.length === 0) {
      logger?.warn?.("[Invoice] Order not found for invoice creation", {
        orderId,
      })
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
        product_title:
          (product?.title as string) || (item.title as string) || "Артикул",
      }
    })

    // Try to find linked Econt shipment
    let econtShipmentId: string | undefined
    try {
      const econtService = container.resolve("econtShippingModuleService") as {
        listEcontShipments: (
          filter: Record<string, unknown>,
          options: Record<string, unknown>
        ) => Promise<Array<Record<string, unknown>>>
      }
      const shipments = await econtService.listEcontShipments(
        { order_id: orderId },
        { take: 1 }
      )
      if (shipments.length > 0) {
        econtShipmentId = shipments[0].id as string
      }
    } catch {
      // Econt module might not be available - that's fine
    }

    const invoice = await invoiceService.createInvoiceFromOrder({
      order_id: orderId,
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
      econt_shipment_id: econtShipmentId,
    })

    logger?.info?.("[Invoice] Draft invoice created automatically", {
      orderId,
      invoiceId: (invoice as Record<string, unknown>).id,
      invoiceNumber: (invoice as Record<string, unknown>).invoice_number,
    })
  } catch (error) {
    // Log error but never block the order flow
    logger?.error?.("[Invoice] Failed to create draft invoice for order", {
      orderId,
      error:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { message: "Unknown error" },
    })
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
