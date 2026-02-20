import { Metadata } from "next"
import { Heading, Text } from "@medusajs/ui"

export const metadata: Metadata = {
  title: "Политика за бисквитките | Bijou Coquettee",
  description:
    "Политика за бисквитките на електронния магазин Bijou Coquettee.",
}

export default function CookiePolicyPage() {
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
          Политика за бисквитките
        </Heading>
      </div>

      <div className="space-y-10 font-sans text-sm text-grey-60 font-light leading-relaxed">
        {/* Въведение */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            1. Въведение
          </Heading>
          <Text>
            Настоящата Политика за бисквитките обяснява как електронният магазин
            bijou.coquettee.com, управляван от &bdquo;Велтон Груп&ldquo; ЕООД,
            използва бисквитки и подобни технологии при посещение на сайта.
          </Text>
          <Text>
            Бисквитките (&bdquo;cookies&ldquo;) са малки текстови файлове,
            които се съхраняват на устройството на потребителя (компютър,
            таблет, мобилен телефон) при посещение на даден уебсайт. Те
            позволяват на сайта да разпознава устройството на потребителя и да
            подобрява функционалността и потребителското изживяване.
          </Text>
        </section>

        {/* Видове бисквитки */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            2. Какви бисквитки използваме
          </Heading>

          <div className="space-y-4">
            <div>
              <Text className="text-grey-80 font-medium">
                2.1. Задължителни (необходими) бисквитки
              </Text>
              <Text>
                Тези бисквитки са необходими за правилното функциониране на
                сайта и не могат да бъдат изключени. Те позволяват:
              </Text>
              <ul className="list-disc pl-5 space-y-1 text-grey-60 mt-1">
                <li>навигация в сайта</li>
                <li>
                  използване на основни функции (количка, поръчка,
                  потребителски профил)
                </li>
                <li>защита на сигурността на сайта</li>
              </ul>
            </div>

            <div>
              <Text className="text-grey-80 font-medium">
                2.2. Функционални бисквитки
              </Text>
              <Text>
                Тези бисквитки позволяват сайтът да запомня направени от
                потребителя избори (например език или запазени данни за вход), с
                цел по-удобно използване.
              </Text>
            </div>

            <div>
              <Text className="text-grey-80 font-medium">
                2.3. Статистически (аналитични) бисквитки
              </Text>
              <Text>
                Използват се за събиране на обобщена информация относно начина,
                по който посетителите използват сайта (напр. кои страници се
                посещават най-често). Тази информация се използва само за
                статистически цели и за подобряване на работата на сайта.
              </Text>
            </div>

            <div>
              <Text className="text-grey-80 font-medium">
                2.4. Маркетингови бисквитки
              </Text>
              <Text>
                Тези бисквитки могат да се използват за показване на съдържание
                или реклами, съобразени с интересите на потребителя. Те се
                използват само при изрично съгласие от страна на потребителя.
              </Text>
            </div>
          </div>
        </section>

        {/* Бисквитки на трети страни */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            3. Бисквитки на трети страни
          </Heading>
          <Text>
            Възможно е сайтът да използва услуги на трети страни (например
            аналитични инструменти), които също могат да поставят бисквитки. Те
            се управляват от съответните трети страни и се подчиняват на техните
            политики за поверителност.
          </Text>
        </section>

        {/* Управление на бисквитките */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            4. Управление на бисквитките
          </Heading>
          <Text>
            При първото посещение на сайта потребителят получава уведомление
            (cookie banner), чрез което може:
          </Text>
          <ul className="list-disc pl-5 space-y-1 text-grey-60">
            <li>да приеме всички бисквитки</li>
            <li>да откаже незадължителните бисквитки</li>
            <li>да управлява своите предпочитания</li>
          </ul>
          <Text>
            Потребителят може по всяко време да изтрие или блокира бисквитките
            чрез настройките на своя браузър. Това обаче може да повлияе на
            функционалността на сайта.
          </Text>
        </section>

        {/* Правно основание */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            5. Правно основание
          </Heading>
          <Text>Използването на:</Text>
          <ul className="list-disc pl-5 space-y-1 text-grey-60">
            <li>
              <strong className="text-grey-80 font-medium">
                задължителни бисквитки
              </strong>{" "}
              - се основава на легитимен интерес
            </li>
            <li>
              <strong className="text-grey-80 font-medium">
                всички останали бисквитки
              </strong>{" "}
              - се извършва само след изрично съгласие на потребителя, съгласно
              Регламент (ЕС) 2016/679 (GDPR)
            </li>
          </ul>
        </section>

        {/* Промени */}
        <section className="space-y-3">
          <Heading
            level="h2"
            className="font-sans text-base text-grey-90 font-medium tracking-wide"
          >
            6. Промени в политиката
          </Heading>
          <Text>
            &bdquo;Велтон Груп&ldquo; ЕООД си запазва правото да актуализира
            настоящата Политика за бисквитките. Актуалната версия винаги е
            публикувана на сайта.
          </Text>
        </section>
      </div>
    </div>
  )
}
