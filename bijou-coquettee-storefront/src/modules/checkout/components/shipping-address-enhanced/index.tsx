"use client"

import { Input, Label, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import CountrySelect from "../country-select"
import { useState } from "react"

type ShippingAddressEnhancedProps = {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}

const ShippingAddressEnhanced = ({
  customer,
  cart,
  checked,
  onChange,
}: ShippingAddressEnhancedProps) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? "" : "Please enter a valid email address"
  }

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "")
    return cleaned.length >= 9 ? "" : "Phone number must be at least 9 digits"
  }

  const handleBlur = (fieldName: string, value: string) => {
    let error = ""

    switch (fieldName) {
      case "email":
        error = validateEmail(value)
        break
      case "phone":
        error = validatePhone(value)
        break
      case "first_name":
      case "last_name":
      case "address_1":
      case "city":
      case "postal_code":
        error = !value ? "This field is required" : ""
        break
    }

    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }))
  }

  return (
    <div className="space-y-6">
      {/* Customer addresses quick select (if logged in) */}
      {customer && customer.addresses && customer.addresses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Text className="font-semibold text-blue-900 mb-3 text-sm">
            Use a saved address
          </Text>
          <div className="space-y-2">
            {customer.addresses.map((address) => (
              <button
                key={address.id}
                type="button"
                className="w-full text-left bg-white border border-blue-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onClick={() => {
                  // Populate form with saved address
                  const form = document.querySelector("form")
                  if (form) {
                    const elements = form.elements as any
                    if (elements["shipping_address.first_name"])
                      elements["shipping_address.first_name"].value = address.first_name || ""
                    if (elements["shipping_address.last_name"])
                      elements["shipping_address.last_name"].value = address.last_name || ""
                    if (elements["shipping_address.address_1"])
                      elements["shipping_address.address_1"].value = address.address_1 || ""
                    if (elements["shipping_address.address_2"])
                      elements["shipping_address.address_2"].value = address.address_2 || ""
                    if (elements["shipping_address.city"])
                      elements["shipping_address.city"].value = address.city || ""
                    if (elements["shipping_address.postal_code"])
                      elements["shipping_address.postal_code"].value = address.postal_code || ""
                    if (elements["shipping_address.phone"])
                      elements["shipping_address.phone"].value = address.phone || ""
                  }
                }}
              >
                <Text className="font-medium text-sm text-gray-900">
                  {address.first_name} {address.last_name}
                </Text>
                <Text className="text-xs text-gray-600">
                  {address.address_1}, {address.city} {address.postal_code}
                </Text>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact Information Section */}
      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
        <Text className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Contact Information
        </Text>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={cart?.email}
              onBlur={(e) => handleBlur("email", e.target.value)}
              className={fieldErrors.email ? "border-red-500" : ""}
            />
            {fieldErrors.email && (
              <Text className="text-red-600 text-xs mt-1">{fieldErrors.email}</Text>
            )}
            <Text className="text-xs text-gray-500 mt-1">
              Order confirmation will be sent to this email
            </Text>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="shipping_address.phone"
              type="tel"
              autoComplete="tel"
              required
              defaultValue={cart?.shipping_address?.phone}
              placeholder="+359 8XX XXX XXX"
              onBlur={(e) => handleBlur("phone", e.target.value)}
              className={fieldErrors.phone ? "border-red-500" : ""}
            />
            {fieldErrors.phone && (
              <Text className="text-red-600 text-xs mt-1">{fieldErrors.phone}</Text>
            )}
            <Text className="text-xs text-gray-500 mt-1">
              For delivery updates and courier contact
            </Text>
          </div>
        </div>
      </div>

      {/* Shipping Address Section */}
      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
        <Text className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Shipping Address
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="first_name"
              name="shipping_address.first_name"
              autoComplete="given-name"
              required
              defaultValue={cart?.shipping_address?.first_name}
              onBlur={(e) => handleBlur("first_name", e.target.value)}
              className={fieldErrors.first_name ? "border-red-500" : ""}
            />
            {fieldErrors.first_name && (
              <Text className="text-red-600 text-xs mt-1">{fieldErrors.first_name}</Text>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last_name"
              name="shipping_address.last_name"
              autoComplete="family-name"
              required
              defaultValue={cart?.shipping_address?.last_name}
              onBlur={(e) => handleBlur("last_name", e.target.value)}
              className={fieldErrors.last_name ? "border-red-500" : ""}
            />
            {fieldErrors.last_name && (
              <Text className="text-red-600 text-xs mt-1">{fieldErrors.last_name}</Text>
            )}
          </div>

          {/* Company (Optional) */}
          <div className="md:col-span-2">
            <Label htmlFor="company" className="text-sm font-medium text-gray-700 mb-1">
              Company (Optional)
            </Label>
            <Input
              id="company"
              name="shipping_address.company"
              autoComplete="organization"
              defaultValue={cart?.shipping_address?.company}
            />
          </div>

          {/* Address Line 1 */}
          <div className="md:col-span-2">
            <Label htmlFor="address_1" className="text-sm font-medium text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address_1"
              name="shipping_address.address_1"
              autoComplete="address-line1"
              required
              placeholder="Street name and number"
              defaultValue={cart?.shipping_address?.address_1}
              onBlur={(e) => handleBlur("address_1", e.target.value)}
              className={fieldErrors.address_1 ? "border-red-500" : ""}
            />
            {fieldErrors.address_1 && (
              <Text className="text-red-600 text-xs mt-1">{fieldErrors.address_1}</Text>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="md:col-span-2">
            <Label htmlFor="address_2" className="text-sm font-medium text-gray-700 mb-1">
              Apartment, Suite, etc. (Optional)
            </Label>
            <Input
              id="address_2"
              name="shipping_address.address_2"
              autoComplete="address-line2"
              placeholder="Apartment, floor, entrance, etc."
              defaultValue={cart?.shipping_address?.address_2}
            />
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              name="shipping_address.city"
              autoComplete="address-level2"
              required
              defaultValue={cart?.shipping_address?.city}
              onBlur={(e) => handleBlur("city", e.target.value)}
              className={fieldErrors.city ? "border-red-500" : ""}
            />
            {fieldErrors.city && (
              <Text className="text-red-600 text-xs mt-1">{fieldErrors.city}</Text>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <Label htmlFor="postal_code" className="text-sm font-medium text-gray-700 mb-1">
              Postal Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postal_code"
              name="shipping_address.postal_code"
              autoComplete="postal-code"
              required
              defaultValue={cart?.shipping_address?.postal_code}
              onBlur={(e) => handleBlur("postal_code", e.target.value)}
              className={fieldErrors.postal_code ? "border-red-500" : ""}
            />
            {fieldErrors.postal_code && (
              <Text className="text-red-600 text-xs mt-1">{fieldErrors.postal_code}</Text>
            )}
          </div>

          {/* Province (Optional) */}
          <div>
            <Label htmlFor="province" className="text-sm font-medium text-gray-700 mb-1">
              State / Province (Optional)
            </Label>
            <Input
              id="province"
              name="shipping_address.province"
              autoComplete="address-level1"
              defaultValue={cart?.shipping_address?.province}
            />
          </div>

          {/* Country */}
          <div>
            <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </Label>
            <CountrySelect
              name="shipping_address.country_code"
              defaultValue={cart?.shipping_address?.country_code}
              required
            />
          </div>
        </div>
      </div>

      {/* Same as Billing Checkbox */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            name="same_as_billing"
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <div>
            <Text className="font-medium text-gray-900 text-sm">
              Billing address same as shipping address
            </Text>
            <Text className="text-xs text-gray-600 mt-1">
              Check this if your billing address matches your shipping address
            </Text>
          </div>
        </label>
      </div>

      {/* Save address for later (if guest) */}
      {!customer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              name="save_for_later"
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-green-300 text-green-600 focus:ring-green-600"
            />
            <div>
              <Text className="font-medium text-green-900 text-sm">
                Save this information for next time
              </Text>
              <Text className="text-xs text-green-800 mt-1">
                We'll create an account for you to make future purchases faster
              </Text>
            </div>
          </label>
        </div>
      )}
    </div>
  )
}

export default ShippingAddressEnhanced
