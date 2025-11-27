import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import WishlistNav from "@modules/layout/components/wishlist-nav"
import SideMenu from "@modules/layout/components/side-menu"
import LanguageSwitcher from "@modules/layout/components/language-switcher"
import SearchOverlay from "@modules/layout/components/search-overlay"
import { getServerLocale, t } from "@lib/util/translations-server"
import {
  NAV_ITEMS,
  TranslatedNavItem,
} from "@modules/layout/constants/navigation"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const locale = await getServerLocale()
  const navItems: TranslatedNavItem[] = await Promise.all(
    NAV_ITEMS.map(async (item) => ({
      ...item,
      label: await t(item.translationKey),
      children: item.children
        ? await Promise.all(
            item.children.map(async (child) => ({
              ...child,
              label: await t(child.translationKey),
            }))
          )
        : undefined,
    }))
  )

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center gap-x-6">
            <div className="h-full">
              <SideMenu regions={regions} locale={locale} />
            </div>
            <DesktopNavLinks items={navItems} />
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
            >
              {await t("common.brand")}
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <SearchOverlay locale={locale} />
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                {await t("common.account")}
              </LocalizedClientLink>
            </div>
            <LanguageSwitcher locale={locale} />
            <WishlistNav />
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  {await t("common.cart")} (0)
                </LocalizedClientLink>
              }
            >
              <CartButton locale={locale} />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}

function DesktopNavLinks({ items }: { items: TranslatedNavItem[] }) {
  return (
    <ul className="hidden h-full items-center gap-x-6 small:flex">
      {items.map((item) => (
        <li key={item.key} className="relative h-full flex items-center group">
          <LocalizedClientLink
            href={item.href}
            className="hover:text-ui-fg-base uppercase tracking-wide"
            data-testid={`nav-${item.key}-link`}
          >
            {item.label}
          </LocalizedClientLink>

          {item.children && item.children.length > 0 && (
            <div className="absolute left-0 top-full z-20 hidden w-48 rounded-md border border-ui-border-base bg-white py-3 shadow-lg group-hover:block">
              <ul className="flex flex-col gap-2 px-4 text-ui-fg-subtle">
                {item.children.map((child) => (
                  <li key={child.key}>
                    <LocalizedClientLink
                      href={child.href}
                      className="block hover:text-ui-fg-base"
                      data-testid={`nav-${child.key}-link`}
                    >
                      {child.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
