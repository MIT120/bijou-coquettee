import { Resend } from "resend"

type ShipmentEmailParams = {
  status: "registered" | "in_transit" | "delivered" | "cancelled"
  recipientEmail: string
  recipientName: string
  waybillNumber: string
  destination: string
  orderId?: string | null
  expectedDeliveryDate?: string | null
}

const STATUS_CONFIG: Record<
  ShipmentEmailParams["status"],
  { subject: (waybill: string) => string; heading: string; message: (params: ShipmentEmailParams) => string; color: string }
> = {
  registered: {
    subject: (w) => `Пратката ви е регистрирана - ${w}`,
    heading: "Пратката ви е регистрирана",
    message: (p) =>
      `Вашата поръчка е предадена на Еконт за доставка.` +
      `<br/><br/>Товарителница: <strong>${p.waybillNumber}</strong>` +
      `<br/>Доставка до: <strong>${p.destination}</strong>` +
      (p.expectedDeliveryDate
        ? `<br/>Очаквана доставка: <strong>${p.expectedDeliveryDate}</strong>`
        : "") +
      `<br/><br/>Можете да следите пратката си на сайта на Еконт с номер на товарителницата.`,
    color: "#3b82f6",
  },
  in_transit: {
    subject: (w) => `Пратката ви е в доставка - ${w}`,
    heading: "Пратката ви е на път",
    message: (p) =>
      `Вашата пратка е в процес на доставка.` +
      `<br/><br/>Товарителница: <strong>${p.waybillNumber}</strong>` +
      `<br/>Доставка до: <strong>${p.destination}</strong>` +
      (p.expectedDeliveryDate
        ? `<br/>Очаквана доставка: <strong>${p.expectedDeliveryDate}</strong>`
        : "") +
      `<br/><br/>Моля, бъдете на посочения адрес за получаване на пратката.`,
    color: "#f59e0b",
  },
  delivered: {
    subject: (w) => `Пратката ви е доставена - ${w}`,
    heading: "Пратката ви е доставена",
    message: (p) =>
      `Вашата пратка беше успешно доставена.` +
      `<br/><br/>Товарителница: <strong>${p.waybillNumber}</strong>` +
      `<br/>Доставка до: <strong>${p.destination}</strong>` +
      `<br/><br/>Благодарим ви, че пазарувахте от Bijou Coquettee!` +
      `<br/>Надяваме се да ви харесат нашите бижута.`,
    color: "#22c55e",
  },
  cancelled: {
    subject: (w) => `Пратката ви е отменена - ${w}`,
    heading: "Пратката ви е отменена",
    message: (p) =>
      `Вашата пратка беше отменена.` +
      `<br/><br/>Товарителница: <strong>${p.waybillNumber}</strong>` +
      `<br/><br/>Ако имате въпроси, моля свържете се с нас на имейл или телефон.`,
    color: "#ef4444",
  },
}

function buildHtml(params: ShipmentEmailParams): string {
  const config = STATUS_CONFIG[params.status]
  const body = config.message(params)

  return `<!DOCTYPE html>
<html lang="bg">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr><td style="background:${config.color};padding:32px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">${config.heading}</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
            Здравейте, <strong>${params.recipientName}</strong>!
          </p>
          <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
            ${body}
          </p>
          ${params.orderId ? `<p style="margin:0;color:#6b7280;font-size:13px;">Поръчка: ${params.orderId}</p>` : ""}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #e5e7eb;background:#f9fafb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
            Bijou Coquettee | bijou-coquettee.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

let resendInstance: Resend | null = null

function getResend(): Resend | null {
  if (resendInstance) return resendInstance
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  resendInstance = new Resend(apiKey)
  return resendInstance
}

export async function sendShipmentStatusEmail(
  params: ShipmentEmailParams
): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.warn(
      "[EcontEmail] RESEND_API_KEY not set - skipping email notification"
    )
    return false
  }

  if (!params.recipientEmail) {
    console.warn(
      `[EcontEmail] No recipient email for shipment ${params.waybillNumber} - skipping`
    )
    return false
  }

  const config = STATUS_CONFIG[params.status]
  if (!config) {
    console.warn(`[EcontEmail] Unknown status "${params.status}" - skipping`)
    return false
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "orders@bijou-coquettee.com"

  try {
    await resend.emails.send({
      from: `Bijou Coquettee <${fromEmail}>`,
      to: params.recipientEmail,
      subject: config.subject(params.waybillNumber),
      html: buildHtml(params),
    })
    console.info(
      `[EcontEmail] Sent "${params.status}" email to ${params.recipientEmail} for shipment ${params.waybillNumber}`
    )
    return true
  } catch (error) {
    console.error(
      `[EcontEmail] Failed to send "${params.status}" email to ${params.recipientEmail}:`,
      error instanceof Error ? error.message : error
    )
    return false
  }
}

export function buildDestinationString(shipment: {
  delivery_type: string
  office_name?: string | null
  office_code?: string | null
  address_city?: string | null
  address_line1?: string | null
}): string {
  if (shipment.delivery_type === "office") {
    return shipment.office_name
      ? `Офис Еконт: ${shipment.office_name}`
      : `Офис Еконт: ${shipment.office_code || "N/A"}`
  }
  const parts = [shipment.address_line1, shipment.address_city].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "Адрес"
}
