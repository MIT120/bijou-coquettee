import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const NewArrivalsBanner = () => {
  return (
    <section className="content-container py-10 small:py-20 border-t border-grey-10 bg-gradient-to-r from-grey-90 to-grey-80 text-white">
      <div className="max-w-4xl mx-auto text-center space-y-4 small:space-y-6">
        <div className="inline-block mb-2">
          <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-white/70 font-normal">
            New Collection
          </span>
        </div>
        <Heading
          level="h2"
          className="font-display text-3xl small:text-4xl large:text-5xl font-light tracking-tight"
        >
          Discover Our Latest Arrivals
        </Heading>
        <Text className="text-base small:text-lg text-white/80 font-light max-w-2xl mx-auto leading-relaxed">
          Explore our newest collection of handcrafted jewelry, featuring 
          contemporary designs with timeless elegance.
        </Text>
        <div className="pt-4">
          <LocalizedClientLink href="/store?sort=created_at">
            <Button
              size="large"
              className="bg-white hover:bg-grey-5 text-grey-90 px-8 py-3 rounded-none border border-white hover:border-grey-5 transition-all duration-300 font-sans font-medium tracking-[0.12em] uppercase text-sm"
            >
              Shop New Arrivals
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default NewArrivalsBanner

