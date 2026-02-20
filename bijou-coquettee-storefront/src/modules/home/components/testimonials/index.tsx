import { Heading, Text } from "@medusajs/ui"

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Absolutely stunning pieces! The quality exceeded my expectations and the packaging was beautiful. I'll definitely be ordering again.",
      author: "Sarah M.",
      location: "New York",
      rating: 5,
    },
    {
      quote: "I've been searching for the perfect necklace and finally found it here. The craftsmanship is exceptional and the customer service was outstanding.",
      author: "Emily R.",
      location: "Los Angeles",
      rating: 5,
    },
    {
      quote: "These pieces are timeless and elegant. I receive compliments every time I wear them. Worth every penny!",
      author: "Jessica L.",
      location: "Chicago",
      rating: 5,
    },
  ]

  return (
    <section className="content-container py-14 small:py-32 border-t border-grey-10 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 small:mb-16">
          <div className="inline-block mb-3 small:mb-4">
            <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-grey-60 font-normal">
              Customer Stories
            </span>
          </div>
          <Heading
            level="h2"
            className="font-display text-2xl small:text-4xl text-grey-90 font-light tracking-tight"
          >
            Loved by Our Customers
          </Heading>
        </div>

        <div className="grid grid-cols-1 small:grid-cols-3 gap-8 small:gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="space-y-6 p-6 small:p-8 bg-grey-5 border border-grey-10 hover:border-grey-20 transition-all duration-300 group"
            >
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-soft-gold text-sm">★</span>
                ))}
              </div>
              <Text className="font-display text-lg small:text-xl text-grey-70 font-normal leading-relaxed italic">
                "{testimonial.quote}"
              </Text>
              <div className="pt-4 border-t border-grey-10">
                <Text className="font-sans text-sm text-grey-90 font-normal tracking-[0.04em]">
                  {testimonial.author}
                </Text>
                <Text className="text-xs text-grey-50 font-light">
                  {testimonial.location}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials

