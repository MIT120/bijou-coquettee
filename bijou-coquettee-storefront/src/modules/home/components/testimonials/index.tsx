import { Heading, Text } from "@medusajs/ui"

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Абсолютно прекрасни бижута! Качеството надмина очакванията ми, а опаковката беше красива. Определено ще поръчам отново.",
      author: "Пени П.",
      location: "София",
      rating: 5,
      date: "12.02.2026",
      verified: true,
    },
    {
      quote: "Търсих перфектното колие и най-накрая го намерих тук. Изработката е изключителна, а обслужването на клиентите беше отлично.",
      author: "Мария К.",
      location: "Пловдив",
      rating: 5,
      date: "28.01.2026",
      verified: true,
    },
    {
      quote: "Тези бижута са вечни и елегантни. Получавам комплименти всеки път, когато ги нося. Струват всяка стотинка!",
      author: "Елена Д.",
      location: "Варна",
      rating: 5,
      date: "15.01.2026",
      verified: true,
    },
  ]

  return (
    <section className="content-container py-14 small:py-32 border-t border-grey-10 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 small:mb-16">
          <div className="inline-block mb-3 small:mb-4">
            <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-grey-60 font-normal">
              Отзиви от клиенти
            </span>
          </div>
          <Heading
            level="h2"
            className="font-display text-2xl small:text-4xl text-grey-90 font-light tracking-tight"
          >
            Обичани от нашите клиенти
          </Heading>
        </div>

        <div className="grid grid-cols-1 small:grid-cols-3 gap-8 small:gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="space-y-6 p-6 small:p-8 bg-grey-5 border border-grey-10 hover:border-grey-20 transition-all duration-300 group relative"
            >
              {testimonial.verified && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-[0.65rem] font-sans font-medium tracking-wide">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Потвърдена покупка
                </div>
              )}
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-soft-gold text-sm">★</span>
                ))}
              </div>
              <Text className="font-display text-lg small:text-xl text-grey-70 font-normal leading-relaxed italic">
                &ldquo;{testimonial.quote}&rdquo;
              </Text>
              <div className="pt-4 border-t border-grey-10 flex items-center justify-between">
                <div>
                  <Text className="font-sans text-sm text-grey-90 font-normal tracking-[0.04em]">
                    {testimonial.author}
                  </Text>
                  <Text className="text-xs text-grey-50 font-light">
                    {testimonial.location}
                  </Text>
                </div>
                <Text className="text-xs text-grey-40 font-light">
                  {testimonial.date}
                </Text>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Certificate Badge */}
        <div className="mt-12 small:mt-16 flex flex-col items-center">
          <div className="flex items-center gap-4 p-6 small:p-8 border border-grey-20 rounded-lg bg-grey-5">
            <div className="flex-shrink-0 w-16 h-16 small:w-20 small:h-20 rounded-full border-2 border-soft-gold flex items-center justify-center bg-white">
              <svg className="w-8 h-8 small:w-10 small:h-10 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg small:text-xl text-grey-90 font-light">
                Сертификат за качество
              </h3>
              <p className="font-sans text-xs small:text-sm text-grey-50 font-light mt-1 max-w-md">
                Всяко бижу от Bijou Coquettee е изработено от сертифицирани материали с гаранция за автентичност и качество.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
