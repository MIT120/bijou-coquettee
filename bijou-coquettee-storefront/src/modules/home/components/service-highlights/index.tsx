import { Text } from "@medusajs/ui"
import { ServiceHighlightData } from "@lib/data/service-highlights"

const ICON_MAP: Record<string, React.ReactNode> = {
  shipping: (
    <svg className="w-6 h-6 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-1.5l-1.72-4.575A1.125 1.125 0 0016.132 9H14.25m-8.25 0h6.75" />
    </svg>
  ),
  payment: (
    <svg className="w-6 h-6 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  authenticity: (
    <svg className="w-6 h-6 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  return: (
    <svg className="w-6 h-6 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  ),
  handmade: (
    <svg className="w-6 h-6 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  quality: (
    <svg className="w-6 h-6 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z" />
    </svg>
  ),
  gift: (
    <svg className="w-6 h-6 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  heart: (
    <svg className="w-6 h-6 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
}

const DEFAULT_SERVICES = [
  { title: "Безплатна доставка", description: "За поръчки над 80 лв.", icon_name: "shipping" },
  { title: "Сигурно плащане", description: "100% защитено плащане", icon_name: "payment" },
  { title: "Гарантирана автентичност", description: "Сертифицирано качество", icon_name: "authenticity" },
  { title: "Лесно връщане", description: "14 дни право на връщане", icon_name: "return" },
  { title: "Ръчна изработка", description: "Изработено с грижа", icon_name: "handmade" },
]

const ServiceHighlights = ({ highlights }: { highlights?: ServiceHighlightData[] }) => {
  const services = highlights && highlights.length > 0 ? highlights : DEFAULT_SERVICES

  return (
    <section className="w-full py-10 small:py-20 border-t border-grey-10 bg-grey-5">
      <div className="max-w-screen-xl mx-auto px-6 small:px-8 grid grid-cols-2 small:grid-cols-5 gap-4 small:gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="text-center space-y-3 group hover:opacity-80 transition-opacity duration-300"
          >
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 small:w-14 small:h-14 rounded-full border border-grey-20 bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {ICON_MAP[service.icon_name] || ICON_MAP.handmade}
              </div>
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
