import Image from "next/image"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Instagram from "@modules/common/icons/instagram"
import { t } from "@lib/util/translations-server"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-ui-border-base w-full bg-cream">
      <div className="content-container flex flex-col w-full">
        {/* Main footer body */}
        <div className="grid grid-cols-1 gap-12 xsmall:grid-cols-2 small:grid-cols-4 py-16 small:py-20">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-6">
            <LocalizedClientLink href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Bijou Coquettee"
                width={120}
                height={120}
                className="h-14 w-auto object-contain"
              />
            </LocalizedClientLink>
            <p className="font-sans text-xs text-grey-50 font-light leading-relaxed max-w-[200px]">
              {await t("footer.tagline")}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/bijoucoquettee"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-grey-40 hover:text-grey-90 transition-colors duration-200"
              >
                <Instagram size="18" />
              </a>
            </div>
          </div>

          {/* Column 2: Categories */}
          {productCategories && productCategories.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className="font-sans text-xs tracking-[0.14em] uppercase text-grey-90 font-medium">
                {await t("footer.categories")}
              </span>
              <ul
                className="flex flex-col gap-2.5"
                data-testid="footer-categories"
              >
                {productCategories.slice(0, 6).map((c) => {
                  if (c.parent_category) {
                    return null
                  }
                  return (
                    <li key={c.id}>
                      <LocalizedClientLink
                        href={`/categories/${c.handle}`}
                        className="font-sans text-xs text-grey-50 hover:text-grey-90 transition-colors duration-200"
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Column 3: Collections */}
          {collections && collections.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className="font-sans text-xs tracking-[0.14em] uppercase text-grey-90 font-medium">
                {await t("footer.collections")}
              </span>
              <ul className="flex flex-col gap-2.5">
                {collections.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/collections/${c.handle}`}
                      className="font-sans text-xs text-grey-50 hover:text-grey-90 transition-colors duration-200"
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 4: Contact */}
          <div className="flex flex-col gap-4">
            <span className="font-sans text-xs tracking-[0.14em] uppercase text-grey-90 font-medium">
              {await t("footer.contact")}
            </span>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href="mailto:info@bijoucoquettee.com"
                  className="font-sans text-xs text-grey-50 hover:text-grey-90 transition-colors duration-200"
                >
                  info@bijoucoquettee.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+35900000000"
                  className="font-sans text-xs text-grey-50 hover:text-grey-90 transition-colors duration-200"
                >
                  +359 XX XXX XXXX
                </a>
              </li>
              <li className="pt-1">
                <LocalizedClientLink
                  href="/contacts"
                  className="font-sans text-xs text-grey-50 hover:text-grey-90 transition-colors duration-200"
                >
                  {await t("footer.contactPage")}
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-grey-20" />

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 xsmall:flex-row xsmall:items-center xsmall:justify-between py-6 small:py-8">
          <Text className="font-sans text-xs text-grey-40 font-light">
            {await t("common.copyright", undefined, {
              year: new Date().getFullYear().toString(),
            })}
          </Text>
          <nav className="flex items-center gap-5">
            <LocalizedClientLink
              href="/terms"
              className="font-sans text-xs text-grey-40 hover:text-grey-70 transition-colors duration-200"
            >
              {await t("footer.terms")}
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/privacy-policy"
              className="font-sans text-xs text-grey-40 hover:text-grey-70 transition-colors duration-200"
            >
              {await t("footer.privacy")}
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/cookie-policy"
              className="font-sans text-xs text-grey-40 hover:text-grey-70 transition-colors duration-200"
            >
              {await t("footer.cookies")}
            </LocalizedClientLink>
          </nav>
        </div>
      </div>
    </footer>
  )
}
