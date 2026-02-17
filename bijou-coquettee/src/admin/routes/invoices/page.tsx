import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState, useCallback } from "react"
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Select,
  Table,
  IconButton,
  DropdownMenu,
  Label,
  Checkbox,
  clx,
  toast,
} from "@medusajs/ui"
import {
  DocumentText,
  ArrowPath,
  EllipsisHorizontal,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  Clock,
  ArrowDownTray,
  Eye,
  PencilSquare,
  Plus,
} from "@medusajs/icons"

type Invoice = {
  id: string
  invoice_number: string
  invoice_date: string
  order_id: string
  buyer_name: string
  buyer_company_name: string | null
  buyer_eik: string | null
  buyer_vat_number: string | null
  buyer_address: string
  buyer_city: string
  buyer_postal_code: string
  buyer_country: string
  subtotal: number
  total_vat: number
  total: number
  currency_code: string
  status: string
  has_pdf: boolean
  notes: string | null
  prepared_by: string | null
  received_by: string | null
  cancelled_reason: string | null
  created_at: string
  updated_at: string
}

const STATUS_CONFIG: Record<
  string,
  { color: "green" | "red" | "grey"; label: string }
> = {
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

// Official fixed exchange rate: 1 EUR = 1.95583 BGN (Bulgarian currency board peg)
const EUR_TO_BGN_RATE = 1.95583

const formatMoney = (amount: number, _currency: string): string => {
  const eur = Number(amount)
  const bgn = Math.round(eur * EUR_TO_BGN_RATE * 100) / 100
  return `${eur.toFixed(2)} EUR (${bgn.toFixed(2)} лв.)`
}

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString("bg-BG")
  } catch {
    return dateStr
  }
}

