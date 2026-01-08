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
  clx,
  toast,
} from "@medusajs/ui"
import {
  TruckFast,
  ArrowPath,
  EllipsisHorizontal,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  XCircle,
  BuildingStorefront,
  MapPin,
  ArrowDownTray,
  Eye,
  PencilSquare,
  ExclamationCircle,
  RocketLaunch,
} from "@medusajs/icons"

type EcontTrackingEvent = {
  destinationType: string
  destinationDetails: {
    officeName?: string
    officeNameEn?: string
    cityName?: string
    cityNameEn?: string
    countryCode?: string
  }
  date: string
  time: string
  returnReceiptEvent?: boolean
}

type EcontShipment = {
  id: string
  order_id: string | null
  cart_id: string | null
  delivery_type: "office" | "address"
  office_code: string | null
  office_name: string | null
  address_city: string | null
  address_postal_code: string | null
  address_line1: string | null
  address_line2: string | null
  recipient_first_name: string
  recipient_last_name: string
  recipient_phone: string
  recipient_email: string | null
  cod_amount: number | null
  status: string
  short_status: string | null
  short_status_en: string | null
  waybill_number: string | null
  tracking_number: string | null
  label_url: string | null
  tracking_events: EcontTrackingEvent[] | null
  delivery_attempts: number
  expected_delivery_date: string | null
  send_time: string | null
  delivery_time: string | null
  allow_saturday: boolean
  created_at: string
  updated_at: string
  last_synced_at: string | null
}

type CityOption = {
  id: number
  name: string
  nameEn: string
  postCode: string
}

type OfficeOption = {
  code: string
  name: string
  address?: string
  cityName?: string
}

const STATUS_CONFIG: Record<string, { color: "green" | "orange" | "red" | "blue" | "grey"; label: string; labelBg: string }> = {
  draft: { color: "grey", label: "Чернова", labelBg: "Чернова" },
  ready: { color: "blue", label: "Готова", labelBg: "Готова" },
  registered: { color: "blue", label: "Регистрирана", labelBg: "Регистрирана" },
  in_transit: { color: "orange", label: "В доставка", labelBg: "В доставка" },
  delivered: { color: "green", label: "Доставена", labelBg: "Доставена" },
  cancelled: { color: "red", label: "Отказана", labelBg: "Отказана" },
  error: { color: "red", label: "Грешка", labelBg: "Грешка" },
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="text-ui-fg-success w-4 h-4" />
    case "cancelled":
    case "error":
      return <XCircle className="text-ui-fg-error w-4 h-4" />
    case "in_transit":
      return <TruckFast className="text-ui-fg-warning w-4 h-4" />
    default:
      return <Clock className="text-ui-fg-subtle w-4 h-4" />
  }
}

