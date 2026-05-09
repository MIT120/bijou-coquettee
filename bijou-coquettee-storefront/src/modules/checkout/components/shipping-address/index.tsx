"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"
import { useParams } from "next/navigation"
import { getLocale, t } from "@lib/util/translations"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const isBulgaria =
    cart?.shipping_address?.country_code?.toLowerCase() === "bg" ||
    cart?.region?.countries?.[0]?.iso_2?.toLowerCase() === "bg"

  const params = useParams()
  const countryCode = params?.countryCode as string | undefined
  const locale = getLocale(countryCode)
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    // For Bulgaria, country_code is always "bg"; the hidden input guarantees it
    "shipping_address.country_code":
      cart?.shipping_address?.country_code ||
      cart?.region?.countries?.[0]?.iso_2 ||
      "bg",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  // Invoice (фактура) state
  const [wantsInvoice, setWantsInvoice] = useState(false)
  const [invoiceData, setInvoiceData] = useState({
    company: "",
    vat: "",
    mol: "",
    companyAddress: "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // Check if customer has saved addresses in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "bg",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoiceData({
      ...invoiceData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {t("account.hiUseSavedAddress", locale, { name: customer.first_name })}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t("account.firstName", locale)}
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label={t("account.lastName", locale)}
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <Input
          label={t("account.address", locale)}
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />
        <Input
          label={t("account.postalCode", locale)}
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-postal-code-input"
        />
        <Input
          label={t("account.city", locale)}
          name="shipping_address.city"
          autoComplete="address-level2"
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
          data-testid="shipping-city-input"
        />
        <Input
          label={t("account.provinceState", locale)}
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData["shipping_address.province"]}
          onChange={handleChange}
          data-testid="shipping-province-input"
        />
      </div>

      {/* Fix 1: Country is fixed to Bulgaria — shown as a read-only field.
          A hidden input ensures the form always submits "bg" as country_code. */}
      <div className="mt-4">
        <div className="flex flex-col gap-y-1">
          <label className="text-ui-fg-subtle text-small-regular">
            {isBulgaria ? "Държава" : "Country"}
          </label>
          <div
            className="flex items-center w-full h-11 bg-ui-bg-subtle border border-ui-border-base rounded-md px-3 text-small-regular text-ui-fg-base select-none cursor-not-allowed"
            aria-label={isBulgaria ? "Държава: България" : "Country: Bulgaria"}
            data-testid="shipping-country-display"
          >
            България
          </div>
          {/* Hidden input so the form action receives the correct country_code */}
          <input
            type="hidden"
            name="shipping_address.country_code"
            value="bg"
            readOnly
          />
        </div>
      </div>

      <div className="my-8">
        <Checkbox
          label={t("account.billingAddressSameAsShipping", locale)}
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          label={t("account.email", locale)}
          name="email"
          type="email"
          title={t("auth.enterValidEmail", locale)}
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />
        <Input
          label={t("account.phone", locale)}
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          data-testid="shipping-phone-input"
        />
      </div>

      {/* Fix 2: Invoice (фактура) section */}
      <div className="mt-2 mb-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={wantsInvoice}
            onChange={(e) => setWantsInvoice(e.target.checked)}
            className="w-4 h-4 rounded border-ui-border-strong text-ui-fg-base focus:ring-ui-border-interactive cursor-pointer"
            data-testid="wants-invoice-checkbox"
            aria-expanded={wantsInvoice}
            aria-controls="invoice-fields"
          />
          <span className="text-small-regular text-ui-fg-base font-medium group-hover:text-ui-fg-interactive transition-colors">
            {isBulgaria ? "Желая фактура" : "I want an invoice"}
          </span>
        </label>

        {/* Invoice fields — revealed when checkbox is checked */}
        <div
          id="invoice-fields"
          className={[
            "overflow-hidden transition-all duration-300 ease-in-out",
            wantsInvoice
              ? "max-h-[500px] opacity-100 mt-4"
              : "max-h-0 opacity-0",
          ].join(" ")}
          aria-hidden={!wantsInvoice}
        >
          <div className="border border-ui-border-base rounded-lg p-4 bg-ui-bg-subtle grid grid-cols-2 gap-4">
            <p className="col-span-2 text-small-regular text-ui-fg-subtle mb-2">
              {isBulgaria
                ? "Данни за издаване на фактура"
                : "Invoice details"}
            </p>

            {/* Фирма — Company name (required for invoice) */}
            <div className="col-span-2">
              <Input
                label={isBulgaria ? "Фирма *" : "Company name *"}
                name="invoice_company"
                autoComplete="organization"
                value={invoiceData.company}
                onChange={handleInvoiceChange}
                required={wantsInvoice}
                data-testid="invoice-company-input"
              />
            </div>

            {/* Булстат — VAT/EIC number (required for invoice) */}
            <div className="col-span-2 sm:col-span-1">
              <Input
                label={isBulgaria ? "Булстат / ДДС номер *" : "VAT / EIC number *"}
                name="invoice_vat"
                value={invoiceData.vat}
                onChange={handleInvoiceChange}
                required={wantsInvoice}
                data-testid="invoice-vat-input"
              />
            </div>

            {/* МОЛ — Responsible person (optional) */}
            <div className="col-span-2 sm:col-span-1">
              <Input
                label={isBulgaria ? "МОЛ (незадължително)" : "Responsible person (optional)"}
                name="invoice_mol"
                value={invoiceData.mol}
                onChange={handleInvoiceChange}
                data-testid="invoice-mol-input"
              />
            </div>

            {/* Адрес на фирмата — Company address (optional) */}
            <div className="col-span-2">
              <Input
                label={
                  isBulgaria
                    ? "Адрес на фирмата (незадължително)"
                    : "Company address (optional)"
                }
                name="invoice_company_address"
                value={invoiceData.companyAddress}
                onChange={handleInvoiceChange}
                data-testid="invoice-company-address-input"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ShippingAddress
