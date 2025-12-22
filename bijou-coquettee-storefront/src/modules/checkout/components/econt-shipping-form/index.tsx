"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text, Input, clx } from "@medusajs/ui"
import { convertToLocale } from "@lib/util/money"
import { noDivisionCurrencies } from "@lib/constants"

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

/**
 * Validates Bulgarian phone number format.
 * Accepts formats: +359XXXXXXXXX, 0XXXXXXXXX, 08XXXXXXXX, 359XXXXXXXXX
 */
const validateBulgarianPhone = (phone: string): { valid: boolean; formatted: string; error?: string } => {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, "")

  // Check if empty
  if (!cleaned) {
    return { valid: false, formatted: phone, error: "Моля, въведете телефонен номер" }
  }

  // Bulgarian mobile patterns
  const patterns = [
    /^(\+359|00359|359)(8[789]\d{7})$/, // +359 8X XXX XXXX (mobile)
    /^0(8[789]\d{7})$/,                  // 08X XXX XXXX (mobile, local format)
    /^(\+359|00359|359)(2\d{7})$/,       // +359 2 XXX XXXX (Sofia landline)
    /^0(2\d{7})$/,                        // 02 XXX XXXX (Sofia landline, local)
    /^(\+359|00359|359)([3-9]\d{7,8})$/, // Other landlines
    /^0([3-9]\d{7,8})$/,                  // Other landlines, local format
  ]

  for (const pattern of patterns) {
    if (pattern.test(cleaned)) {
      // Format to international format for Econt
      let formatted = cleaned
      if (cleaned.startsWith("0") && !cleaned.startsWith("00")) {
        formatted = "+359" + cleaned.substring(1)
      } else if (cleaned.startsWith("359") && !cleaned.startsWith("+")) {
        formatted = "+" + cleaned
      } else if (cleaned.startsWith("00359")) {
        formatted = "+" + cleaned.substring(2)
      }
      return { valid: true, formatted }
    }
  }

  return {
    valid: false,
    formatted: phone,
    error: "Невалиден телефонен номер. Използвайте формат: +359 8XX XXX XXX или 08XX XXX XXX"
  }
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
  const [phoneError, setPhoneError] = useState<string | null>(null)

  // Ref to store saved preference for restoring selections after data loads
  const savedPreferenceRef = useRef<{
    office_code?: string
    office_name?: string
    city?: string
    cityId?: number
  } | null>(null)

  // Helper to extract office code from address_2 (format: "Office Code: XXXX")
  const extractOfficeCodeFromAddress = useCallback(() => {
    const address2 = cart.shipping_address?.address_2 || ""
    const match = address2.match(/Office Code:\s*(\w+)/i)
    return match ? match[1] : null
  }, [cart.shipping_address?.address_2])

  // Helper to extract office name from address_1 (format: "Econt Office: Name")
  const extractOfficeNameFromAddress = useCallback(() => {
    const address1 = cart.shipping_address?.address_1 || ""
    const match = address1.match(/Econt Office:\s*(.+)/i)
    return match ? match[1].trim() : null
  }, [cart.shipping_address?.address_1])

  // Calculate the total COD amount including shipping (in decimal format for API)
  // cart.total = subtotal + shipping_total + tax_total - discount_total - gift_card_total
  const codAmount = useMemo(() => {
    const currencyCode = cart.region?.currency_code?.toLowerCase() || "eur"
    const divisor = noDivisionCurrencies.includes(currencyCode) ? 1 : 100

    if (cart.total !== undefined && cart.total !== null) {
      return cart.total / divisor
    }
    // Fallback: calculate from components if total is not available
    const subtotal = cart.subtotal || 0
    const shippingTotal = cart.shipping_total || 0
    const taxTotal = cart.tax_total || 0
    const discountTotal = cart.discount_total || 0
    return (subtotal + shippingTotal + taxTotal - discountTotal) / divisor
  }, [cart.total, cart.subtotal, cart.shipping_total, cart.tax_total, cart.discount_total, cart.region?.currency_code])

  // Formatted COD amount for display
  const formattedCodAmount = useMemo(() => {
    const total = cart.total ?? 0
    return convertToLocale({
      amount: total,
      currency_code: cart.region?.currency_code || "eur",
    })
  }, [cart.total, cart.region?.currency_code])

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

      // Handle non-JSON responses gracefully
      let data: Record<string, unknown>
      try {
        data = await response.json()
      } catch {
        console.warn("Failed to parse preferences response as JSON")
        return null
      }

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

      // Handle non-JSON responses gracefully
      let data: Record<string, unknown>
      try {
        data = await response.json()
      } catch {
        throw new Error("Сървърът върна невалиден отговор. Моля, опитайте отново.")
      }

      if (!response.ok) {
        throw new Error((data?.message as string) || "Unable to load cities.")
      }

      const locations = (data.locations as CityOption[]) || []
      setCities(locations)
      return locations
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
      const savedPref = await fetchSavedPreference()
      // Then fetch cities
      const loadedCities = await fetchCities()

      // Try to restore city selection from saved preference ref
      const prefRef = savedPreferenceRef.current
      if (prefRef?.city && loadedCities.length > 0) {
        // Find the city by name from saved preference
        const city = loadedCities.find(
          (c: CityOption) => c.name === prefRef.city || c.nameEn === prefRef.city
        )
        if (city) {
          setSelectedCity(city)
          return // Preference found, no need to fallback
        }
      }

      // Fallback: Try to pre-select city from shipping address if no saved preference
      if (!savedPref && loadedCities.length > 0) {
        const shippingCity = cart.shipping_address?.city
        if (shippingCity) {
          // Find exact match first
          let city = loadedCities.find(
            (c: CityOption) =>
              c.name.toLowerCase() === shippingCity.toLowerCase() ||
              c.nameEn?.toLowerCase() === shippingCity.toLowerCase()
          )

          // If no exact match, try partial match
          if (!city) {
            city = loadedCities.find(
              (c: CityOption) =>
                c.name.toLowerCase().includes(shippingCity.toLowerCase()) ||
                shippingCity.toLowerCase().includes(c.name.toLowerCase())
            )
          }

          if (city) {
            setSelectedCity(city)

            // Also store office code from address for later restoration
            const officeCode = extractOfficeCodeFromAddress()
            const officeName = extractOfficeNameFromAddress()
            if (officeCode || officeName) {
              savedPreferenceRef.current = {
                office_code: officeCode || undefined,
                office_name: officeName || undefined,
                city: shippingCity,
              }
            }
          }
        }
      }
    }
    loadData()
  }, [fetchSavedPreference, fetchCities, cart.id, isBulgaria, cart.shipping_address?.city, extractOfficeCodeFromAddress, extractOfficeNameFromAddress])

  // Load offices when city changes and restore office selection
  useEffect(() => {
    if (selectedCity) {
      const loadOffices = async () => {
        setLoadingOffices(true)
        try {
          const params = new URLSearchParams({ type: "office" })
          params.set("cityId", String(selectedCity.id))

          const response = await fetch(`/api/econt/locations?${params.toString()}`)

          // Handle non-JSON responses gracefully
          let data: Record<string, unknown>
          try {
            data = await response.json()
          } catch {
            console.warn("Failed to parse offices response as JSON")
            setOffices([])
            return
          }

          if (response.ok) {
            const loadedOffices = (data.locations as OfficeOption[]) || []
            setOffices(loadedOffices)

            // Try to restore office selection from saved preference ref
            const savedPref = savedPreferenceRef.current
            if (loadedOffices.length > 0 && (savedPref?.office_code || savedPref?.office_name)) {
              let office: OfficeOption | undefined

              // First try to match by office code
              if (savedPref.office_code) {
                office = loadedOffices.find(
                  (o: OfficeOption) => o.code === savedPref.office_code
                )
              }

              // If not found by code, try to match by office name
              if (!office && savedPref.office_name) {
                office = loadedOffices.find(
                  (o: OfficeOption) =>
                    o.name.toLowerCase() === savedPref.office_name?.toLowerCase() ||
                    o.name.toLowerCase().includes(savedPref.office_name?.toLowerCase() || "") ||
                    savedPref.office_name?.toLowerCase().includes(o.name.toLowerCase())
                )
              }

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
        "Моля, попълнете име, фамилия и телефон за получаване."
      )
      return
    }

    // Validate phone number
    const phoneValidation = validateBulgarianPhone(recipient.phone)
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.error || "Невалиден телефонен номер")
      setError(phoneValidation.error || "Невалиден телефонен номер")
      return
    }

    const payload = {
      cart_id: cart.id,
      delivery_type: deliveryType,
      cod_amount: Number(codAmount.toFixed(2)),
      country_code: "bg",
      recipient: {
        ...recipient,
        phone: phoneValidation.formatted, // Use validated/formatted phone
      },
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
          1. Изберете град
        </label>
        <SearchableDropdown
          options={cities}
          value={selectedCity}
          onChange={setSelectedCity}
          placeholder="Изберете град..."
          searchPlaceholder="Търсене по име на град, пощенски код или област..."
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
          emptyMessage="Няма намерени градове. Опитайте друго търсене."
        />
        {selectedCity && (
          <div className="bg-white border rounded-lg p-3 text-small-regular">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-ui-fg-subtle">Град: </span>
                <span className="font-medium">{selectedCity.name}</span>
              </div>
              <div>
                <span className="text-ui-fg-subtle">Пощенски код: </span>
                <span className="font-medium">{selectedCity.postCode}</span>
              </div>
              {selectedCity.regionName && (
                <div className="col-span-2">
                  <span className="text-ui-fg-subtle">Област: </span>
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
          2. Изберете офис
        </label>
        {!selectedCity ? (
          <div className="border border-dashed rounded-lg p-4 text-center bg-white">
            <Text size="small" className="text-ui-fg-muted">
              Моля, първо изберете град, за да видите наличните офиси
            </Text>
          </div>
        ) : (
          <>
            <SearchableDropdown
              options={offices}
              value={selectedOffice}
              onChange={setSelectedOffice}
              placeholder="Изберете офис..."
              searchPlaceholder="Търсене по име на офис или адрес..."
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
              emptyMessage={`Няма намерени офиси в ${selectedCity?.name || 'този град'}.`}
            />

            {/* Selected office details */}
            {selectedOffice && (
              <div className="bg-white border rounded-lg p-4 space-y-3">
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
                      <Text size="small" className="text-ui-fg-subtle">Адрес</Text>
                      <Text size="small" className="text-ui-fg-base">
                        {selectedOffice.address || "Адресът не е наличен"}
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
                      <Text size="small" className="text-ui-fg-subtle">Код на офис</Text>
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
                        <Text size="small" className="text-ui-fg-subtle">Град</Text>
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
                {offices.length} {offices.length === 1 ? "офис" : "офиса"} в {selectedCity.name}
              </Text>
            )}
          </>
        )}
      </div>
    </div>
  )

  const renderAddressForm = () => (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 gap-2">
          <label className="text-ui-fg-base text-small-regular font-medium">Град *</label>
          <Input
            value={addressCity}
            onChange={(e) => setAddressCity(e.target.value)}
            placeholder="София, Пловдив..."
          />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <label className="text-ui-fg-base text-small-regular font-medium">Пощенски код</label>
          <Input
            value={addressPostal}
            onChange={(e) => setAddressPostal(e.target.value)}
            placeholder="1000"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-ui-fg-base text-small-regular font-medium">Адрес *</label>
        <Input
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          placeholder="Улица, номер на сграда"
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-ui-fg-base text-small-regular font-medium">Допълнителна информация</label>
        <Input
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          placeholder="Апартамент, вход, етаж..."
        />
      </div>
      <label className="flex items-center gap-3 text-small-regular text-ui-fg-base bg-white border rounded-lg p-3 cursor-pointer hover:bg-ui-bg-subtle transition-colors">
        <input
          type="checkbox"
          checked={allowSaturday}
          onChange={(e) => setAllowSaturday(e.target.checked)}
          className="rounded border-ui-border-strong w-4 h-4"
        />
        <div>
          <span className="font-medium">Доставка в събота</span>
          <Text size="small" className="text-ui-fg-muted block">
            Разрешете доставка в събота (ако е налична)
          </Text>
        </div>
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
          <Text>Зареждане на предпочитанията за доставка...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ui-bg-subtle border rounded-lg p-6 space-y-6">
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <Heading level="h2">Доставка с Econt</Heading>
          {hasSavedPreference && (
            <span className="text-ui-fg-success text-small-regular flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Запазено
            </span>
          )}
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          Изберете дали искате да получите пратката в офис на Econt или на адрес.
          Всички доставки са с наложен платеж.
        </Text>
      </div>

      {/* Delivery Type Selection - Card Style */}
      <div className="space-y-3">
        <Text size="small" weight="plus" className="text-ui-fg-base">
          Начин на доставка
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Office Pickup Option */}
          <button
            type="button"
            onClick={() => setDeliveryType("office")}
            className={clx(
              "relative flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200 text-left",
              deliveryType === "office"
                ? "border-ui-border-interactive bg-white shadow-sm"
                : "border-ui-border-base bg-white hover:border-ui-border-strong hover:shadow-sm"
            )}
          >
            {/* Selection indicator */}
            <div className={clx(
              "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              deliveryType === "office"
                ? "border-ui-border-interactive bg-ui-bg-interactive"
                : "border-ui-border-base"
            )}>
              {deliveryType === "office" && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Icon */}
            <div className={clx(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
              deliveryType === "office" ? "bg-ui-bg-interactive-pressed" : "bg-ui-bg-subtle"
            )}>
              <svg className={clx("w-5 h-5", deliveryType === "office" ? "text-ui-fg-on-color" : "text-ui-fg-subtle")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            <Text weight="plus" className="text-ui-fg-base mb-1">
              До офис на Econt
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Вземете пратката от избран офис на Econt
            </Text>
          </button>

          {/* Address Delivery Option */}
          <button
            type="button"
            onClick={() => setDeliveryType("address")}
            className={clx(
              "relative flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200 text-left",
              deliveryType === "address"
                ? "border-ui-border-interactive bg-white shadow-sm"
                : "border-ui-border-base bg-white hover:border-ui-border-strong hover:shadow-sm"
            )}
          >
            {/* Selection indicator */}
            <div className={clx(
              "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              deliveryType === "address"
                ? "border-ui-border-interactive bg-ui-bg-interactive"
                : "border-ui-border-base"
            )}>
              {deliveryType === "address" && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Icon */}
            <div className={clx(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
              deliveryType === "address" ? "bg-ui-bg-interactive-pressed" : "bg-ui-bg-subtle"
            )}>
              <svg className={clx("w-5 h-5", deliveryType === "address" ? "text-ui-fg-on-color" : "text-ui-fg-subtle")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>

            <Text weight="plus" className="text-ui-fg-base mb-1">
              До адрес
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Доставка до вашия адрес
            </Text>
          </button>
        </div>
      </div>

      {/* Location Selection Section */}
      <div className="border-t pt-6">
        {deliveryType === "office" ? renderOfficeSelector() : renderAddressForm()}
      </div>

      {/* Recipient Information */}
      <div className="border-t pt-6">
        <Text weight="plus" className="text-ui-fg-base mb-4">Данни за получател</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 gap-2">
            <label className="text-ui-fg-base text-small-regular">Име *</label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Въведете име"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-ui-fg-base text-small-regular">Фамилия *</label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Въведете фамилия"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-ui-fg-base text-small-regular">Телефон *</label>
            <Input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setPhoneError(null) // Clear error on change
              }}
              onBlur={() => {
                // Validate on blur
                if (phone) {
                  const validation = validateBulgarianPhone(phone)
                  if (!validation.valid) {
                    setPhoneError(validation.error || null)
                  } else {
                    setPhoneError(null)
                  }
                }
              }}
              placeholder="+359 888 123 456"
              required
              className={phoneError ? "border-red-500" : ""}
            />
            {phoneError && (
              <Text size="small" className="text-red-600">{phoneError}</Text>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-ui-fg-base text-small-regular">Имейл</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              type="email"
            />
          </div>
        </div>
      </div>

      {/* COD Amount */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
            />
          </svg>
          <div>
            <Text size="small" className="text-green-800 font-medium">
              Сума за наложен платеж
            </Text>
            <Text size="small" className="text-green-700">
              Плащате при получаване
            </Text>
          </div>
        </div>
        <Text weight="plus" className="text-xl text-green-800">
          {formattedCodAmount}
        </Text>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <Text className="text-red-800 text-small-regular">{error}</Text>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <Text className="text-green-800 text-small-regular">{successMessage}</Text>
        </div>
      )}

      <Button
        type="button"
        size="large"
        isLoading={isSaving}
        onClick={handleSave}
        className="w-full"
      >
        Запази предпочитанията за доставка
      </Button>
    </div>
  )
}

export default EcontShippingForm
