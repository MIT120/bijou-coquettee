"use client"

import { useEffect, useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text, Input, clx } from "@medusajs/ui"

type OfficeOption = {
  code: string
  name: string
  city?: string
  address?: string
}

type EcontShippingFormProps = {
  cart: HttpTypes.StoreCart
}

const initialOffice: OfficeOption | null = null

const EcontShippingForm = ({ cart }: EcontShippingFormProps) => {
  const countryCode =
    cart.shipping_address?.country_code?.toLowerCase() ||
    cart.region?.countries?.[0]?.iso_2?.toLowerCase()

  if (countryCode !== "bg") {
    return null
  }

  const [deliveryType, setDeliveryType] = useState<"office" | "address">(
    "office"
  )
  const [officeSearch, setOfficeSearch] = useState("")
  const [officeOptions, setOfficeOptions] = useState<OfficeOption[]>([])
  const [selectedOffice, setSelectedOffice] =
    useState<OfficeOption | null>(initialOffice)
  const [addressCity, setAddressCity] = useState(
    cart.shipping_address?.city || ""
  )
  const [addressPostal, setAddressPostal] = useState(
    cart.shipping_address?.postal_code || ""
  )
  const [addressLine1, setAddressLine1] = useState(
    cart.shipping_address?.address_1 || ""
  )
  const [addressLine2, setAddressLine2] = useState(
    cart.shipping_address?.address_2 || ""
  )
  const [allowSaturday, setAllowSaturday] = useState(false)

  const [loadingOffices, setLoadingOffices] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const codAmount = useMemo(() => {
    return (cart.total || cart.subtotal || 0) / 100
  }, [cart.total, cart.subtotal])

  const recipient = useMemo(
    () => ({
      first_name: cart.shipping_address?.first_name || "",
      last_name: cart.shipping_address?.last_name || "",
      phone: cart.shipping_address?.phone || "",
      email: cart.email || cart.shipping_address?.email || "",
    }),
    [cart.shipping_address, cart.email]
  )

  const fetchOffices = async () => {
    setError(null)
    setLoadingOffices(true)
    try {
      const params = new URLSearchParams({
        type: "office",
      })

      if (officeSearch) {
        params.set("search", officeSearch)
      } else if (cart.shipping_address?.city) {
        params.set("city", cart.shipping_address.city)
      }

      const response = await fetch(`/api/econt/locations?${params.toString()}`)

      const raw = await response.text()
      const data = raw
        ? ((JSON.parse(raw) as { locations?: Array<Record<string, unknown>> }) ??
          {})
        : { locations: [] }

      if (!response.ok) {
        throw new Error(
          (data as { message?: string })?.message ||
            "Unable to load offices."
        )
      }

      const options =
        (data.locations || []).map((loc) => ({
          code: String((loc as any)?.code || (loc as any)?.id || ""),
          name:
            (loc as any)?.name ||
            (loc as any)?.officeName ||
            "Unnamed office",
          city: (loc as any)?.city || (loc as any)?.settlement,
          address: (loc as any)?.address || (loc as any)?.street,
        })) ?? []

      setOfficeOptions(options)
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : "Unable to load office list."
      )
    } finally {
      setLoadingOffices(false)
    }
  }

  useEffect(() => {
    fetchOffices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async () => {
    setError(null)
    setSuccessMessage(null)

    if (deliveryType === "office" && !selectedOffice?.code) {
      setError("Please select an Econt office.")
      return
    }

    if (deliveryType === "address" && (!addressCity || !addressLine1)) {
      setError("Please fill in the city and street for the delivery address.")
      return
    }

    if (!recipient.first_name || !recipient.last_name || !recipient.phone) {
      setError(
        "Please ensure the shipping address includes first name, last name, and phone."
      )
      return
    }

    const payload = {
      cart_id: cart.id,
      delivery_type: deliveryType,
      cod_amount: Number(codAmount.toFixed(2)),
      country_code: "bg",
      recipient,
      office: selectedOffice
        ? {
            office_code: selectedOffice.code,
            office_name: selectedOffice.name,
            city: selectedOffice.city,
          }
        : undefined,
      address:
        deliveryType === "address"
          ? {
              city: addressCity,
              postal_code: addressPostal,
              address_line1: addressLine1,
              address_line2: addressLine2,
              allow_saturday: allowSaturday,
              country_code: "bg",
            }
          : undefined,
      metadata: {
        source: "checkout-form",
      },
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/econt/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const raw = await response.text()
      const data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}

      if (!response.ok) {
        throw new Error(data?.message || "Unable to save preference.")
      }

      setSuccessMessage("Econt shipping preference saved.")
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : "Unable to save preference."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const renderOfficeSelector = () => (
    <div className="flex flex-col gap-y-3">
      <label className="text-ui-fg-base text-small-regular">
        Search Econt office
      </label>
      <div className="flex gap-x-2">
        <Input
          value={officeSearch}
          onChange={(e) => setOfficeSearch(e.target.value)}
          placeholder="City, neighborhood or office name"
        />
        <Button
          type="button"
          isLoading={loadingOffices}
          onClick={fetchOffices}
          variant="secondary"
        >
          Search
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-ui-fg-base text-small-regular">
          Available offices
        </label>
        <select
          className="border rounded-md px-3 py-2 text-small-regular"
          value={selectedOffice?.code || ""}
          onChange={(event) => {
            const option =
              officeOptions.find((opt) => opt.code === event.target.value) ||
              null
            setSelectedOffice(option)
          }}
        >
          <option value="" disabled>
            Select an office
          </option>
          {officeOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
              {option.city ? ` – ${option.city}` : ""}
            </option>
          ))}
        </select>
        {selectedOffice && (
          <Text size="small" className="text-ui-fg-subtle">
            {[selectedOffice.city, selectedOffice.address]
              .filter(Boolean)
              .join(", ")}
          </Text>
        )}
      </div>
    </div>
  )

  const renderAddressForm = () => (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-2">
        <label className="text-ui-fg-base text-small-regular">City</label>
        <Input
          value={addressCity}
          onChange={(e) => setAddressCity(e.target.value)}
          placeholder="Sofia, Plovdiv..."
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-ui-fg-base text-small-regular">
          Postal code
        </label>
        <Input
          value={addressPostal}
          onChange={(e) => setAddressPostal(e.target.value)}
          placeholder="1000"
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-ui-fg-base text-small-regular">
          Address line
        </label>
        <Input
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          placeholder="Street, building number"
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-ui-fg-base text-small-regular">
          Additional info
        </label>
        <Input
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          placeholder="Apartment, entrance, floor..."
        />
      </div>
      <label className="flex items-center gap-2 text-small-regular text-ui-fg-base">
        <input
          type="checkbox"
          checked={allowSaturday}
          onChange={(e) => setAllowSaturday(e.target.checked)}
          className="rounded border-ui-border-strong"
        />
        Allow Saturday delivery
      </label>
    </div>
  )

  return (
    <div className="bg-ui-bg-subtle border rounded-lg p-6 space-y-6">
      <div className="flex flex-col gap-y-2">
        <Heading level="h2">Econt Shipping (Bulgaria only)</Heading>
        <Text size="small">
          Choose whether you want to receive your parcel at an Econt office or
          at your address. All deliveries are cash on delivery.
        </Text>
      </div>

      <div className="flex gap-x-4">
        {(["office", "address"] as Array<"office" | "address">).map((type) => (
          <button
            key={type}
            type="button"
          className={clx(
              "px-4 py-2 rounded-md border text-small-regular",
              deliveryType === type
                ? "border-ui-border-interactive text-ui-fg-base"
                : "border-ui-border-strong text-ui-fg-muted"
            )}
            onClick={() => setDeliveryType(type)}
          >
            {type === "office" ? "Pick up from office" : "Deliver to address"}
          </button>
        ))}
      </div>

      {deliveryType === "office" ? renderOfficeSelector() : renderAddressForm()}

      <div className="flex flex-col gap-y-1">
        <Text size="small" className="text-ui-fg-subtle">
          Cash on delivery amount
        </Text>
        <Text weight="plus" className="text-lg">
          {codAmount.toFixed(2)} {cart.region?.currency_code?.toUpperCase()}
        </Text>
      </div>

      {error && (
        <Text className="text-ui-fg-error text-small-regular">{error}</Text>
      )}

      {successMessage && (
        <Text className="text-ui-fg-success text-small-regular">
          {successMessage}
        </Text>
      )}

      <Button
        type="button"
        isLoading={isSaving}
        onClick={handleSave}
        className="w-full md:w-auto"
      >
        Save Econt shipping preference
      </Button>
    </div>
  )
}

export default EcontShippingForm

