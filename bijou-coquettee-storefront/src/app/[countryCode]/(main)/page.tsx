import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import BrandStory from "@modules/home/components/brand-story"
import Newsletter from "@modules/home/components/newsletter"
import ServiceHighlights from "@modules/home/components/service-highlights"
import Testimonials from "@modules/home/components/testimonials"
import NewArrivalsBanner from "@modules/home/components/new-arrivals-banner"
import CareGuide from "@modules/home/components/care-guide"
import SpecialOffer from "@modules/home/components/special-offer"
import Certificates from "@modules/home/components/certificates"
import { getRegion } from "@lib/data/regions"
import { getServerLocale } from "@lib/util/translations-server"
import { getServiceHighlights } from "@lib/data/service-highlights"
import { getActiveSpecialOffer } from "@lib/data/special-offers"

export const metadata: Metadata = {
  title: "Bijou Coquettee - Timeless Elegance in Fine Jewelry",
  description:
    "Discover our curated collection of exquisite jewelry, crafted with precision and passion. Shop elegant pieces that celebrate timeless beauty.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)
  const locale = await getServerLocale(countryCode)

  if (!region) {
    return null
  }

  const [highlights, specialOffer] = await Promise.all([
    getServiceHighlights(),
    getActiveSpecialOffer(),
  ])

  return (
    <div className="min-h-screen bg-white">
      <Hero locale={locale} />
      <SpecialOffer offer={specialOffer} />
      <ServiceHighlights highlights={highlights} />
      <NewArrivalsBanner />
      <Testimonials />
      <Certificates />
      <BrandStory />
      <CareGuide />
      <Newsletter />
    </div>
  )
}
