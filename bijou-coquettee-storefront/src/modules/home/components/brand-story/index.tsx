import { Heading, Text } from "@medusajs/ui"

const BrandStory = () => {
  return (
    <section className="content-container py-14 small:py-32 border-t border-grey-10">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-block mb-4">
          <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-grey-60 font-normal">
            Нашата история
          </span>
        </div>
        <Heading
          level="h2"
          className="font-display text-3xl small:text-4xl large:text-5xl text-grey-90 font-light tracking-tight"
        >
          Изработени със страст, носени с гордост
        </Heading>
        <div className="space-y-6 max-w-2xl mx-auto">
          <Text className="text-base small:text-lg text-grey-60 font-light leading-relaxed">
            В Bijou Coquettee вярваме, че бижутата са повече от аксесоар — те са
            отражение на вашата уникална история. Всяко изделие в нашата колекция е
            грижливо подбрано и изработено с внимание към детайла.
          </Text>
          <Text className="text-base small:text-lg text-grey-60 font-light leading-relaxed">
            От деликатни ежедневни бижута до впечатляващи изделия за специални поводи,
            предлагаме вечен дизайн, който празнува елегантността и изтънчеността.
          </Text>
        </div>
        <div className="grid grid-cols-1 small:grid-cols-3 gap-8 small:gap-12 pt-12">
          <div className="space-y-3 group hover:opacity-80 transition-opacity duration-300">
            <div className="font-display text-4xl small:text-5xl text-grey-90 font-light group-hover:translate-y-[-2px] transition-transform duration-300">01</div>
            <Heading level="h3" className="font-display text-lg text-grey-90 font-light">
              Подбрана селекция
            </Heading>
            <Text className="text-sm text-grey-50 font-light leading-relaxed">
              Ръчно избрани бижута от доверени майстори и дизайнери
            </Text>
          </div>
          <div className="space-y-3 group hover:opacity-80 transition-opacity duration-300">
            <div className="font-display text-4xl small:text-5xl text-grey-90 font-light group-hover:translate-y-[-2px] transition-transform duration-300">02</div>
            <Heading level="h3" className="font-display text-lg text-grey-90 font-light">
              Качествена изработка
            </Heading>
            <Text className="text-sm text-grey-50 font-light leading-relaxed">
              Всяко бижу отговаря на нашите високи стандарти за качество и красота
            </Text>
          </div>
          <div className="space-y-3 group hover:opacity-80 transition-opacity duration-300">
            <div className="font-display text-4xl small:text-5xl text-grey-90 font-light group-hover:translate-y-[-2px] transition-transform duration-300">03</div>
            <Heading level="h3" className="font-display text-lg text-grey-90 font-light">
              Вечен дизайн
            </Heading>
            <Text className="text-sm text-grey-50 font-light leading-relaxed">
              Класически стилове, които надхвърлят тенденциите и стават наследство
            </Text>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrandStory

