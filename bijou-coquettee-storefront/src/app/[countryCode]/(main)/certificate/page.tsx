import { Metadata } from "next"
import { Heading, Text } from "@medusajs/ui"

import Certificates from "@modules/home/components/certificates"

export const metadata: Metadata = {
  title: "Удостоверение | Bijou Coquettee",
  description:
    "Сертификати и удостоверения за качеството на материалите и изработката на бижутата Bijou Coquettee.",
}

export default function CertificatePage() {
  return (
    <main>
      <div className="content-container py-16 small:py-20 max-w-3xl">
        <div className="space-y-3 mb-4">
          <span className="font-sans text-xs tracking-[0.18em] uppercase text-grey-60 font-normal">
            Качество
          </span>
          <Heading
            level="h1"
            className="font-display text-3xl small:text-4xl text-grey-90 font-light tracking-tight"
          >
            Удостоверение
          </Heading>
          <Text className="font-sans text-base text-grey-50 font-light leading-relaxed">
            Работим с проверени материали и партньори. Тук ще намерите
            удостоверения и сертификати, които потвърждават качеството и
            произхода на нашите изделия.
          </Text>
        </div>
      </div>
      <Certificates />
    </main>
  )
}
