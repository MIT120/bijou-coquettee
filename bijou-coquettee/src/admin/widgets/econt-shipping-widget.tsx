import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect, useState, useCallback } from "react"
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Select,
  Label,
  Drawer,
  toast,
  IconButton,
} from "@medusajs/ui"
import {
  ArrowPath,
  PencilSquare,
  Trash,
  Plus,
  XMark,
  CheckCircle,
  Clock,
  XCircle,
  TruckFast,
  BuildingStorefront,
  MapPin,
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
  entrance: string | null
  floor: string | null
  apartment: string | null
  neighborhood: string | null
  recipient_first_name: string
  recipient_last_name: string
  recipient_phone: string
  recipient_email: string | null
  cod_amount: number | null
  shipping_cost: number | null
  shipping_cost_currency: string | null
  status: string
  short_status: string | null
  short_status_en: string | null
  waybill_number: string | null
  tracking_number: string | null
  label_url: string | null
  tracking_events: EcontTrackingEvent[] | null
  delivery_attempts: number
  expected_delivery_date: string | null
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
  regionName?: string
}

type OfficeOption = {
  code: string
  name: string
  address?: string
  cityName?: string
}

// Fixed BGN/EUR exchange rate (Bulgarian currency board peg)
const BGN_TO_EUR = 1.9558

const formatMoney = (amount: number | null | undefined, sourceCurrency?: string | null): string => {
  if (amount == null || isNaN(Number(amount))) return "-"
  const num = Number(amount)
  const src = (sourceCurrency || "BGN").toUpperCase()

  if (src === "EUR") {
    const bgn = Math.round(num * BGN_TO_EUR * 100) / 100
    return `\u20AC${num.toFixed(2)} (${bgn.toFixed(2)} лв.)`
  }

  const eur = Math.round((num / BGN_TO_EUR) * 100) / 100
  return `\u20AC${eur.toFixed(2)} (${num.toFixed(2)} лв.)`
}

const STATUS_CONFIG: Record<string, { color: "green" | "orange" | "red" | "blue" | "grey"; label: string }> = {
  draft: { color: "grey", label: "Draft" },
  ready: { color: "blue", label: "Ready" },
  registered: { color: "blue", label: "Registered" },
  in_transit: { color: "orange", label: "In Transit" },
  delivered: { color: "green", label: "Delivered" },
  cancelled: { color: "red", label: "Cancelled" },
  error: { color: "red", label: "Error" },
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="text-ui-fg-success" />
    case "cancelled":
    case "error":
      return <XCircle className="text-ui-fg-error" />
    case "in_transit":
      return <TruckFast className="text-ui-fg-warning" />
    default:
      return <Clock className="text-ui-fg-subtle" />
  }
}

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