const ProgressIndicator = ({ status }: { status: string }) => {
  const steps = ["registered", "in_transit", "delivered"]
  const currentIndex = steps.indexOf(status)

  if (status === "cancelled" || status === "error") {
    return (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-ui-tag-red-icon" />
        <div className="w-8 h-0.5 bg-ui-tag-red-icon" />
        <XCircle className="w-4 h-4 text-ui-tag-red-icon" />
      </div>
    )
  }

  if (status === "draft" || status === "ready") {
    return (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-ui-fg-muted" />
        <div className="w-8 h-0.5 bg-ui-bg-subtle-pressed" />
        <div className="w-2 h-2 rounded-full bg-ui-bg-subtle-pressed" />
        <div className="w-8 h-0.5 bg-ui-bg-subtle-pressed" />
        <div className="w-2 h-2 rounded-full bg-ui-bg-subtle-pressed" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={clx(
              "w-2 h-2 rounded-full",
              index <= currentIndex ? "bg-ui-tag-green-icon" : "bg-ui-bg-subtle-pressed"
            )}
          />
          {index < steps.length - 1 && (
            <div
              className={clx(
                "w-8 h-0.5",
                index < currentIndex ? "bg-ui-tag-green-icon" : "bg-ui-bg-subtle-pressed"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

const ShipmentDetailsDrawer = ({
  shipment,
  isOpen,
  onClose
}: {
  shipment: EcontShipment | null
  isOpen: boolean
  onClose: () => void
}) => {
  if (!isOpen || !shipment) return null

  const trackingEvents = shipment.tracking_events || []

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg bg-ui-bg-base shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-ui-bg-base border-b border-ui-border-base px-6 py-4 flex items-center justify-between">
          <div>
            <Heading level="h2">Товарителница #{shipment.waybill_number || "N/A"}</Heading>
            <Text size="small" className="text-ui-fg-muted">
              {shipment.short_status_en || STATUS_CONFIG[shipment.status]?.label}
            </Text>
          </div>
          <Button variant="secondary" size="small" onClick={onClose}>
            Затвори
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Progress */}
          <div className="space-y-3">
            <Text className="font-medium">Прогрес на доставката</Text>
            <div className="flex items-center justify-center py-4">
              <ProgressIndicator status={shipment.status} />
            </div>
            <div className="flex items-center justify-between text-xs text-ui-fg-muted">
              <span>Регистрирана</span>
              <span>В доставка</span>
              <span>Доставена</span>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-ui-bg-subtle rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <StatusIcon status={shipment.status} />
              <Badge color={STATUS_CONFIG[shipment.status]?.color || "grey"}>
                {shipment.short_status || STATUS_CONFIG[shipment.status]?.label}
              </Badge>
            </div>
            {shipment.expected_delivery_date && (
              <Text size="small" className="text-ui-fg-muted">
                Очаквана доставка: {shipment.expected_delivery_date}
              </Text>
            )}
            {shipment.delivery_attempts > 0 && (
              <Text size="small" className="text-ui-fg-muted">
                Опити за доставка: {shipment.delivery_attempts}
              </Text>
            )}
          </div>

          {/* Tracking Timeline */}
          {trackingEvents.length > 0 && (
            <div className="space-y-3">
              <Text className="font-medium">История на доставката</Text>
              <div className="space-y-0">
                {trackingEvents.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={clx(
                        "w-3 h-3 rounded-full border-2",
                        index === 0
                          ? "bg-ui-tag-green-icon border-ui-tag-green-icon"
                          : "bg-ui-bg-base border-ui-border-strong"
                      )} />
                      {index < trackingEvents.length - 1 && (
                        <div className="w-0.5 h-12 bg-ui-border-base" />
                      )}
                    </div>
                    <div className="pb-4">
                      <Text size="small" className="font-medium capitalize">
                        {event.destinationType.replace(/_/g, " ")}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {event.destinationDetails?.cityName || event.destinationDetails?.officeName}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {event.date} {event.time}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Details */}
          <div className="space-y-3">
            <Text className="font-medium">Детайли за доставка</Text>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Text size="small" className="text-ui-fg-muted">Тип доставка</Text>
                <div className="flex items-center gap-1.5 mt-1">
                  {shipment.delivery_type === "office" ? (
                    <BuildingStorefront className="w-4 h-4 text-ui-fg-subtle" />
                  ) : (
                    <MapPin className="w-4 h-4 text-ui-fg-subtle" />
                  )}
                  <Text>{shipment.delivery_type === "office" ? "До офис" : "До адрес"}</Text>
                </div>
              </div>

              {shipment.delivery_type === "office" && shipment.office_name && (
                <div>
                  <Text size="small" className="text-ui-fg-muted">Офис</Text>
                  <Text className="mt-1">{shipment.office_name}</Text>
                </div>
              )}

              {shipment.delivery_type === "address" && (
                <div>
                  <Text size="small" className="text-ui-fg-muted">Адрес</Text>
                  <Text className="mt-1">
                    {[shipment.address_city, shipment.address_line1].filter(Boolean).join(", ")}
                  </Text>
                </div>
              )}
            </div>
          </div>

          {/* Recipient */}
          <div className="space-y-3">
            <Text className="font-medium">Получател</Text>
            <div className="text-sm space-y-1">
              <Text>{shipment.recipient_first_name} {shipment.recipient_last_name}</Text>
              <Text className="text-ui-fg-muted">{shipment.recipient_phone}</Text>
              {shipment.recipient_email && (
                <Text className="text-ui-fg-muted">{shipment.recipient_email}</Text>
              )}
            </div>
          </div>

          {/* COD */}
          {shipment.cod_amount && (
            <div className="space-y-3">
              <Text className="font-medium">Наложен платеж</Text>
              <div className="bg-ui-bg-subtle rounded-lg p-3">
                <Text className="text-lg font-semibold">
                  {Number(shipment.cod_amount).toFixed(2)} лв.
                </Text>
                {shipment.delivery_time && (
                  <Text size="small" className="text-ui-fg-muted">
                    Събран: {new Date(shipment.delivery_time).toLocaleString("bg-BG")}
                  </Text>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-ui-border-base flex gap-2">
            {shipment.label_url && (
              <Button variant="secondary" asChild className="flex-1">
                <a href={shipment.label_url} target="_blank" rel="noopener noreferrer">
                  <ArrowDownTray className="mr-2" />
                  Етикет
                </a>
              </Button>
            )}
            {shipment.order_id && (
              <Button variant="secondary" asChild className="flex-1">
                <a href={`/app/orders/${shipment.order_id}`}>
                  <Eye className="mr-2" />
                  Поръчка
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Edit Drawer for Draft Shipments
const EditShipmentDrawer = ({
  shipment,
  isOpen,
  onClose,
  onSave,
}: {
  shipment: EcontShipment | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}) => {
  const [formData, setFormData] = useState({
    delivery_type: "office" as "office" | "address",
    recipient_first_name: "",
    recipient_last_name: "",
    recipient_phone: "",
    recipient_email: "",
    office_code: "",
    office_name: "",
    address_city: "",
    address_postal_code: "",
    address_line1: "",
    address_line2: "",
    cod_amount: 0,
    allow_saturday: false,
  })
  const [saving, setSaving] = useState(false)
  const [cities, setCities] = useState<CityOption[]>([])
  const [offices, setOffices] = useState<OfficeOption[]>([])
  const [citySearch, setCitySearch] = useState("")
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)

  useEffect(() => {
    if (shipment && isOpen) {
      setFormData({
        delivery_type: shipment.delivery_type,
        recipient_first_name: shipment.recipient_first_name || "",
        recipient_last_name: shipment.recipient_last_name || "",
        recipient_phone: shipment.recipient_phone || "",
        recipient_email: shipment.recipient_email || "",
        office_code: shipment.office_code || "",
        office_name: shipment.office_name || "",
        address_city: shipment.address_city || "",
        address_postal_code: shipment.address_postal_code || "",
        address_line1: shipment.address_line1 || "",
        address_line2: shipment.address_line2 || "",
        cod_amount: shipment.cod_amount ? Number(shipment.cod_amount) : 0,
        allow_saturday: shipment.allow_saturday || false,
      })
    }
  }, [shipment, isOpen])

  // Fetch cities when search changes
  useEffect(() => {
    if (citySearch.length < 2) {
      setCities([])
      return
    }

    const fetchCities = async () => {
      try {
        const response = await fetch(
          `/admin/econt/locations?type=city&search=${encodeURIComponent(citySearch)}`
        )
        const data = await response.json()
        setCities(data.locations || [])
      } catch (error) {
        console.error("Failed to fetch cities:", error)
      }
    }

    const timeout = setTimeout(fetchCities, 300)
    return () => clearTimeout(timeout)
  }, [citySearch])

  // Fetch offices when city is selected
  useEffect(() => {
    if (!selectedCityId) {
      setOffices([])
      return
    }

    const fetchOffices = async () => {
      try {
        const response = await fetch(
          `/admin/econt/locations?type=office&cityId=${selectedCityId}`
        )
        const data = await response.json()
        setOffices(data.locations || [])
      } catch (error) {
        console.error("Failed to fetch offices:", error)
      }
    }

    fetchOffices()
  }, [selectedCityId])

  const handleSave = async () => {
    if (!shipment) return

    setSaving(true)
    try {
      const response = await fetch(`/admin/econt/shipments/${shipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Товарителницата е обновена")
        onSave()
        onClose()
      } else {
        const data = await response.json()
        toast.error(data.message || "Грешка при запис")
      }
    } catch (error) {
      toast.error("Грешка при запис")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !shipment) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg bg-ui-bg-base shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-ui-bg-base border-b border-ui-border-base px-6 py-4 flex items-center justify-between">
          <div>
            <Heading level="h2">Редактиране на товарителница</Heading>
            <Text size="small" className="text-ui-fg-muted">
              Редактирайте данните преди изпращане към Econt
            </Text>
          </div>
          <Button variant="secondary" size="small" onClick={onClose}>
            Затвори
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Delivery Type */}
          <div className="space-y-2">
            <Label>Тип доставка</Label>
            <Select
              value={formData.delivery_type}
              onValueChange={(value) =>
                setFormData({ ...formData, delivery_type: value as "office" | "address" })
              }
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="office">До офис на Еконт</Select.Item>
                <Select.Item value="address">До адрес</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {/* Recipient Info */}
          <div className="space-y-4">
            <Text className="font-medium">Получател</Text>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Име</Label>
                <Input
                  value={formData.recipient_first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient_first_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Фамилия</Label>
                <Input
                  value={formData.recipient_last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient_last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input
                value={formData.recipient_phone}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Имейл (незадължително)</Label>
              <Input
                value={formData.recipient_email}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Office Selection */}
          {formData.delivery_type === "office" && (
            <div className="space-y-4">
              <Text className="font-medium">Офис на Еконт</Text>
              <div className="space-y-2">
                <Label>Търсене на град</Label>
                <Input
                  placeholder="Въведете име на град..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
                {cities.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        className="w-full text-left px-3 py-2 hover:bg-ui-bg-subtle text-sm"
                        onClick={() => {
                          setSelectedCityId(city.id)
                          setFormData({ ...formData, address_city: city.name })
                          setCitySearch(city.name)
                          setCities([])
                        }}
                      >
                        {city.name} ({city.postCode})
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {offices.length > 0 && (
                <div className="space-y-2">
                  <Label>Избор на офис</Label>
                  <Select
                    value={formData.office_code}
                    onValueChange={(value) => {
                      const office = offices.find((o) => o.code === value)
                      setFormData({
                        ...formData,
                        office_code: value,
                        office_name: office?.name || "",
                      })
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Изберете офис" />
                    </Select.Trigger>
                    <Select.Content>
                      {offices.map((office) => (
                        <Select.Item key={office.code} value={office.code}>
                          {office.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Address Fields */}
          {formData.delivery_type === "address" && (
            <div className="space-y-4">
              <Text className="font-medium">Адрес за доставка</Text>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Град</Label>
                  <Input
                    value={formData.address_city}
                    onChange={(e) =>
                      setFormData({ ...formData, address_city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Пощенски код</Label>
                  <Input
                    value={formData.address_postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, address_postal_code: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Адрес</Label>
                <Input
                  value={formData.address_line1}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line1: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Допълнителен адрес</Label>
                <Input
                  value={formData.address_line2}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line2: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allow_saturday"
                  checked={formData.allow_saturday}
                  onChange={(e) =>
                    setFormData({ ...formData, allow_saturday: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="allow_saturday">Доставка в събота</Label>
              </div>
            </div>
          )}

          {/* COD Amount */}
          <div className="space-y-2">
            <Label>Наложен платеж (лв.)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.cod_amount}
              onChange={(e) =>
                setFormData({ ...formData, cod_amount: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-ui-border-base flex gap-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Отказ
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Запазване..." : "Запази"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Draft Shipments Alert Card
const DraftShipmentsCard = ({
  drafts,
  onEdit,
  onConfirm,
  onViewDetails,
}: {
  drafts: EcontShipment[]
  onEdit: (shipment: EcontShipment) => void
  onConfirm: (shipment: EcontShipment) => void
  onViewDetails: (shipment: EcontShipment) => void
}) => {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  if (drafts.length === 0) return null

  return (
    <div className="bg-ui-tag-orange-bg border border-ui-tag-orange-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <ExclamationCircle className="w-5 h-5 text-ui-tag-orange-icon" />
        <Heading level="h3" className="text-ui-tag-orange-text">
          Чакащи потвърждение ({drafts.length})
        </Heading>
      </div>
      <Text size="small" className="text-ui-fg-muted mb-4">
        Тези товарителници са създадени от клиенти, но още не са изпратени към Еконт.
        Прегледайте данните и потвърдете за да генерирате товарителница.
      </Text>
      <div className="space-y-3">
        {drafts.map((shipment) => (
          <div
            key={shipment.id}
            className="bg-ui-bg-base rounded-lg border border-ui-border-base p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {shipment.delivery_type === "office" ? (
                  <BuildingStorefront className="w-4 h-4 text-ui-fg-subtle" />
                ) : (
                  <MapPin className="w-4 h-4 text-ui-fg-subtle" />
                )}
                <Text className="font-medium">
                  {shipment.recipient_first_name} {shipment.recipient_last_name}
                </Text>
                <Badge color="grey" size="small">Чернова</Badge>
              </div>
              <Text size="small" className="text-ui-fg-muted">
                {shipment.delivery_type === "office"
                  ? shipment.office_name || "Офис не е избран"
                  : shipment.address_city || "Адрес не е въведен"}
                {" • "}
                {shipment.recipient_phone}
                {shipment.cod_amount && (
                  <> • <span className="font-medium">{Number(shipment.cod_amount).toFixed(2)} лв.</span></>
                )}
              </Text>
              {shipment.order_id && (
                <Text size="xsmall" className="text-ui-fg-subtle mt-1">
                  Поръчка: {shipment.order_id.slice(0, 8)}...
                </Text>
              )}
            </div>
            <div className="flex items-center gap-2">
              <IconButton
                variant="transparent"
                size="small"
                onClick={() => onViewDetails(shipment)}
              >
                <Eye className="w-4 h-4" />
              </IconButton>
              <IconButton
                variant="transparent"
                size="small"
                onClick={() => onEdit(shipment)}
              >
                <PencilSquare className="w-4 h-4" />
              </IconButton>
              <Button
                size="small"
                disabled={confirmingId === shipment.id}
                onClick={async () => {
                  setConfirmingId(shipment.id)
                  await onConfirm(shipment)
                  setConfirmingId(null)
                }}
              >
                {confirmingId === shipment.id ? (
                  <ArrowPath className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <RocketLaunch className="w-4 h-4 mr-1" />
                )}
                Изпрати
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const EcontShipmentsPage = () => {
  const [shipments, setShipments] = useState<EcontShipment[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<EcontShipment | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [editingShipment, setEditingShipment] = useState<EcontShipment | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchShipments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }
      params.set("limit", "100")

      const response = await fetch(`/admin/econt/shipments?${params.toString()}`)
      const data = await response.json()
      setShipments(data.shipments || [])
    } catch (error) {
      console.error("Failed to fetch shipments:", error)
      toast.error("Неуспешно зареждане на товарителници")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchShipments()
  }, [fetchShipments])

  const handleSyncAll = async () => {
    const registered = shipments.filter(s =>
      s.waybill_number &&
      s.status !== "delivered" &&
      s.status !== "cancelled"
    )

    if (registered.length === 0) {
      toast.info("Няма товарителници за синхронизация")
      return
    }

    setSyncing(true)
    try {
      // Sync each shipment
      for (const shipment of registered) {
        await fetch(`/admin/econt/shipments/${shipment.id}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force: true }),
        })
      }
      await fetchShipments()
      toast.success(`Синхронизирани ${registered.length} товарителници`)
    } catch (error) {
      toast.error("Грешка при синхронизация")
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncSingle = async (shipment: EcontShipment) => {
    if (!shipment.waybill_number) {
      toast.error("Товарителницата няма номер")
      return
    }

    try {
      const response = await fetch(`/admin/econt/shipments/${shipment.id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      })

      if (response.ok) {
        await fetchShipments()
        toast.success("Статусът е обновен")
      } else {
        toast.error("Неуспешна синхронизация")
      }
    } catch {
      toast.error("Грешка при синхронизация")
    }
  }

  const openDrawer = (shipment: EcontShipment) => {
    setSelectedShipment(shipment)
    setDrawerOpen(true)
  }

  const openEditDrawer = (shipment: EcontShipment) => {
    setEditingShipment(shipment)
    setEditDrawerOpen(true)
  }

  const handleConfirmShipment = async (shipment: EcontShipment) => {
    try {
      const response = await fetch(`/admin/econt/shipments/${shipment.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        toast.success("Товарителницата е изпратена към Еконт")
        await fetchShipments()
      } else {
        const data = await response.json()
        toast.error(data.message || "Грешка при изпращане")
      }
    } catch {
      toast.error("Грешка при изпращане към Еконт")
    }
  }

  // Get draft shipments for the alert card
  const draftShipments = shipments.filter(s => s.status === "draft" || s.status === "ready")

  const filteredShipments = shipments.filter(s => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      s.waybill_number?.toLowerCase().includes(q) ||
      s.recipient_first_name.toLowerCase().includes(q) ||
      s.recipient_last_name.toLowerCase().includes(q) ||
      s.recipient_phone.includes(q) ||
      s.order_id?.toLowerCase().includes(q)
    )
  })

  // Group by status for summary
  const statusCounts = shipments.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <TruckFast className="text-ui-fg-subtle w-6 h-6" />
          <div>
            <Heading level="h1">Econt Товарителници</Heading>
            <Text size="small" className="text-ui-fg-muted">
              Управление и проследяване на доставки
            </Text>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={handleSyncAll}
          disabled={syncing}
        >
          <ArrowPath className={clx("mr-2", syncing && "animate-spin")} />
          Синхронизирай всички
        </Button>
      </div>

      {/* Draft Shipments Alert */}
      {draftShipments.length > 0 && (
        <div className="px-6 py-4">
          <DraftShipmentsCard
            drafts={draftShipments}
            onEdit={openEditDrawer}
            onConfirm={handleConfirmShipment}
            onViewDetails={openDrawer}
          />
        </div>
      )}

      {/* Status Summary Cards */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            className={clx(
              "flex items-center gap-2 p-3 rounded-lg border transition-colors",
              statusFilter === key
                ? "border-ui-border-interactive bg-ui-bg-interactive"
                : "border-ui-border-base hover:border-ui-border-strong"
            )}
          >
            <StatusIcon status={key} />
            <div className="text-left">
              <Text size="small" className="font-medium">
                {statusCounts[key] || 0}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                {config.label}
              </Text>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-4 flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted w-4 h-4" />
            <Input
              placeholder="Търси по номер, получател, телефон..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger className="w-48">
            <Select.Value placeholder="Всички статуси" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">Всички статуси</Select.Item>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <Select.Item key={key} value={key}>
                {config.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="text-center py-12">
            <ArrowPath className="w-8 h-8 mx-auto animate-spin text-ui-fg-muted" />
            <Text className="mt-2 text-ui-fg-muted">Зареждане...</Text>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="text-center py-12">
            <TruckFast className="w-12 h-12 mx-auto text-ui-fg-muted mb-4" />
            <Text className="text-ui-fg-muted">Няма намерени товарителници</Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Товарителница</Table.HeaderCell>
                <Table.HeaderCell>Статус</Table.HeaderCell>
                <Table.HeaderCell>Прогрес</Table.HeaderCell>
                <Table.HeaderCell>Получател</Table.HeaderCell>
                <Table.HeaderCell>Доставка</Table.HeaderCell>
                <Table.HeaderCell>Наложен платеж</Table.HeaderCell>
                <Table.HeaderCell>Дата</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredShipments.map((shipment) => (
                <Table.Row
                  key={shipment.id}
                  className="cursor-pointer hover:bg-ui-bg-subtle"
                  onClick={() => openDrawer(shipment)}
                >
                  <Table.Cell>
                    <div>
                      <Text className="font-mono font-medium">
                        {shipment.waybill_number || "-"}
                      </Text>
                      {shipment.order_id && (
                        <Text size="xsmall" className="text-ui-fg-muted">
                          Поръчка: {shipment.order_id.slice(0, 8)}...
                        </Text>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={shipment.status} />
                      <Badge color={STATUS_CONFIG[shipment.status]?.color || "grey"} size="small">
                        {shipment.short_status || STATUS_CONFIG[shipment.status]?.label}
                      </Badge>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <ProgressIndicator status={shipment.status} />
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <Text size="small">
                        {shipment.recipient_first_name} {shipment.recipient_last_name}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {shipment.recipient_phone}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1.5">
                      {shipment.delivery_type === "office" ? (
                        <BuildingStorefront className="w-4 h-4 text-ui-fg-subtle" />
                      ) : (
                        <MapPin className="w-4 h-4 text-ui-fg-subtle" />
                      )}
                      <Text size="small">
                        {shipment.delivery_type === "office"
                          ? (shipment.office_name || "Офис")
                          : (shipment.address_city || "Адрес")}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {shipment.cod_amount ? (
                      <Text size="small" className="font-medium">
                        {Number(shipment.cod_amount).toFixed(2)} лв.
                      </Text>
                    ) : (
                      <Text size="small" className="text-ui-fg-muted">-</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" className="text-ui-fg-muted">
                      {new Date(shipment.created_at).toLocaleDateString("bg-BG")}
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
                        <DropdownMenu.Item onClick={(e) => {
                          e.stopPropagation()
                          openDrawer(shipment)
                        }}>
                          <Eye className="mr-2" />
                          Детайли
                        </DropdownMenu.Item>
                        {(shipment.status === "draft" || shipment.status === "ready") && (
                          <>
                            <DropdownMenu.Item onClick={(e) => {
                              e.stopPropagation()
                              openEditDrawer(shipment)
                            }}>
                              <PencilSquare className="mr-2" />
                              Редактирай
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onClick={(e) => {
                              e.stopPropagation()
                              handleConfirmShipment(shipment)
                            }}>
                              <RocketLaunch className="mr-2" />
                              Изпрати към Еконт
                            </DropdownMenu.Item>
                          </>
                        )}
                        {shipment.waybill_number && (
                          <DropdownMenu.Item onClick={(e) => {
                            e.stopPropagation()
                            handleSyncSingle(shipment)
                          }}>
                            <ArrowPath className="mr-2" />
                            Синхронизирай
                          </DropdownMenu.Item>
                        )}
                        {shipment.label_url && (
                          <DropdownMenu.Item asChild>
                            <a
                              href={shipment.label_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ArrowDownTray className="mr-2" />
                              Свали етикет
                            </a>
                          </DropdownMenu.Item>
                        )}
                        {shipment.order_id && (
                          <DropdownMenu.Item asChild>
                            <a
                              href={`/app/orders/${shipment.order_id}`}
                              onClick={(e) => e.stopPropagation()}
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
        )}
      </div>

      {/* Shipment Details Drawer */}
      <ShipmentDetailsDrawer
        shipment={selectedShipment}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Edit Shipment Drawer */}
      <EditShipmentDrawer
        shipment={editingShipment}
        isOpen={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        onSave={fetchShipments}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Econt Товарителници",
  icon: TruckFast,
})

export default EcontShipmentsPage
