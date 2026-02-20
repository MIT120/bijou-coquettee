import { Metadata } from "next"
import { Heading, Text } from "@medusajs/ui"
import Instagram from "@modules/common/icons/instagram"

export const metadata: Metadata = {
  title: "Contact Us | Bijou Coquettee",
  description: "Get in touch with the Bijou Coquettee team.",
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
          Get in Touch
        </Heading>
        <Text className="font-sans text-base text-grey-50 font-light leading-relaxed">
          We would love to hear from you. Reach out through any of the channels
          below.
        </Text>
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-8">
          <div className="space-y-2 p-6 border border-grey-20 bg-cream-100">
            <span className="font-sans text-xs tracking-[0.14em] uppercase text-grey-60 font-medium block mb-3">
              Email
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
              Phone
            </span>
            <a
              href="tel:+35900000000"
              className="font-sans text-sm text-grey-90 hover:text-gold-500 transition-colors duration-200"
            >
              +359 XX XXX XXXX
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <span className="font-sans text-xs tracking-[0.14em] uppercase text-grey-60 font-medium block">
            Follow Us
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
          We aim to respond to all enquiries within 1-2 business days.
        </Text>
      </div>
    </div>
  )
}
