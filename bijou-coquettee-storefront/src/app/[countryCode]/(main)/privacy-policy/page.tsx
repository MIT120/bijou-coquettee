import { Metadata } from "next"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Политика за поверителност | Bijou Coquettee",
  description:
    "Политика за защита на личните данни на електронния магазин Bijou Coquettee.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="content-container py-16 small:py-24 max-w-3xl">
      <div className="space-y-3 mb-12">
        <span className="font-sans text-xs tracking-[0.18em] uppercase text-grey-60 font-normal">
          Legal
        </span>
        <Heading
          level="h1"
          className="font-display text-3xl small:text-4xl text-grey-90 font-light tracking-tight"
        >
          Политика за поверителност
        </Heading>
      </div>

      <div className="space-y-10 font-sans text-sm text-grey-60 font-light leading-relaxed">
        {/* Предмет */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            I. Предмет
          </Heading>
          <Text>
            Чл. 1. Настоящата Политика за личните данни е предназначена за
            регулиране на отношенията при обработката на лични данни между
            ВЕЛТОН ГРУП ЕООД, наричано по-долу за краткост
            &bdquo;Доставчик&ldquo;, собственик на електронния магазин:
            https://bijou.coquettee.com/, наричан по-долу за краткост
            &bdquo;Електронен магазин&ldquo;, и всеки един от ползвателите,
            наричани по-долу за краткост &bdquo;Ползвател/и&ldquo;.
          </Text>
          <div className="p-4 border border-grey-20 bg-cream-100 space-y-1.5">
            <Text className="text-xs text-grey-60 font-medium">
              Администратор на лични данни по смисъла на Регламент (ЕС)
              2016/679 (GDPR):
            </Text>
            <ul className="list-none space-y-1 text-xs text-grey-60">
              <li>
                <strong className="text-grey-80 font-medium">
                  Наименование:
                </strong>{" "}
                &bdquo;Велтон Груп&ldquo; ЕООД
              </li>
              <li>
                <strong className="text-grey-80 font-medium">ЕИК:</strong>{" "}
                205629294
              </li>
              <li>
                <strong className="text-grey-80 font-medium">
                  Седалище и адрес на управление:
                </strong>{" "}
                гр. София, ул. Враня 109
              </li>
            </ul>
          </div>
        </section>

        {/* Регулиращ орган */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            II. Регулиращ орган
          </Heading>
          <Text>
            Чл. 2. Комисия за защита на личните данни на Република България,
            адрес: гр. София, п.к. 1592, бул. &bdquo;Проф. Цветан
            Лазаров&ldquo; No 2, тел.: 02/ 915 35 18, факс: 02/ 915 35 25,
            Имейл: kzld@cpdp.bg, Интернет сайт: www.cpdp.bg
          </Text>
        </section>

        {/* Обработка на лични данни */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            III. Обработка на личните данни
          </Heading>
          <Text>
            В зависимост от използването на сайта, могат да бъдат обработвани
            следните лични данни:
          </Text>
          <ul className="list-disc pl-5 space-y-1.5 text-grey-60">
            <li>имена</li>
            <li>телефонен номер</li>
            <li>адрес на електронна поща</li>
            <li>адрес за доставка</li>
            <li>данни за направени поръчки</li>
            <li>IP адрес и технически данни за устройството (чрез бисквитки)</li>
          </ul>
        </section>

        {/* Срок на съхранение */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            IV. Срок на съхранение
          </Heading>
          <Text>
            Чл. 3. Личните данни се съхраняват за срок, не по-дълъг от
            необходимия за постигане на целите, за които са събрани, както и в
            съответствие с приложимите законови изисквания.
          </Text>
        </section>

        {/* Защита на лични данни */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            V. Защита на личните данни
          </Heading>
          <Text>
            Чл. 4. (1) Доставчикът, чрез Електронния магазин, събира,
            съхранява и обработва лични данни на Ползвателите само във връзка
            със своята дейност, съобразено с изискванията на приложимото право и
            със Закона за защита на личните данни на Република България.
          </Text>
          <Text>
            (2) Личните данни на Ползвателя могат да бъдат ползвани за:
            удостоверяване и извършване на комуникация при направени запитвания,
            предоставяне на рекламно съдържание адаптирано спрямо интересите на
            Ползвателя, изпращане на Бюлетин (при съгласие), статистическа
            информация за ползване на Електронния магазин, защита на
            информационната сигурност, счетоводни цели и обезпечаване
            предоставянето на услугите на Доставчика.
          </Text>
          <Text>
            (3) Доставчикът предприема мерки за защита на личните данни на
            Ползвателя съгласно действащото законодателство, включително Закона
            за защита на личните данни.
          </Text>
        </section>

        {/* Бисквитки */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            VI. Бисквитки
          </Heading>
          <Text>
            Чл. 5. Електронният магазин използва бисквитки (cookies), като
            вида, целите и условията за използването им са посочени в{" "}
            <LocalizedClientLink
              href="/cookie-policy"
              className="text-grey-90 underline underline-offset-2 hover:text-gold-500 transition-colors"
            >
              Политиката за бисквитки
            </LocalizedClientLink>
            .
          </Text>
        </section>

        {/* Права на Ползвателя */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            VII. Права на Ползвателя
          </Heading>
          <Text>
            Чл. 7. Доставчикът не разкрива, продава, обменя или по какъвто и
            да било друг начин предоставя на трети страни информацията, която
            Електронния магазин събира, освен когато това се изисква съгласно
            приложимото законодателство и/или от надлежен орган, упълномощен по
            закон.
          </Text>
          <Text>
            Ползвателят има право да поиска от Доставчика да коригира, изтрие,
            ограничи ползването на личните му данни чрез изпращане на
            електронно съобщение към Доставчика с ясно изразено желание, или
            чрез искане за отказ в писмена форма, изпратено до Доставчика по
            пощата на адрес гр. София, ул. Враня 109.
          </Text>
        </section>
      </div>
    </div>
  )
}
