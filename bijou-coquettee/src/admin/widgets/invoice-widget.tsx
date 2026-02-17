import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  toast,
} from "@medusajs/ui"
import {
  DocumentText,
  ArrowDownTray,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
} from "@medusajs/icons"

type OrderDetailWidgetProps = {
  data: {
    id: string
    display_id: number
    email: string
    shipping_address?: {
      first_name?: string
      last_name?: string
      phone?: string
      city?: string
      postal_code?: string
      address_1?: string
      address_2?: string
      country_code?: string
    }
    total?: number
    currency_code?: string
  }
}

type InvoiceSummary = {
  id: string
  invoice_number: string
  invoice_date: string
  status: string
  total: number
  currency_code: string
  has_pdf: boolean
  buyer_name: string
  buyer_company_name: string | null
}

// Official fixed exchange rate: 1 EUR = 1.95583 BGN (Bulgarian currency board peg)
const EUR_TO_BGN_RATE = 1.95583

const STATUS_CONFIG: Record<string, { color: "green" | "red" | "grey"; label: string }> = {
  draft: { color: "grey", label: "Чернова" },
  issued: { color: "green", label: "Издадена" },
  cancelled: { color: "red", label: "Анулирана" },
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "issued":
      return <CheckCircle className="text-ui-fg-success w-4 h-4" />
    case "cancelled":
      return <XCircle className="text-ui-fg-error w-4 h-4" />
    default:
      return <Clock className="text-ui-fg-subtle w-4 h-4" />
  }
}

const InvoiceWidget = ({ data: order }: OrderDetailWidgetProps) => {
  const [invoice, setInvoice] = useState<InvoiceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [issuing, setIssuing] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [order.id])

  const fetchInvoice = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/admin/invoices?order_id=${order.id}&limit=1`,
        { credentials: "include" }
      )
      const data = await response.json()
      if (data.invoices && data.invoices.length > 0) {
        setInvoice(data.invoices[0])
      } else {
        setInvoice(null)
      }
    } catch {
      console.error("[InvoiceWidget] Failed to fetch invoice")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const response = await fetch("/admin/invoices", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Фактура ${data.invoice?.invoice_number} е създадена`)
        await fetchInvoice()
      } else {
        toast.error(data.message || "Грешка при създаване на фактура")
      }
    } catch {
      toast.error("Грешка при създаване на фактура")
    } finally {
      setCreating(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!invoice) return
    try {
      const response = await fetch(`/admin/invoices/${invoice.id}/pdf`, {
        credentials: "include",
      })

      if (!response.ok) {
        toast.error("Грешка при генериране на PDF")
        return
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch {
      toast.error("Грешка при изтегляне на PDF")
    }
  }

  const handleIssue = async () => {
    if (!invoice) return
    setIssuing(true)
    try {
      const response = await fetch(`/admin/invoices/${invoice.id}/issue`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Фактурата е издадена")
        await fetchInvoice()
      } else {
        toast.error(data.message || "Грешка при издаване")
      }
    } catch {
      toast.error("Грешка при издаване")
    } finally {
      setIssuing(false)
    }
  }

  if (loading) {
    return (
      <Container className="p-6">
        <div className="flex items-center gap-3">
          <DocumentText className="text-ui-fg-muted w-5 h-5" />
          <Text className="text-ui-fg-muted">Зареждане на фактура...</Text>
        </div>
      </Container>
    )
  }

  // No invoice exists — show create button
  if (!invoice) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DocumentText className="text-ui-fg-muted w-5 h-5" />
            <div>
              <Heading level="h2" className="text-base">
                Фактура
              </Heading>
              <Text size="small" className="text-ui-fg-muted">
                Няма издадена фактура за тази поръчка
              </Text>
            </div>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={handleCreate}
            disabled={creating}
          >
            <Plus className="mr-1.5" />
            {creating ? "Създаване..." : "Създай фактура"}
          </Button>
        </div>
      </Container>
    )
  }

  // Invoice exists — show dual currency (EUR primary, BGN equivalent)
  const eurTotal = Number(invoice.total)
  const bgnTotal = Math.round(eurTotal * EUR_TO_BGN_RATE * 100) / 100

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <DocumentText className="text-ui-fg-muted w-5 h-5" />
          <Heading level="h2" className="text-base">
            Фактура
          </Heading>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon status={invoice.status} />
          <Badge
            color={STATUS_CONFIG[invoice.status]?.color || "grey"}
            size="small"
          >
            {STATUS_CONFIG[invoice.status]?.label || invoice.status}
          </Badge>
        </div>
      </div>

      <div className="bg-ui-bg-subtle rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Text size="small" className="text-ui-fg-muted">
            Номер
          </Text>
          <Text className="font-mono font-medium">
            {invoice.invoice_number}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text size="small" className="text-ui-fg-muted">
            Получател
          </Text>
          <Text size="small">
            {invoice.buyer_company_name || invoice.buyer_name}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text size="small" className="text-ui-fg-muted">
            Сума
          </Text>
          <div className="text-right">
            <Text className="font-medium">
              {eurTotal.toFixed(2)} EUR
            </Text>
            <Text size="xsmall" className="text-ui-fg-muted">
              ({bgnTotal.toFixed(2)} лв.)
            </Text>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Text size="small" className="text-ui-fg-muted">
            Дата
          </Text>
          <Text size="small">
            {new Date(invoice.invoice_date).toLocaleDateString("bg-BG")}
          </Text>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          variant="secondary"
          size="small"
          onClick={handleDownloadPdf}
          className="flex-1"
        >
          <ArrowDownTray className="mr-1.5" />
          Изтегли PDF
        </Button>
        {invoice.status === "draft" && (
          <Button
            size="small"
            onClick={handleIssue}
            disabled={issuing}
            className="flex-1"
          >
            <CheckCircle className="mr-1.5" />
            {issuing ? "Издаване..." : "Издай"}
          </Button>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default InvoiceWidget
