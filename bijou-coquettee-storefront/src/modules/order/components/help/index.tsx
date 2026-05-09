import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"
import { t } from "@lib/util/translations-server"

const Help = async () => {
  const needHelp = await t("order.needHelp")
  const contact = await t("order.contact")
  const returnsExchanges = await t("order.returnsExchanges")

  return (
    <div className="mt-6">
      <Heading className="text-base-semi">{needHelp}</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/contact">{contact}</LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact">
              {returnsExchanges}
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
