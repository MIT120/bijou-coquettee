import { Text } from "@medusajs/ui"

const ServiceHighlights = () => {
  const services = [
    {
      icon: "✨",
      title: "Безплатна доставка",
      description: "За поръчки над 50 лв.",
    },
    {
      icon: "🔒",
      title: "Сигурно плащане",
      description: "100% защитено плащане",
    },
    {
      icon: "💎",
      title: "Гарантирана автентичност",
      description: "Сертифицирано качество",
    },
    {
      icon: "↩️",
      title: "Лесно връщане",
      description: "14 дни право на връщане",
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
            <Text className="text-sm small:text-base text-grey-90 font-normal tracking-[0.04em] block">
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

