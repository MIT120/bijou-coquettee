import { Text } from "@medusajs/ui"

const ServiceHighlights = () => {
  const services = [
    {
      icon: "✨",
      title: "Free Shipping",
      description: "On orders over $100",
    },
    {
      icon: "🔒",
      title: "Secure Payment",
      description: "100% secure checkout",
    },
    {
      icon: "💎",
      title: "Authenticity Guaranteed",
      description: "Certified quality assurance",
    },
    {
      icon: "↩️",
      title: "Easy Returns",
      description: "30-day return policy",
    },
  ]

  return (
    <section className="content-container py-10 small:py-20 border-t border-grey-10 bg-grey-5">
      <div className="grid grid-cols-2 small:grid-cols-4 gap-4 small:gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="text-center space-y-3 group hover:opacity-80 transition-opacity duration-300"
          >
            <div className="text-3xl small:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
              {service.icon}
            </div>
            <Text className="text-sm small:text-base text-grey-90 font-light tracking-wide block">
              {service.title}
            </Text>
            <Text className="text-xs small:text-sm text-grey-50 font-light">
              {service.description}
            </Text>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ServiceHighlights

