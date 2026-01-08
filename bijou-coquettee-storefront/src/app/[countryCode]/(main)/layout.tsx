import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
// import { getWishlist } from "@lib/data/wishlist" // DISABLED: Wishlist temporarily disabled
import { getBaseURL } from "@lib/util/env"
import { WishlistProvider } from "@lib/context/wishlist-context"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import EmailSubscriptionPopup from "@modules/campaigns/components/email-subscription-popup"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  // DISABLED: Wishlist fetch temporarily disabled
  // const wishlist = customer ? await getWishlist() : null
  const wishlist = null
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  return (
    <WishlistProvider customer={customer}>
      <Nav />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      <EmailSubscriptionPopup />
      {props.children}
      <Footer />
    </WishlistProvider>
  )
}
