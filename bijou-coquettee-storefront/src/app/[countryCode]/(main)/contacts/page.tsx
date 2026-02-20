import { Metadata } from "next"
import { Heading, Text } from "@medusajs/ui"
import Instagram from "@modules/common/icons/instagram"

export const metadata: Metadata = {
  title: "Контакти | Bijou Coquettee",
  description: "Свържете се с екипа на Bijou Coquettee.",
}

export default function ContactsPage() {
  return (
    <div className="content-container py-16 small:py-24 max-w-3xl">
      <div className="space-y-3 mb-12">
        <span className="font-sans text-xs tracking-[0.18em] uppercase text-grey-60 font-normal">
          Contact
        </span>
        <Heading
          level="h1"
          className="font-display text-3xl small:text-4xl text-grey-90 font-light tracking-tight"
        >
          Контакти
        </Heading>
        <Text className="font-sans text-base text-grey-50 font-light leading-relaxed">
          Ще се радваме да чуем от вас. Свържете се с нас по някой от каналите
          по-долу.
        </Text>
      </div>

      <div className="space-y-10">
        {/* Company info */}
        <div className="p-6 border border-grey-20 bg-cream-100 space-y-2">
          <span className="font-sans text-xs tracking-[0.14em] uppercase text-grey-60 font-medium block mb-3">
            Фирмени данни
          </span>
          <ul className="space-y-1.5 font-sans text-sm text-grey-70">
            <li>
              <strong className="text-grey-90 font-medium">
                ВЕЛТОН ГРУП ЕООД
              </strong>
            </li>
            <li>ЕИК: 205629294</li>
            <li>гр. София, ул. Враня 109</li>
          </ul>
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-8">
          <div className="space-y-2 p-6 border border-grey-20 bg-cream-100">
            <span className="font-sans text-xs tracking-[0.14em] uppercase text-grey-60 font-medium block mb-3">
              Имейл
            </span>
            <a
              href="mailto:info@bijoucoquettee.com"
              className="font-sans text-sm text-grey-90 hover:text-gold-500 transition-colors duration-200"
            >
              info@bijoucoquettee.com
            </a>
          </div>

          <div className="space-y-2 p-6 border border-grey-20 bg-cream-100">
            <span className="font-sans text-xs tracking-[0.14em] uppercase text-grey-60 font-medium block mb-3">
              Телефон
            </span>
            <a
              href="tel:+35900000000"
              className="font-sans text-sm text-grey-90 hover:text-gold-500 transition-colors duration-200"
            >
              +359 XX XXX XXXX
            </a>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2 p-6 border border-grey-20 bg-cream-100">
          <span className="font-sans text-xs tracking-[0.14em] uppercase text-grey-60 font-medium block mb-3">
            Адрес за кореспонденция
          </span>
          <Text className="font-sans text-sm text-grey-70">
            гр. София, 1309, ул. Враня 109
          </Text>
        </div>

        {/* Social */}
        <div className="space-y-4">
          <span className="font-sans text-xs tracking-[0.14em] uppercase text-grey-60 font-medium block">
            Последвай ни
          </span>
          <a
            href="https://instagram.com/bijoucoquettee"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-sans text-sm text-grey-90 hover:text-gold-500 transition-colors duration-200"
          >
            <Instagram size="16" />
            @bijoucoquettee
          </a>
        </div>

        <Text className="font-sans text-xs text-grey-40 font-light border-t border-grey-20 pt-8">
          Стремим се да отговаряме на всички запитвания в рамките на 1-2
          работни дни.
        </Text>
      </div>
    </div>
  )
}