// ── Create Invoice Drawer ──
const CreateInvoiceDrawer = ({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}) => {
  const [orderId, setOrderId] = useState("")
  const [buyerName, setBuyerName] = useState("")
  const [buyerCompanyName, setBuyerCompanyName] = useState("")
  const [buyerEik, setBuyerEik] = useState("")
  const [buyerVatNumber, setBuyerVatNumber] = useState("")
  const [buyerAddress, setBuyerAddress] = useState("")
  const [buyerCity, setBuyerCity] = useState("")
  const [buyerPostalCode, setBuyerPostalCode] = useState("")
  const [vatRate, setVatRate] = useState("20")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!orderId.trim()) {
      toast.error("Моля въведете ID на поръчката.")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/admin/invoices", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId.trim(),
          buyer_name: buyerName || undefined,
          buyer_company_name: buyerCompanyName || undefined,
          buyer_eik: buyerEik || undefined,
          buyer_vat_number: buyerVatNumber || undefined,
          buyer_address: buyerAddress || undefined,
          buyer_city: buyerCity || undefined,
          buyer_postal_code: buyerPostalCode || undefined,
          vat_rate_override: Number(vatRate),
          notes: notes || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(
          `Фактура ${data.invoice?.invoice_number} е създадена.`
        )
        onCreated()
        onClose()
        // Reset form
        setOrderId("")
        setBuyerName("")
        setBuyerCompanyName("")
        setBuyerEik("")
        setBuyerVatNumber("")
        setBuyerAddress("")
        setBuyerCity("")
        setBuyerPostalCode("")
        setNotes("")
      } else {
        toast.error(data.message || "Грешка при създаване")
      }
    } catch {
      toast.error("Грешка при създаване на фактура")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg bg-ui-bg-base shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-ui-bg-base border-b border-ui-border-base px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Heading level="h2">Нова фактура</Heading>
            <Text size="small" className="text-ui-fg-muted">
              Създайте фактура от съществуваща поръчка
            </Text>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={onClose}
            className="flex-shrink-0"
          >
            Затвори
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Order ID */}
          <div className="space-y-2">
            <Label>ID на поръчката *</Label>
            <Input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="order_01J..."
            />
            <Text size="xsmall" className="text-ui-fg-muted">
              Копирайте ID-то от страницата на поръчката
            </Text>
          </div>

          {/* Buyer Info */}
          <div className="space-y-4">
            <Text className="font-medium">
              Данни за получател (незадължително — ще се попълнят от поръчката)
            </Text>

            <div className="space-y-2">
              <Label>Име на получател</Label>
              <Input
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Автоматично от поръчката"
              />
            </div>

            <div className="bg-ui-bg-subtle rounded-lg p-4 space-y-3">
              <Text size="small" className="font-medium text-ui-fg-muted">
                Фирмени данни (за B2B фактури)
              </Text>

              <div className="space-y-2">
                <Label>Наименование на фирма</Label>
                <Input
                  value={buyerCompanyName}
                  onChange={(e) => setBuyerCompanyName(e.target.value)}
                  placeholder="Фирма ЕООД"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>ЕИК</Label>
                  <Input
                    value={buyerEik}
                    onChange={(e) => setBuyerEik(e.target.value)}
                    placeholder="123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ДДС номер</Label>
                  <Input
                    value={buyerVatNumber}
                    onChange={(e) => setBuyerVatNumber(e.target.value)}
                    placeholder="BG123456789"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Адрес</Label>
                <Input
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="Автоматично"
                />
              </div>
              <div className="space-y-2">
                <Label>Град</Label>
                <Input
                  value={buyerCity}
                  onChange={(e) => setBuyerCity(e.target.value)}
                  placeholder="Автоматично"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Пощенски код</Label>
              <Input
                value={buyerPostalCode}
                onChange={(e) => setBuyerPostalCode(e.target.value)}
                placeholder="Автоматично"
              />
            </div>
          </div>

          {/* VAT Rate */}
          <div className="space-y-2">
            <Label>ДДС ставка</Label>
            <Select value={vatRate} onValueChange={setVatRate}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="20">20% (стандартна)</Select.Item>
                <Select.Item value="9">9% (намалена)</Select.Item>
                <Select.Item value="0">0% (освободена)</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Забележки (незадължително)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Допълнителни бележки"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-ui-border-base flex gap-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Отказ
            </Button>
            <Button onClick={handleCreate} disabled={saving} className="flex-1">
              {saving ? "Създаване..." : "Създай фактура"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 20

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filters — default to "active" to hide cancelled invoices
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [searchQuery, setSearchQuery] = useState("")

  // Drawers
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false)

  // Gap detection
  const [gapResult, setGapResult] = useState<{
    gaps: string[]
    total_invoices: number
    first_number: string | null
    last_number: string | null
  } | null>(null)
  const [gapLoading, setGapLoading] = useState(false)

  const handleCheckGaps = async () => {
    setGapLoading(true)
    try {
      const response = await fetch("/admin/invoices/gaps", {
        credentials: "include",
      })
      const data = await response.json()
      if (response.ok) {
        setGapResult(data)
        if (data.gaps.length === 0) {
          toast.success("Няма пропуснати номера на фактури")
        }
      } else {
        toast.error(data.message || "Грешка при проверка")
      }
    } catch {
      toast.error("Грешка при проверка на номерацията")
    } finally {
      setGapLoading(false)
    }
  }

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter === "active") {
        params.set("status", "draft,issued")
      } else if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }
      params.set("limit", String(PAGE_SIZE))
      params.set("offset", String(currentPage * PAGE_SIZE))

      const response = await fetch(
        `/admin/invoices?${params.toString()}`,
        { credentials: "include" }
      )
      const data = await response.json()
      setInvoices(data.invoices || [])
      setTotalCount(data.count ?? 0)
    } catch {
      toast.error("Грешка при зареждане на фактури")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, currentPage])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [invoices])

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.buyer_name?.toLowerCase().includes(q) ||
      inv.buyer_company_name?.toLowerCase().includes(q) ||
      inv.order_id?.toLowerCase().includes(q) ||
      inv.buyer_eik?.includes(q)
    )
  })

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredInvoices.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredInvoices.map((i) => i.id)))
    }
  }

  const handleDownloadPdf = async (invoice: Invoice) => {
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

  const handleIssue = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/admin/invoices/${invoice.id}/issue`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Фактурата е издадена успешно")
        await fetchInvoices()
      } else {
        toast.error(data.message || "Грешка при издаване")
      }
    } catch {
      toast.error("Грешка при издаване на фактурата")
    }
  }

  const handleCancel = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/admin/invoices/${invoice.id}/cancel`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Фактурата е анулирана")
        await fetchInvoices()
      } else {
        toast.error(data.message || "Грешка при анулиране")
      }
    } catch {
      toast.error("Грешка при анулиране на фактурата")
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const canPreviousPage = currentPage > 0
  const canNextPage = currentPage < totalPages - 1

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <DocumentText className="text-ui-fg-subtle w-6 h-6 flex-shrink-0" />
          <div>
            <Heading level="h1">Фактури</Heading>
            <Text size="small" className="text-ui-fg-muted">
              Издаване и управление на фактури
            </Text>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={handleCheckGaps}
            disabled={gapLoading}
            className="w-full sm:w-auto"
          >
            {gapLoading ? "Проверка..." : "Проверка номерация"}
          </Button>
          <Button onClick={() => setCreateDrawerOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2" />
            Нова фактура
          </Button>
        </div>
      </div>

      {/* Gap Detection Result */}
      {gapResult && gapResult.gaps.length > 0 && (
        <div className="px-4 sm:px-6 py-3 bg-ui-tag-orange-bg border-b border-ui-border-base">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Text className="font-medium text-ui-tag-orange-text">
                Открити {gapResult.gaps.length} пропуснати номера
              </Text>
              <Text size="small" className="text-ui-tag-orange-text mt-1">
                {gapResult.gaps.slice(0, 10).join(", ")}
                {gapResult.gaps.length > 10 && ` и още ${gapResult.gaps.length - 10}...`}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted mt-1">
                Обхват: {gapResult.first_number} - {gapResult.last_number} ({gapResult.total_invoices} фактури)
              </Text>
            </div>
            <Button
              variant="transparent"
              size="small"
              onClick={() => setGapResult(null)}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 sm:max-w-sm">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted w-4 h-4" />
            <Input
              placeholder="Търси по номер, получател..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val)
            setCurrentPage(0)
          }}
        >
          <Select.Trigger className="w-full sm:w-48">
            <Select.Value placeholder="Всички статуси" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="active">Активни (чернови + издадени)</Select.Item>
            <Select.Item value="all">Всички статуси</Select.Item>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <Select.Item key={key} value={key}>
                {config.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {/* Table / Cards */}
      <div className="px-4 sm:px-6 py-4">
        {loading ? (
          <div className="text-center py-12">
            <ArrowPath className="w-8 h-8 mx-auto animate-spin text-ui-fg-muted" />
            <Text className="mt-2 text-ui-fg-muted">Зареждане...</Text>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <DocumentText className="w-12 h-12 mx-auto text-ui-fg-muted mb-4" />
            <Text className="text-ui-fg-muted">
              Няма намерени фактури
            </Text>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setCreateDrawerOpen(true)}
            >
              <Plus className="mr-2" />
              Създай първата фактура
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="w-10">
                      <Checkbox
                        checked={
                          filteredInvoices.length > 0 &&
                          selectedIds.size === filteredInvoices.length
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </Table.HeaderCell>
                    <Table.HeaderCell>Номер</Table.HeaderCell>
                    <Table.HeaderCell>Дата</Table.HeaderCell>
                    <Table.HeaderCell>Получател</Table.HeaderCell>
                    <Table.HeaderCell>Поръчка</Table.HeaderCell>
                    <Table.HeaderCell>Статус</Table.HeaderCell>
                    <Table.HeaderCell>Сума</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredInvoices.map((invoice) => (
                    <Table.Row
                      key={invoice.id}
                      className={clx(
                        "cursor-pointer hover:bg-ui-bg-subtle",
                        selectedIds.has(invoice.id) &&
                          "bg-ui-bg-subtle-hover",
                        invoice.status === "cancelled" &&
                          "opacity-50"
                      )}
                      onClick={() => handleDownloadPdf(invoice)}
                    >
                      <Table.Cell
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.has(invoice.id)}
                          onCheckedChange={() =>
                            toggleSelect(invoice.id)
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <Text className="font-mono font-medium">
                            {invoice.invoice_number}
                          </Text>
                          {invoice.has_pdf && (
                            <a
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadPdf(invoice)
                              }}
                              className="inline-flex items-center gap-1 text-xs text-ui-fg-interactive hover:text-ui-fg-interactive-hover cursor-pointer"
                            >
                              <ArrowDownTray className="w-3 h-3" />
                              PDF
                            </a>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="small">
                          {formatDate(invoice.invoice_date)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <Text size="small">
                            {invoice.buyer_company_name || invoice.buyer_name}
                          </Text>
                          {invoice.buyer_eik && (
                            <Text
                              size="xsmall"
                              className="text-ui-fg-muted"
                            >
                              ЕИК: {invoice.buyer_eik}
                            </Text>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {invoice.order_id && (
                          <a
                            href={`/app/orders/${invoice.order_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                          >
                            {invoice.order_id.slice(0, 8)}...
                          </a>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={invoice.status} />
                          <Badge
                            color={
                              STATUS_CONFIG[invoice.status]?.color ||
                              "grey"
                            }
                            size="small"
                          >
                            {STATUS_CONFIG[invoice.status]?.label ||
                              invoice.status}
                          </Badge>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="small" className="font-medium">
                          {formatMoney(
                            invoice.total,
                            invoice.currency_code
                          )}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <DropdownMenu>
                          <DropdownMenu.Trigger asChild>
                            <IconButton
                              variant="transparent"
                              size="small"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <EllipsisHorizontal />
                            </IconButton>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end">
                            <DropdownMenu.Item
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadPdf(invoice)
                              }}
                            >
                              <ArrowDownTray className="mr-2" />
                              Изтегли PDF
                            </DropdownMenu.Item>
                            {invoice.status === "draft" && (
                              <>
                                <DropdownMenu.Item
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleIssue(invoice)
                                  }}
                                >
                                  <CheckCircle className="mr-2" />
                                  Издай фактурата
                                </DropdownMenu.Item>
                              </>
                            )}
                            {invoice.status !== "cancelled" && (
                              <DropdownMenu.Item
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancel(invoice)
                                }}
                              >
                                <XCircle className="mr-2" />
                                Анулирай
                              </DropdownMenu.Item>
                            )}
                            {invoice.order_id && (
                              <DropdownMenu.Item asChild>
                                <a
                                  href={`/app/orders/${invoice.order_id}`}
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <Eye className="mr-2" />
                                  Виж поръчка
                                </a>
                              </DropdownMenu.Item>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center justify-between pb-2">
                <button
                  className="flex items-center gap-2 text-sm text-ui-fg-muted hover:text-ui-fg-base"
                  onClick={toggleSelectAll}
                >
                  <Checkbox
                    checked={
                      filteredInvoices.length > 0 &&
                      selectedIds.size === filteredInvoices.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                  Избери всички
                </button>
                <Text size="xsmall" className="text-ui-fg-muted">
                  {filteredInvoices.length} резултата
                </Text>
              </div>

              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={clx(
                    "border border-ui-border-base rounded-lg p-3 cursor-pointer active:bg-ui-bg-subtle-hover transition-colors",
                    selectedIds.has(invoice.id) &&
                      "bg-ui-bg-subtle-hover border-ui-border-strong",
                    invoice.status === "cancelled" &&
                      "opacity-50"
                  )}
                  onClick={() => handleDownloadPdf(invoice)}
                >
                  {/* Card Top Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.has(invoice.id)}
                        onCheckedChange={() =>
                          toggleSelect(invoice.id)
                        }
                      />
                      <StatusIcon status={invoice.status} />
                      <Badge
                        color={
                          STATUS_CONFIG[invoice.status]?.color || "grey"
                        }
                        size="small"
                      >
                        {STATUS_CONFIG[invoice.status]?.label ||
                          invoice.status}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenu.Trigger asChild>
                        <IconButton
                          variant="transparent"
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EllipsisHorizontal />
                        </IconButton>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content align="end">
                        <DropdownMenu.Item
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadPdf(invoice)
                          }}
                        >
                          <ArrowDownTray className="mr-2" />
                          Изтегли PDF
                        </DropdownMenu.Item>
                        {invoice.status === "draft" && (
                          <DropdownMenu.Item
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIssue(invoice)
                            }}
                          >
                            <CheckCircle className="mr-2" />
                            Издай
                          </DropdownMenu.Item>
                        )}
                        {invoice.status !== "cancelled" && (
                          <DropdownMenu.Item
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancel(invoice)
                            }}
                          >
                            <XCircle className="mr-2" />
                            Анулирай
                          </DropdownMenu.Item>
                        )}
                        {invoice.order_id && (
                          <DropdownMenu.Item asChild>
                            <a
                              href={`/app/orders/${invoice.order_id}`}
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                            >
                              <Eye className="mr-2" />
                              Виж поръчка
                            </a>
                          </DropdownMenu.Item>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <Text className="font-medium text-sm">
                          {invoice.buyer_company_name || invoice.buyer_name}
                        </Text>
                        {invoice.buyer_eik && (
                          <Text
                            size="xsmall"
                            className="text-ui-fg-muted"
                          >
                            ЕИК: {invoice.buyer_eik}
                          </Text>
                        )}
                      </div>
                      <div className="text-right">
                        <Text className="font-mono text-xs text-ui-fg-muted">
                          #{invoice.invoice_number}
                        </Text>
                        <Text
                          size="xsmall"
                          className="text-ui-fg-muted"
                        >
                          {formatDate(invoice.invoice_date)}
                        </Text>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-ui-border-base">
                      <Text size="xsmall" className="text-ui-fg-muted">
                        Поръчка:{" "}
                        {invoice.order_id
                          ? invoice.order_id.slice(0, 8) + "..."
                          : "-"}
                      </Text>
                      <Text size="small" className="font-medium">
                        {formatMoney(
                          invoice.total,
                          invoice.currency_code
                        )}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div className="flex items-center justify-between pt-4">
            <Text
              size="small"
              className="text-ui-fg-muted hidden sm:block"
            >
              {currentPage * PAGE_SIZE + 1}-
              {Math.min(
                (currentPage + 1) * PAGE_SIZE,
                totalCount
              )}{" "}
              от {totalCount}
            </Text>
            <Text size="small" className="text-ui-fg-muted sm:hidden">
              {currentPage + 1}/{totalPages}
            </Text>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="small"
                disabled={!canPreviousPage}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <span className="hidden sm:inline">Предишна</span>
                <span className="sm:hidden">&larr;</span>
              </Button>
              <Text
                size="small"
                className="text-ui-fg-muted px-2 hidden sm:block"
              >
                {currentPage + 1} / {totalPages}
              </Text>
              <Button
                variant="secondary"
                size="small"
                disabled={!canNextPage}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <span className="hidden sm:inline">Следваща</span>
                <span className="sm:hidden">&rarr;</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Drawer */}
      <CreateInvoiceDrawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onCreated={fetchInvoices}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Фактури",
  icon: DocumentText,
})

export default InvoicesPage
