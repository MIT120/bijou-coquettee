"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text, Input, clx } from "@medusajs/ui"

type CityOption = {
  id: number
  name: string
  nameEn: string
  postCode: string
  regionName?: string
  regionNameEn?: string
}

type OfficeOption = {
  id?: number
  code: string
  name: string
  nameEn?: string
  cityId?: number
  cityName?: string
  cityNameEn?: string
  address?: string
  addressEn?: string
}

type EcontShippingFormProps = {
  cart: HttpTypes.StoreCart
}

// Searchable dropdown component
const SearchableDropdown = <T extends { id?: number | string }>({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  renderOption,
  renderSelected,
  loading,
  disabled,
  emptyMessage,
  getKey,
}: {
  options: T[]
  value: T | null
  onChange: (option: T | null) => void
  placeholder: string
  searchPlaceholder: string
  renderOption: (option: T) => React.ReactNode
  renderSelected?: (option: T) => React.ReactNode
  loading?: boolean
  disabled?: boolean
  emptyMessage?: string
  getKey: (option: T) => string | number
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options
    const searchLower = search.toLowerCase()
    return options.filter((option) => {
      const optionText = JSON.stringify(option).toLowerCase()
      return optionText.includes(searchLower)
    })
  }, [options, search])

  const handleSelect = (option: T) => {
    onChange(option)
    setIsOpen(false)
    setSearch("")
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Selected value or placeholder */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className={clx(
          "w-full border rounded-md px-3 py-2 text-left text-small-regular bg-white",
          "flex items-center justify-between",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-ui-border-interactive",
          isOpen && "border-ui-border-interactive ring-1 ring-ui-border-interactive"
        )}
      >
        <span className={value ? "text-ui-fg-base" : "text-ui-fg-muted"}>
          {value ? (renderSelected ? renderSelected(value) : renderOption(value)) : placeholder}
        </span>
        <svg
          className={clx("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b sticky top-0 bg-white">
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full"
            />
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-ui-fg-muted text-small-regular">
                Loading...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-ui-fg-muted text-small-regular">
                {emptyMessage || "No options found"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={getKey(option)}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={clx(
                    "w-full px-3 py-2 text-left text-small-regular hover:bg-ui-bg-base-hover",
                    "border-b border-ui-border-base last:border-b-0",
                    value && getKey(value) === getKey(option) && "bg-ui-bg-base"
                  )}
                >
                  {renderOption(option)}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const EcontShippingForm = ({ cart }: EcontShippingFormProps) => {
  const countryCode =
    cart.shipping_address?.country_code?.toLowerCase() ||
    cart.region?.countries?.[0]?.iso_2?.toLowerCase()

  const isBulgaria = countryCode === "bg"

  const [deliveryType, setDeliveryType] = useState<"office" | "address">("office")

  // City state
  const [cities, setCities] = useState<CityOption[]>([])
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null)
  const [loadingCities, setLoadingCities] = useState(false)

  // Office state
  const [offices, setOffices] = useState<OfficeOption[]>([])
  const [selectedOffice, setSelectedOffice] = useState<OfficeOption | null>(null)
  const [loadingOffices, setLoadingOffices] = useState(false)

  // Address state (for address delivery)
  const [addressCity, setAddressCity] = useState(cart.shipping_address?.city || "")
  const [addressPostal, setAddressPostal] = useState(cart.shipping_address?.postal_code || "")
  const [addressLine1, setAddressLine1] = useState(cart.shipping_address?.address_1 || "")
  const [addressLine2, setAddressLine2] = useState(cart.shipping_address?.address_2 || "")
  const [allowSaturday, setAllowSaturday] = useState(false)

  // Recipient state
  const [firstName, setFirstName] = useState(cart.shipping_address?.first_name || "")
  const [lastName, setLastName] = useState(cart.shipping_address?.last_name || "")
  const [phone, setPhone] = useState(cart.shipping_address?.phone || "")
  const [email, setEmail] = useState(cart.email || "")

  // Form state
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingPreference, setIsLoadingPreference] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [hasSavedPreference, setHasSavedPreference] = useState(false)

  // Ref to store saved preference for restoring selections after data loads
  const savedPreferenceRef = useRef<{
    office_code?: string
    office_name?: string
    city?: string
    cityId?: number
  } | null>(null)

  const codAmount = useMemo(() => {
    return (cart.total || cart.subtotal || 0) / 100
  }, [cart.total, cart.subtotal])

  const recipient = useMemo(
    () => ({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      email: email,
    }),
    [firstName, lastName, phone, email]
  )

  // Fetch saved preference
  const fetchSavedPreference = useCallback(async () => {
    if (!cart.id) return null

    setIsLoadingPreference(true)
    try {
      const response = await fetch(`/api/econt/preferences?cart_id=${cart.id}`)
      const data = await response.json()

      if (response.ok && data.preference) {
        const pref = data.preference
        setHasSavedPreference(true)

        // Restore delivery type
        setDeliveryType(pref.delivery_type || "office")

        // Restore recipient info
        if (pref.recipient_first_name) setFirstName(pref.recipient_first_name)
        if (pref.recipient_last_name) setLastName(pref.recipient_last_name)
        if (pref.recipient_phone) setPhone(pref.recipient_phone)
        if (pref.recipient_email) setEmail(pref.recipient_email)

        // Restore address fields (for address delivery)
        if (pref.address_city) setAddressCity(pref.address_city)
        if (pref.address_postal_code) setAddressPostal(pref.address_postal_code)
        if (pref.address_line1) setAddressLine1(pref.address_line1)
        if (pref.address_line2) setAddressLine2(pref.address_line2)
        if (pref.allow_saturday) setAllowSaturday(pref.allow_saturday)

        // Store office/city data in ref to restore after dropdowns load
        if (pref.office_code || pref.address_city) {
          savedPreferenceRef.current = {
            office_code: pref.office_code,
            office_name: pref.office_name,
            city: pref.address_city,
          }
        }

        return pref
      }
      return null
    } catch (err) {
      console.error("Failed to load Econt preference:", err)
      return null
    } finally {
      setIsLoadingPreference(false)
    }
  }, [cart.id])

  // Fetch cities
  const fetchCities = useCallback(async () => {
    setLoadingCities(true)
    setError(null)
    try {
      const response = await fetch(`/api/econt/locations?type=city`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load cities.")
      }

      setCities(data.locations || [])
      return data.locations || []
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unable to load cities.")
      return []
    } finally {
      setLoadingCities(false)
    }
  }, [])


  // Load saved preference and cities on mount
  useEffect(() => {
    if (!isBulgaria) return

    const loadData = async () => {
      // First fetch the saved preference
      await fetchSavedPreference()
      // Then fetch cities
      const loadedCities = await fetchCities()

      // Try to restore city selection from saved preference ref
      const savedPref = savedPreferenceRef.current
      if (savedPref?.city && loadedCities.length > 0) {
        // Find the city by name
        const city = loadedCities.find(
          (c: CityOption) => c.name === savedPref.city || c.nameEn === savedPref.city
        )
        if (city) {
          setSelectedCity(city)
        }
      }
    }
    loadData()
  }, [fetchSavedPreference, fetchCities, cart.id, isBulgaria])

  // Load offices when city changes and restore office selection
  useEffect(() => {
    if (selectedCity) {
      const loadOffices = async () => {
        setLoadingOffices(true)
        try {
          const params = new URLSearchParams({ type: "office" })
          params.set("cityId", String(selectedCity.id))

          const response = await fetch(`/api/econt/locations?${params.toString()}`)
          const data = await response.json()

          if (response.ok) {
            const loadedOffices = data.locations || []
            setOffices(loadedOffices)

            // Try to restore office selection from saved preference ref
            const savedPref = savedPreferenceRef.current
            if (savedPref?.office_code && loadedOffices.length > 0) {
              const office = loadedOffices.find(
                (o: OfficeOption) => o.code === savedPref.office_code
              )
              if (office) {
                setSelectedOffice(office)
                // Clear ref after successful restore to prevent re-selecting on city change
                savedPreferenceRef.current = null
              }
            }
          }
        } catch (err) {
          console.error(err)
        } finally {
          setLoadingOffices(false)
        }
      }
      loadOffices()
    } else {
      setOffices([])
    }
  }, [selectedCity])

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
            city: selectedOffice.cityName || selectedCity?.name,
            // Include full address for display
            address: selectedOffice.address,
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
        office_address: selectedOffice?.address,
        selected_city: selectedCity?.name,
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

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.message || "Unable to save preference.")
      }

      setSuccessMessage("Econt shipping preference saved!")
      setHasSavedPreference(true)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unable to save preference.")
    } finally {
      setIsSaving(false)
    }
  }

  const renderOfficeSelector = () => (
    <div className="flex flex-col gap-y-4">
      {/* City Selection */}
      <div className="flex flex-col gap-y-2">
        <label className="text-ui-fg-base text-small-regular font-medium">
          1. Select City
        </label>
        <SearchableDropdown
          options={cities}
          value={selectedCity}
          onChange={setSelectedCity}
          placeholder="Select a city..."
          searchPlaceholder="Search by city name, postal code, or region..."
          loading={loadingCities}
          getKey={(city) => city.id}
          renderOption={(city) => (
            <div className="flex flex-col">
              <span className="font-medium">{city.name}</span>
              <span className="text-ui-fg-subtle text-xs">
                {city.postCode} {city.regionName && `• ${city.regionName}`}
              </span>
            </div>
          )}
          renderSelected={(city) => (
            <span>{city.name} ({city.postCode})</span>
          )}
          emptyMessage="No cities found. Try a different search."
        />
        {selectedCity && (
          <div className="bg-ui-bg-base border rounded-md p-3 text-small-regular">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-ui-fg-subtle">City: </span>
                <span className="font-medium">{selectedCity.name}</span>
              </div>
              <div>
                <span className="text-ui-fg-subtle">Postal Code: </span>
                <span className="font-medium">{selectedCity.postCode}</span>
              </div>
              {selectedCity.regionName && (
                <div className="col-span-2">
                  <span className="text-ui-fg-subtle">Region: </span>
                  <span className="font-medium">{selectedCity.regionName}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Office Selection */}
      <div className="flex flex-col gap-y-2">
        <label className="text-ui-fg-base text-small-regular font-medium">
          2. Select Office
        </label>
        {!selectedCity ? (
          <div className="border border-dashed rounded-md p-4 text-center">
            <Text size="small" className="text-ui-fg-muted">
              Please select a city first to see available offices
            </Text>
          </div>
        ) : (
          <>
            <SearchableDropdown
              options={offices}
              value={selectedOffice}
              onChange={setSelectedOffice}
              placeholder="Select an office..."
              searchPlaceholder="Search by office name or address..."
              loading={loadingOffices}
              disabled={!selectedCity}
              getKey={(office) => office.code}
              renderOption={(office) => (
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{office.name}</span>
                  {office.address && (
                    <span className="text-ui-fg-subtle text-xs line-clamp-2">
                      {office.address}
                    </span>
                  )}
                </div>
              )}
              renderSelected={(office) => office.name}
              emptyMessage={`No offices found in ${selectedCity?.name || 'this city'}.`}
            />

            {/* Selected office details */}
            {selectedOffice && (
              <div className="bg-ui-bg-base border rounded-md p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-ui-bg-subtle rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-ui-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text size="small" weight="plus" className="text-ui-fg-base">
                      {selectedOffice.name}
                    </Text>
                    {selectedOffice.nameEn && selectedOffice.nameEn !== selectedOffice.name && (
                      <Text size="small" className="text-ui-fg-muted">
                        {selectedOffice.nameEn}
                      </Text>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-ui-fg-subtle mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div>
                      <Text size="small" className="text-ui-fg-subtle">Address</Text>
                      <Text size="small" className="text-ui-fg-base">
                        {selectedOffice.address || "Address not available"}
                      </Text>
                      {selectedOffice.addressEn && selectedOffice.addressEn !== selectedOffice.address && (
                        <Text size="small" className="text-ui-fg-muted">
                          {selectedOffice.addressEn}
                        </Text>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-ui-fg-subtle mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <div>
                      <Text size="small" className="text-ui-fg-subtle">Office Code</Text>
                      <Text size="small" className="text-ui-fg-base font-mono">
                        {selectedOffice.code}
                      </Text>
                    </div>
                  </div>

                  {selectedOffice.cityName && (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-ui-fg-subtle mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <Text size="small" className="text-ui-fg-subtle">City</Text>
                        <Text size="small" className="text-ui-fg-base">
                          {selectedOffice.cityName}
                          {selectedOffice.cityNameEn && selectedOffice.cityNameEn !== selectedOffice.cityName && (
                            <span className="text-ui-fg-muted"> ({selectedOffice.cityNameEn})</span>
                          )}
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Office count */}
            {offices.length > 0 && (
              <Text size="small" className="text-ui-fg-muted">
                {offices.length} office{offices.length !== 1 ? "s" : ""} available in {selectedCity.name}
              </Text>
            )}
          </>
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
        <label className="text-ui-fg-base text-small-regular">Postal code</label>
        <Input
          value={addressPostal}
          onChange={(e) => setAddressPostal(e.target.value)}
          placeholder="1000"
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-ui-fg-base text-small-regular">Address line</label>
        <Input
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          placeholder="Street, building number"
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-ui-fg-base text-small-regular">Additional info</label>
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

  // Only show for Bulgaria
  if (!isBulgaria) {
    return null
  }

  // Show loading state while fetching saved preference
  if (isLoadingPreference) {
    return (
      <div className="bg-ui-bg-subtle border rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-ui-border-base border-t-ui-fg-base rounded-full"></div>
          <Text>Loading Econt shipping preferences...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ui-bg-subtle border rounded-lg p-6 space-y-6">
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <Heading level="h2">Econt Shipping (Bulgaria only)</Heading>
          {hasSavedPreference && (
            <span className="text-ui-fg-success text-small-regular flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Saved
            </span>
          )}
        </div>
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
              "px-4 py-2 rounded-md border text-small-regular transition-colors",
              deliveryType === type
                ? "border-ui-border-interactive text-ui-fg-base bg-ui-bg-base"
                : "border-ui-border-strong text-ui-fg-muted hover:border-ui-border-base"
            )}
            onClick={() => setDeliveryType(type)}
          >
            {type === "office" ? "Pick up from office" : "Deliver to address"}
          </button>
        ))}
      </div>

      {deliveryType === "office" ? renderOfficeSelector() : renderAddressForm()}

      {/* Recipient Information */}
      <div className="border-t pt-4">
        <Text className="font-medium mb-4">Recipient Information</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 gap-2">
            <label className="text-ui-fg-base text-small-regular">First Name *</label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-ui-fg-base text-small-regular">Last Name *</label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-ui-fg-base text-small-regular">Phone *</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+359 888 123 456"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-ui-fg-base text-small-regular">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              type="email"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-1">
        <Text size="small" className="text-ui-fg-subtle">
          Cash on delivery amount
        </Text>
        <Text weight="plus" className="text-lg">
          {codAmount.toFixed(2)} {cart.region?.currency_code?.toUpperCase()}
        </Text>
      </div>

      {error && (
        <div className="bg-ui-bg-base border border-ui-border-error rounded-md p-3">
          <Text className="text-ui-fg-error text-small-regular">{error}</Text>
        </div>
      )}

      {successMessage && (
        <div className="bg-ui-bg-base border border-ui-border-success rounded-md p-3">
          <Text className="text-ui-fg-success text-small-regular">{successMessage}</Text>
        </div>
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
