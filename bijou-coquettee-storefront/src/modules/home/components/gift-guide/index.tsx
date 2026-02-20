import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const GiftGuide = () => {
  const giftCategories = [
    {
      title: "For Her",
      description: "Elegant pieces that celebrate her unique style",
      link: "/store?gift=her",
      gradient: "from-rose-50 to-rose-100",
    },
    {
      title: "For Him",
      description: "Sophisticated designs for the modern gentleman",
      link: "/store?gift=him",
      gradient: "from-cream-100 to-cream-300",
    },
    {
      title: "Anniversary",
      description: "Timeless symbols of love and commitment",
      link: "/store?gift=anniversary",
      gradient: "from-gold-50 to-gold-100",
    },
    {
      title: "Special Occasions",
      description: "Make every moment memorable",
      link: "/store?gift=occasions",
      gradient: "from-rose-100 to-gold-50",
    },
  ]

  return (
    <section className="content-container py-14 small:py-32 border-t border-grey-10 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 small:mb-16">
          <div className="inline-block mb-3 small:mb-4">
            <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-grey-60 font-normal">
              Gift Guide
            </span>
          </div>
          <Heading
            level="h2"
            className="font-display text-2xl small:text-4xl text-grey-90 font-light tracking-tight mb-3 small:mb-4"
          >
            Find the Perfect Gift
          </Heading>
          <Text className="text-sm small:text-lg text-grey-60 font-light max-w-2xl mx-auto">
            Thoughtfully curated collections for every occasion and loved one
          </Text>
        </div>

        <div className="grid grid-cols-1 small:grid-cols-2 gap-6 small:gap-8">
          {giftCategories.map((category, index) => (
            <LocalizedClientLink
              key={index}
              href={category.link}
              className="group relative block overflow-hidden bg-grey-5 aspect-[16/9] transition-all duration-300 hover:opacity-95"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-60 group-hover:opacity-80 transition-opacity duration-300`}></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center p-8 small:p-12 text-center z-10">
                <Heading
                  level="h3"
                  className="font-display text-2xl small:text-3xl text-grey-90 font-light mb-3 group-hover:translate-y-[-4px] transition-transform duration-300"
                >
                  {category.title}
                </Heading>
                <Text className="text-sm small:text-base text-grey-70 font-light mb-6 max-w-md">
                  {category.description}
                </Text>
                <span className="font-sans text-xs uppercase tracking-[0.12em] text-grey-60 group-hover:text-grey-90 transition-colors duration-200 font-medium border-b border-transparent group-hover:border-grey-60 pb-1">
                  Shop Now →
                </span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>

        <div className="mt-12 text-center">
          <LocalizedClientLink href="/store">
            <Button
              variant="secondary"
              className="bg-transparent hover:bg-grey-90 hover:text-white text-grey-90 px-8 py-3 rounded-none border border-grey-30 hover:border-grey-90 transition-all duration-300 font-sans font-medium tracking-[0.12em] uppercase text-sm"
            >
              View All Gifts
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default GiftGuide

