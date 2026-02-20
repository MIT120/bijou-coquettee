import { Heading, Text } from "@medusajs/ui"

const BrandStory = () => {
  return (
    <section className="content-container py-14 small:py-32 border-t border-grey-10">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-block mb-4">
          <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-grey-60 font-normal">
            Our Story
          </span>
        </div>
        <Heading
          level="h2"
          className="font-display text-3xl small:text-4xl large:text-5xl text-grey-90 font-light tracking-tight"
        >
          Crafted with Passion, Worn with Pride
        </Heading>
        <div className="space-y-6 max-w-2xl mx-auto">
          <Text className="text-base small:text-lg text-grey-60 font-light leading-relaxed">
            At Bijou Coquettee, we believe that jewelry is more than an accessory—it's a 
            reflection of your unique story. Each piece in our collection is thoughtfully 
            curated and crafted with meticulous attention to detail.
          </Text>
          <Text className="text-base small:text-lg text-grey-60 font-light leading-relaxed">
            From delicate everyday pieces to statement jewelry for special occasions, 
            we offer timeless designs that celebrate elegance and sophistication.
          </Text>
        </div>
        <div className="grid grid-cols-1 small:grid-cols-3 gap-8 small:gap-12 pt-12">
          <div className="space-y-3 group hover:opacity-80 transition-opacity duration-300">
            <div className="font-display text-4xl small:text-5xl text-grey-90 font-light group-hover:translate-y-[-2px] transition-transform duration-300">01</div>
            <Heading level="h3" className="font-display text-lg text-grey-90 font-light">
              Curated Selection
            </Heading>
            <Text className="text-sm text-grey-50 font-light leading-relaxed">
              Handpicked pieces from trusted artisans and designers
            </Text>
          </div>
          <div className="space-y-3 group hover:opacity-80 transition-opacity duration-300">
            <div className="font-display text-4xl small:text-5xl text-grey-90 font-light group-hover:translate-y-[-2px] transition-transform duration-300">02</div>
            <Heading level="h3" className="font-display text-lg text-grey-90 font-light">
              Quality Craftsmanship
            </Heading>
            <Text className="text-sm text-grey-50 font-light leading-relaxed">
              Every piece meets our exacting standards for quality and beauty
            </Text>
          </div>
          <div className="space-y-3 group hover:opacity-80 transition-opacity duration-300">
            <div className="font-display text-4xl small:text-5xl text-grey-90 font-light group-hover:translate-y-[-2px] transition-transform duration-300">03</div>
            <Heading level="h3" className="font-display text-lg text-grey-90 font-light">
              Timeless Design
            </Heading>
            <Text className="text-sm text-grey-50 font-light leading-relaxed">
              Classic styles that transcend trends and become heirlooms
            </Text>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrandStory

