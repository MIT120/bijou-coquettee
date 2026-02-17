export type InvoiceLineItem = {
  description: string
  quantity: number
  unit_price: number // in major units (e.g. 19.99 EUR)
  vat_rate: number // 0, 9, or 20
  line_total: number // quantity * unit_price
  vat_amount: number // line_total * vat_rate / 100
}

export type InvoiceBuyerInfo = {
  name: string
  company_name?: string
  eik?: string
  vat_number?: string
  address: string
  city: string
  postal_code: string
  country: string
}

export type CreateInvoiceInput = {
  order_id: string
  buyer?: Partial<InvoiceBuyerInfo>
  notes?: string
  vat_rate_override?: number
  prepared_by?: string
}