const EcontShippingWidget = ({ data: order }: OrderDetailWidgetProps) => {
  const [shipment, setShipment] = useState<EcontShipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form state for creating/editing shipment
  const [formData, setFormData] = useState({
    delivery_type: "office" as "office" | "address",
    office_code: "",
    office_name: "",
    address_city: "",
    address_postal_code: "",
    address_line1: "",
    address_line2: "",
    entrance: "",
    floor: "",
    apartment: "",
    neighborhood: "",
    recipient_first_name: order.shipping_address?.first_name || "",
    recipient_last_name: order.shipping_address?.last_name || "",
    recipient_phone: order.shipping_address?.phone || "",
    recipient_email: order.email || "",
    cod_amount: order.total ? order.total / 100 : 0,
    allow_saturday: false,
    status: "draft",
    waybill_number: "",
    tracking_number: "",
  })

  // Cities and offices for dropdowns
  const [cities, setCities] = useState<CityOption[]>([])
  const [offices, setOffices] = useState<OfficeOption[]>([])
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingOffices, setLoadingOffices] = useState(false)

  // Only show for Bulgarian orders
  const isBulgarianOrder = order.shipping_address?.country_code?.toLowerCase() === "bg"

  const fetchShipment = useCallback(async () => {
    if (!order.id) return

    setLoading(true)
    try {
      const response = await fetch(`/admin/econt/shipments?order_id=${order.id}`)
      const data = await response.json()

      if (data.shipments && data.shipments.length > 0) {
        setShipment(data.shipments[0])
        // Pre-fill form with existing data
        const s = data.shipments[0]
        setFormData({
          delivery_type: s.delivery_type || "office",
          office_code: s.office_code || "",
          office_name: s.office_name || "",
          address_city: s.address_city || "",
          address_postal_code: s.address_postal_code || "",
          address_line1: s.address_line1 || "",
          address_line2: s.address_line2 || "",
          entrance: s.entrance || "",
          floor: s.floor || "",
          apartment: s.apartment || "",
          neighborhood: s.neighborhood || "",
          recipient_first_name: s.recipient_first_name || "",
          recipient_last_name: s.recipient_last_name || "",
          recipient_phone: s.recipient_phone || "",
          recipient_email: s.recipient_email || "",
          cod_amount: s.cod_amount ? Number(s.cod_amount) : 0,
          allow_saturday: s.allow_saturday || false,
          status: s.status || "draft",
          waybill_number: s.waybill_number || "",
          tracking_number: s.tracking_number || "",
        })
      } else {
        setShipment(null)
      }
    } catch (error) {
      console.error("Failed to fetch shipment:", error)
    } finally {
      setLoading(false)
    }
  }, [order.id])

  const fetchCities = useCallback(async () => {
    setLoadingCities(true)
    try {
      const response = await fetch("/admin/econt/locations?type=city")
      const data = await response.json()
      setCities(data.locations || [])
    } catch (error) {
      console.error("Failed to fetch cities:", error)
    } finally {
      setLoadingCities(false)
    }
  }, [])

  const fetchOffices = useCallback(async (cityId: number) => {
    setLoadingOffices(true)
    try {
      const response = await fetch(`/admin/econt/locations?type=office&cityId=${cityId}`)
      const data = await response.json()
      setOffices(data.locations || [])
    } catch (error) {
      console.error("Failed to fetch offices:", error)
    } finally {
      setLoadingOffices(false)
    }
  }, [])

  useEffect(() => {
    if (isBulgarianOrder) {
      fetchShipment()
    }
  }, [fetchShipment, isBulgarianOrder])

  // Auto-refresh shipment data every 5 minutes for active shipments
  useEffect(() => {
    if (!isBulgarianOrder || !shipment?.waybill_number) return
    const isActive = shipment.status === "registered" || shipment.status === "in_transit"
    if (!isActive) return

    const interval = setInterval(() => {
      fetchShipment()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isBulgarianOrder, shipment?.waybill_number, shipment?.status, fetchShipment])

  useEffect(() => {
    if (isDrawerOpen && cities.length === 0) {
      fetchCities()
    }
  }, [isDrawerOpen, cities.length, fetchCities])

  useEffect(() => {
    if (selectedCity) {
      fetchOffices(selectedCity.id)
    }
  }, [selectedCity, fetchOffices])

  const handleSyncStatus = async () => {
    if (!shipment?.id) return

    setSyncing(true)
    try {
      const response = await fetch(`/admin/econt/shipments/${shipment.id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      })

      if (response.ok) {
        const data = await response.json()
        setShipment(data.shipment)
        if (data.statusChanged) {
          const statusLabels: Record<string, string> = {
            draft: "Чернова", ready: "Готова", registered: "Регистрирана",
            in_transit: "В доставка", delivered: "Доставена",
            cancelled: "Отменена", error: "Грешка",
          }
          const from = statusLabels[data.previousStatus] || data.previousStatus
          const to = statusLabels[data.newStatus] || data.newStatus
          toast.success(`Статус: ${from} → ${to}`)
        } else {
          toast.success("Shipment status synced successfully")
        }
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to sync status")
      }
    } catch (error) {
      toast.error("Failed to sync status")
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateShipment = async () => {
    try {
      const response = await fetch("/admin/econt/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          ...formData,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setShipment(data.shipment)
        setIsDrawerOpen(false)
        toast.success("Shipment created successfully")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create shipment")
      }
    } catch (error) {
      toast.error("Failed to create shipment")
    }
  }

  const handleUpdateShipment = async () => {
    if (!shipment?.id) return

    try {
      const response = await fetch(`/admin/econt/shipments/${shipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setShipment(data.shipment)
        setIsDrawerOpen(false)
        setIsEditing(false)
        toast.success("Shipment updated successfully")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update shipment")
      }
    } catch (error) {
      toast.error("Failed to update shipment")
    }
  }

  const handleCancelShipment = async () => {
    if (!shipment?.id) return

    if (!confirm("Are you sure you want to cancel this shipment?")) return

    try {
      const response = await fetch(`/admin/econt/shipments/${shipment.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const data = await response.json()
        setShipment(data.shipment)
        toast.success("Shipment cancelled")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to cancel shipment")
      }
    } catch (error) {
      toast.error("Failed to cancel shipment")
    }
  }

  const openDrawer = (editing: boolean) => {
    setIsEditing(editing)
    setIsDrawerOpen(true)
  }

  // Don't show widget for non-Bulgarian orders
  if (!isBulgarianOrder) {
    return null
  }

  if (loading) {
    return (
      <Container className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-ui-bg-subtle rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-ui-bg-subtle rounded"></div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-0 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-ui-border-base">
        <div className="flex items-center gap-2">
          <TruckFast className="text-ui-fg-subtle" />
          <Heading level="h2">Econt Shipping</Heading>
        </div>
        <div className="flex items-center gap-2">
          {shipment && (
            <>
              <IconButton
                size="small"
                variant="transparent"
                onClick={handleSyncStatus}
                disabled={syncing || !shipment.waybill_number}
              >
                <ArrowPath className={syncing ? "animate-spin" : ""} />
              </IconButton>
              <IconButton
                size="small"
                variant="transparent"
                onClick={() => openDrawer(true)}
              >
                <PencilSquare />
              </IconButton>
              {shipment.status !== "cancelled" && shipment.status !== "delivered" && (
                <IconButton
                  size="small"
                  variant="transparent"
                  onClick={handleCancelShipment}
                >
                  <Trash className="text-ui-fg-error" />
                </IconButton>
              )}
            </>
          )}
          {!shipment && (
            <Button size="small" variant="secondary" onClick={() => openDrawer(false)}>
              <Plus className="mr-1" />
              Create Shipment
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {shipment ? (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon status={shipment.status} />
                <Badge color={STATUS_CONFIG[shipment.status]?.color || "grey"}>
                  {shipment.short_status || STATUS_CONFIG[shipment.status]?.label || shipment.status}
                </Badge>
              </div>
              {shipment.last_synced_at && (
                <Text size="small" className="text-ui-fg-muted">
                  Last synced: {new Date(shipment.last_synced_at).toLocaleString()}
                </Text>
              )}
            </div>

            {/* Progress Indicator */}
            {shipment.waybill_number && (
              <div className="bg-ui-bg-subtle rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  {["registered", "in_transit", "delivered"].map((step, index) => {
                    const steps = ["registered", "in_transit", "delivered"]
                    const currentIndex = steps.indexOf(shipment.status)
                    const isCompleted = index <= currentIndex
                    const isCurrent = index === currentIndex
                    const isCancelled = shipment.status === "cancelled" || shipment.status === "error"

                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${
                            isCancelled && index === 0
                              ? "bg-ui-tag-red-icon border-ui-tag-red-icon"
                              : isCompleted
                              ? "bg-ui-tag-green-icon border-ui-tag-green-icon"
                              : isCurrent
                              ? "bg-ui-bg-base border-ui-tag-green-icon"
                              : "bg-ui-bg-subtle-pressed border-ui-border-base"
                          }`}
                        />
                        {index < 2 && (
                          <div
                            className={`flex-1 h-0.5 mx-1 ${
                              isCancelled
                                ? "bg-ui-tag-red-icon"
                                : index < currentIndex
                                ? "bg-ui-tag-green-icon"
                                : "bg-ui-border-base"
                            }`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-ui-fg-muted">
                  <span>Registered</span>
                  <span>In Transit</span>
                  <span>Delivered</span>
                </div>
                {shipment.expected_delivery_date && (
                  <Text size="xsmall" className="text-ui-fg-subtle mt-2">
                    Expected: {shipment.expected_delivery_date}
                  </Text>
                )}
                {shipment.delivery_attempts > 0 && (
                  <Text size="xsmall" className="text-ui-fg-warning mt-1">
                    Delivery attempts: {shipment.delivery_attempts}
                  </Text>
                )}
              </div>
            )}

            {/* Tracking Timeline (last 3 events) */}
            {shipment.tracking_events && shipment.tracking_events.length > 0 && (
              <div className="space-y-2">
                <Text size="small" className="font-medium text-ui-fg-muted">Recent Activity</Text>
                <div className="space-y-0">
                  {shipment.tracking_events.slice(0, 3).map((event, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? "bg-ui-tag-green-icon" : "bg-ui-border-strong"
                        }`} />
                        {index < Math.min(shipment.tracking_events!.length - 1, 2) && (
                          <div className="w-0.5 h-6 bg-ui-border-base" />
                        )}
                      </div>
                      <div className="pb-1">
                        <Text size="xsmall" className="font-medium capitalize">
                          {event.destinationType.replace(/_/g, " ")}
                        </Text>
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          {event.destinationDetails?.cityName || event.destinationDetails?.officeName} - {event.date}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Text size="small" className="text-ui-fg-muted">Delivery Type</Text>
                <div className="flex items-center gap-2">
                  {shipment.delivery_type === "office" ? (
                    <BuildingStorefront className="text-ui-fg-subtle" />
                  ) : (
                    <MapPin className="text-ui-fg-subtle" />
                  )}
                  <Text className="font-medium capitalize">{shipment.delivery_type}</Text>
                </div>
              </div>

              {shipment.delivery_type === "office" && shipment.office_name && (
                <div className="space-y-1">
                  <Text size="small" className="text-ui-fg-muted">Office</Text>
                  <Text className="font-medium">{shipment.office_name}</Text>
                  {shipment.office_code && (
                    <Text size="small" className="text-ui-fg-subtle">Code: {shipment.office_code}</Text>
                  )}
                </div>
              )}

              {shipment.delivery_type === "address" && (
                <div className="space-y-1">
                  <Text size="small" className="text-ui-fg-muted">Address</Text>
                  <Text className="font-medium">
                    {[shipment.address_city, shipment.address_postal_code].filter(Boolean).join(", ")}
                  </Text>
                  <Text size="small">{shipment.address_line1}</Text>
                  {shipment.address_line2 && (
                    <Text size="small" className="text-ui-fg-subtle">{shipment.address_line2}</Text>
                  )}
                  {(shipment.entrance || shipment.floor || shipment.apartment) && (
                    <Text size="small" className="text-ui-fg-subtle">
                      {[
                        shipment.entrance && `вх. ${shipment.entrance}`,
                        shipment.floor && `ет. ${shipment.floor}`,
                        shipment.apartment && `ап. ${shipment.apartment}`,
                      ].filter(Boolean).join(", ")}
                    </Text>
                  )}
                  {shipment.neighborhood && (
                    <Text size="small" className="text-ui-fg-subtle">кв. {shipment.neighborhood}</Text>
                  )}
                </div>
              )}
            </div>

            {/* Recipient */}
            <div className="space-y-1">
              <Text size="small" className="text-ui-fg-muted">Recipient</Text>
              <Text className="font-medium">
                {shipment.recipient_first_name} {shipment.recipient_last_name}
              </Text>
              <Text size="small">{shipment.recipient_phone}</Text>
              {shipment.recipient_email && (
                <Text size="small" className="text-ui-fg-subtle">{shipment.recipient_email}</Text>
              )}
            </div>

            {/* COD, Shipping Cost & Waybill */}
            <div className="grid grid-cols-2 gap-4">
              {shipment.cod_amount && (
                <div className="space-y-1">
                  <Text size="small" className="text-ui-fg-muted">COD Amount</Text>
                  <Text className="font-medium">
                    {formatMoney(shipment.cod_amount, "BGN")}
                  </Text>
                </div>
              )}

              {shipment.shipping_cost && (
                <div className="space-y-1">
                  <Text size="small" className="text-ui-fg-muted">Shipping Cost</Text>
                  <Text className="font-medium">
                    {formatMoney(shipment.shipping_cost, shipment.shipping_cost_currency)}
                  </Text>
                </div>
              )}

              {shipment.waybill_number && (
                <div className="space-y-1">
                  <Text size="small" className="text-ui-fg-muted">Waybill Number</Text>
                  <Text className="font-medium font-mono">{shipment.waybill_number}</Text>
                </div>
              )}

              {shipment.tracking_number && (
                <div className="space-y-1">
                  <Text size="small" className="text-ui-fg-muted">Tracking Number</Text>
                  <Text className="font-medium font-mono">{shipment.tracking_number}</Text>
                </div>
              )}
            </div>

            {/* Label URL */}
            {shipment.label_url && (
              <div className="pt-2">
                <a
                  href={shipment.label_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ui-fg-interactive hover:underline text-small"
                >
                  Download Shipping Label
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <TruckFast className="w-12 h-12 mx-auto text-ui-fg-muted mb-4" />
            <Text className="text-ui-fg-muted">No Econt shipment created for this order.</Text>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => openDrawer(false)}
            >
              Create Econt Shipment
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {isEditing ? "Edit Econt Shipment" : "Create Econt Shipment"}
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="p-4 space-y-4 overflow-y-auto">
            {/* Delivery Type */}
            <div className="space-y-2">
              <Label>Delivery Type</Label>
              <Select
                value={formData.delivery_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, delivery_type: value as "office" | "address" })
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select delivery type" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="office">Office Pickup</Select.Item>
                  <Select.Item value="address">Address Delivery</Select.Item>
                </Select.Content>
              </Select>
            </div>

            {/* Office Selection */}
            {formData.delivery_type === "office" && (
              <>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select
                    value={selectedCity?.id?.toString() || ""}
                    onValueChange={(value) => {
                      const city = cities.find((c) => c.id.toString() === value)
                      setSelectedCity(city || null)
                      if (city) {
                        setFormData({ ...formData, address_city: city.name })
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder={loadingCities ? "Loading..." : "Select city"} />
                    </Select.Trigger>
                    <Select.Content className="max-h-60">
                      {cities.map((city) => (
                        <Select.Item key={city.id} value={city.id.toString()}>
                          {city.name} ({city.postCode})
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Office</Label>
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
                    disabled={!selectedCity}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder={loadingOffices ? "Loading..." : "Select office"} />
                    </Select.Trigger>
                    <Select.Content className="max-h-60">
                      {offices.map((office) => (
                        <Select.Item key={office.code} value={office.code}>
                          {office.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              </>
            )}

            {/* Address Fields */}
            {formData.delivery_type === "address" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={formData.address_city}
                      onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                      placeholder="Sofia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input
                      value={formData.address_postal_code}
                      onChange={(e) => setFormData({ ...formData, address_postal_code: e.target.value })}
                      placeholder="1000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address Line 1</Label>
                  <Input
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    placeholder="Street, building number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    placeholder="Additional address info"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entrance</Label>
                    <Input
                      value={formData.entrance}
                      onChange={(e) => setFormData({ ...formData, entrance: e.target.value })}
                      placeholder="вх."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Input
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      placeholder="ет."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Apartment</Label>
                    <Input
                      value={formData.apartment}
                      onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      placeholder="ап."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Neighborhood</Label>
                    <Input
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="кв."
                    />
                  </div>
                </div>
              </>
            )}

            {/* Recipient */}
            <div className="border-t pt-4 mt-4">
              <Text className="font-medium mb-4">Recipient Information</Text>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={formData.recipient_first_name}
                    onChange={(e) => setFormData({ ...formData, recipient_first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={formData.recipient_last_name}
                    onChange={(e) => setFormData({ ...formData, recipient_last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.recipient_phone}
                    onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={formData.recipient_email}
                    onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* COD & Options */}
            <div className="border-t pt-4 mt-4">
              <Text className="font-medium mb-4">Payment & Options</Text>
              <div className="space-y-2">
                <Label>COD Amount (EUR / лв.)</Label>
                <Input
                  type="number"
                  value={formData.cod_amount}
                  onChange={(e) => setFormData({ ...formData, cod_amount: Number(e.target.value) })}
                />
              </div>
              <label className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  checked={formData.allow_saturday}
                  onChange={(e) => setFormData({ ...formData, allow_saturday: e.target.checked })}
                  className="rounded"
                />
                <Text size="small">Allow Saturday delivery</Text>
              </label>
            </div>

            {/* Status & Tracking (Edit mode) */}
            {isEditing && (
              <div className="border-t pt-4 mt-4">
                <Text className="font-medium mb-4">Shipment Status</Text>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="draft">Draft</Select.Item>
                      <Select.Item value="ready">Ready</Select.Item>
                      <Select.Item value="registered">Registered</Select.Item>
                      <Select.Item value="in_transit">In Transit</Select.Item>
                      <Select.Item value="delivered">Delivered</Select.Item>
                      <Select.Item value="cancelled">Cancelled</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Waybill Number</Label>
                    <Input
                      value={formData.waybill_number}
                      onChange={(e) => setFormData({ ...formData, waybill_number: e.target.value })}
                      placeholder="Enter waybill number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tracking Number</Label>
                    <Input
                      value={formData.tracking_number}
                      onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                      placeholder="Enter tracking number"
                    />
                  </div>
                </div>
              </div>
            )}
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={isEditing ? handleUpdateShipment : handleCreateShipment}>
              {isEditing ? "Update Shipment" : "Create Shipment"}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default EcontShippingWidget
