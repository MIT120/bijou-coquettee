"use client"

import { useState, useEffect, useCallback } from "react"
import { Heading, Text } from "@medusajs/ui"

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
  {
    quote: "Поръчах гривна за рождения ден на майка ми и тя беше във възторг! Сребро 925 с красив блясък. Доставката беше бърза.",
    author: "Десислава М.",
    location: "Бургас",
    rating: 5,
    date: "03.12.2025",
    verified: true,
  },
  {
    quote: "Прекрасни обеци с кристали Swarovski. Леки и удобни за носене цял ден. Много съм доволна от покупката.",
    author: "Ивана С.",
    location: "Русе",
    rating: 5,
    date: "18.11.2025",
    verified: true,
  },
  {
    quote: "Купих комплект за годишнината ни и съпругата ми го обожава. Елегантна опаковка, перфектна за подарък. Благодаря!",
    author: "Георги Т.",
    location: "Стара Загора",
    rating: 5,
    date: "05.11.2025",
    verified: true,
  },
  {
    quote: "Второ поръчка от Bijou Coquettee и отново съм впечатлена. Качеството е постоянно високо, а дизайните са уникални.",
    author: "Антония В.",
    location: "Благоевград",
    rating: 4,
    date: "22.10.2025",
    verified: true,
  },
  {
    quote: "Много красиво колие с естествен камък. Цветовете са точно като на снимката. Бърза доставка до офис на Еконт.",
    author: "Силвия Р.",
    location: "Шумен",
    rating: 5,
    date: "10.10.2025",
    verified: true,
  },
  {
    quote: "Изключително фина изработка на пръстена. Размерът беше перфектен благодарение на ръководството за размери на сайта.",
    author: "Николета Б.",
    location: "Велико Търново",
    rating: 4,
    date: "28.09.2025",
    verified: true,
  },
  {
    quote: "Подарих си гривна за рождения си ден и не съжалявам. Носи се лесно, не потъмнява и изглежда скъпо. Препоръчвам!",
    author: "Радина Г.",
    location: "Плевен",
    rating: 5,
    date: "14.09.2025",
    verified: true,
  },
]

const ITEMS_PER_PAGE_DESKTOP = 3
const ITEMS_PER_PAGE_MOBILE = 1

const Testimonials = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DESKTOP)

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 1024 ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const totalPages = Math.ceil(testimonials.length / itemsPerPage)

  const goToNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }, [totalPages])

  const goToPrev = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }, [totalPages])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(goToNext, 6000)
    return () => clearInterval(timer)
  }, [isPaused, goToNext])

  const visibleTestimonials = testimonials.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  )

  return (
    <section
      className="content-container py-14 small:py-32 border-t border-grey-10 bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
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
          <p className="font-sans text-sm text-grey-50 font-light mt-3">
            {testimonials.length} потвърдени отзива
          </p>
        </div>

        <div className="relative">
          {/* Navigation arrows */}
          <button
            onClick={goToPrev}
            className="absolute -left-4 small:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-grey-20 hover:border-grey-40 shadow-warm-sm flex items-center justify-center transition-all duration-200"
            aria-label="Previous reviews"
          >
            <svg className="w-4 h-4 text-grey-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute -right-4 small:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-grey-20 hover:border-grey-40 shadow-warm-sm flex items-center justify-center transition-all duration-200"
            aria-label="Next reviews"
          >
            <svg className="w-4 h-4 text-grey-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="grid grid-cols-1 small:grid-cols-3 gap-8 small:gap-12">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={currentPage * itemsPerPage + index}
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
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < testimonial.rating ? "text-soft-gold" : "text-grey-20"}`}>★</span>
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

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentPage ? "w-8 bg-grey-90" : "w-2 bg-grey-30 hover:bg-grey-40"
                }`}
                aria-label={`Go to reviews page ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default Testimonials
