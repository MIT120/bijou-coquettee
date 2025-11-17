import { retrieveCart } from "@lib/data/cart"
import CartDropdown from "../cart-dropdown"
import { type Locale } from "@/i18n/locale"

export default async function CartButton({ locale }: { locale: Locale }) {
  const cart = await retrieveCart().catch(() => null)

  return <CartDropdown cart={cart} locale={locale} />
}
