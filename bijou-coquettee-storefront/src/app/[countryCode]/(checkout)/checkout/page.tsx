import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getActiveCheckoutPromo } from "@lib/data/checkout-promo"
import { getProductsByIds } from "@lib/data/products"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  // Fetch checkout promo and its product data
  const promo = await getActiveCheckoutPromo()
  let promoProduct = null
  if (promo) {
    const products = await getProductsByIds({
      ids: [promo.product_id],
      countryCode,
    })
    promoProduct = products[0] || null
  }

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary
        cart={cart}
        promo={promo}
        promoProduct={promoProduct}
        countryCode={countryCode}
      />
    </div>
  )
}
