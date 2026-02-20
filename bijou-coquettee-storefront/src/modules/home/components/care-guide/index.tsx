import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CareGuide = () => {
  const careTips = [
    {
      title: "Storage",
      description: "Store jewelry in a soft pouch or separate compartments to prevent scratches.",
    },
    {
      title: "Cleaning",
      description: "Gently clean with a soft, lint-free cloth. Avoid harsh chemicals.",
    },
    {
      title: "Wearing",
      description: "Put jewelry on last when getting ready to avoid contact with perfumes and lotions.",
    },
    {
      title: "Maintenance",
      description: "Have your pieces professionally inspected and cleaned annually.",
    },
  ]

  return (
    <section className="content-container py-14 small:py-32 border-t border-grey-10 bg-grey-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 small:mb-16">
          <div className="inline-block mb-3 small:mb-4">
            <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-grey-60 font-normal">
              Care Guide
            </span>
          </div>
          <Heading
            level="h2"
            className="font-display text-2xl small:text-4xl text-grey-90 font-light tracking-tight mb-3 small:mb-4"
          >
            Caring for Your Jewelry
          </Heading>
          <Text className="text-sm small:text-lg text-grey-60 font-light max-w-2xl mx-auto">
            Proper care ensures your pieces remain beautiful for generations to come
          </Text>
        </div>

        <div className="grid grid-cols-1 small:grid-cols-2 large:grid-cols-4 gap-6 small:gap-8 mb-12">
          {careTips.map((tip, index) => (
            <div
              key={index}
              className="bg-white p-6 small:p-8 border border-grey-10 hover:border-grey-20 transition-all duration-300 group"
            >
              <div className="font-display text-3xl small:text-4xl text-grey-90 font-light mb-4 group-hover:translate-y-[-2px] transition-transform duration-300">
                {String(index + 1).padStart(2, "0")}
              </div>
              <Heading
                level="h3"
                className="font-display text-lg text-grey-90 font-light mb-3"
              >
                {tip.title}
              </Heading>
              <Text className="text-sm text-grey-60 font-light leading-relaxed">
                {tip.description}
              </Text>
            </div>
          ))}
        </div>

        <div className="text-center">
          <LocalizedClientLink
            href="/size-guide"
            className="inline-block font-sans text-sm uppercase tracking-[0.12em] text-grey-60 hover:text-grey-90 transition-colors duration-200 font-medium border-b border-transparent hover:border-grey-50 pb-1"
          >
            View Size Guide →
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default CareGuide

