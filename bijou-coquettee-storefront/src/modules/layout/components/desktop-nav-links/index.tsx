"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  TranslatedNavChild,
  TranslatedNavItem,
} from "@modules/layout/constants/navigation"

type DesktopNavLinksProps = {
  items: TranslatedNavItem[]
}

const DesktopNavLinks = ({ items }: DesktopNavLinksProps) => {
  return (
    <div className="hidden medium:flex items-center gap-x-4 text-xs uppercase tracking-wide">
      {items.map((item) => (
        <div key={item.key} className="relative group">
          <LocalizedClientLink
            className="px-2 py-1 text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
            href={item.href}
          >
            {item.label}
          </LocalizedClientLink>
          {item.children?.length ? (
            <DesktopDropdown items={item.children} />
          ) : null}
        </div>
      ))}
    </div>
  )
}

const DesktopDropdown = ({ items }: { items: TranslatedNavChild[] }) => {
  return (
    <div className="pointer-events-none absolute left-0 top-full mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-40">
      <div className="min-w-[200px] rounded-2xl border border-ui-border-base bg-white shadow-lg py-3">
        {items.map((child) => (
          <LocalizedClientLink
            key={child.key}
            href={child.href}
            className="block px-4 py-2 text-small-regular text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-colors"
          >
            {child.label}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export default DesktopNavLinks


