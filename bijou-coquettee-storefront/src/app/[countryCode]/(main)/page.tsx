import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import BrandStory from "@modules/home/components/brand-story"
import FeaturedCategories from "@modules/home/components/featured-categories"
import Newsletter from "@modules/home/components/newsletter"
import ServiceHighlights from "@modules/home/components/service-highlights"
import Testimonials from "@modules/home/components/testimonials"
import GiftGuide from "@modules/home/components/gift-guide"
import NewArrivalsBanner from "@modules/home/components/new-arrivals-banner"
import CareGuide from "@modules/home/components/care-guide"
import SpecialOffer from "@modules/home/components/special-offer"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

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

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <SpecialOffer />
      <ServiceHighlights />
      <NewArrivalsBanner />
      <div className="bg-white">
        <ul className="flex flex-col">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
      <FeaturedCategories />
      <GiftGuide />
      <Testimonials />
      <BrandStory />
      <CareGuide />
      <Newsletter />
    </div>
  )
}
