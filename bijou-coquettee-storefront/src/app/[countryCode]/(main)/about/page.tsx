import { Metadata } from "next"
import { Heading, Text } from "@medusajs/ui"

import Certificates from "@modules/home/components/certificates"
import PageSectionRenderer from "@modules/common/components/page-section-renderer"
import { getCmsPage } from "@lib/data/cms-pages"

// ---------------------------------------------------------------------------
// Metadata: resolved at request time so CMS SEO fields can override defaults
// ---------------------------------------------------------------------------

const DEFAULT_TITLE = "За нас | Bijou Coquettee"
const DEFAULT_DESCRIPTION =
    "Научете повече за Bijou Coquettee - ръчно изработени бижута с кристали Swarovski и естествени камъни."

export async function generateMetadata(): Promise<Metadata> {
    const cmsData = await getCmsPage("about")

    if (cmsData?.page?.is_published) {
        return {
            title: cmsData.page.seo_title ?? DEFAULT_TITLE,
            description: cmsData.page.seo_description ?? DEFAULT_DESCRIPTION,
            openGraph: cmsData.page.seo_image
                ? { images: [{ url: cmsData.page.seo_image }] }
                : undefined,
        }
    }

    return {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
    }
}

// ---------------------------------------------------------------------------
// Hardcoded fallback content (keep as-is so the page always renders)
// ---------------------------------------------------------------------------

function StaticAboutContent() {
    return (
        <div className="py-16 small:py-24">
            <div className="content-container max-w-3xl">
                <div className="space-y-3 mb-12">
                    <span className="font-sans text-xs tracking-[0.18em] uppercase text-grey-60 font-normal">
                        About
                    </span>
                    <Heading
                        level="h1"
                        className="font-display text-3xl small:text-4xl text-grey-90 font-light tracking-tight"
                    >
                        За нас
                    </Heading>
                    <Text className="font-sans text-base text-grey-50 font-light leading-relaxed">
                        Ръчно изработени бижута, създадени с внимание към детайла и
                        любов към красотата.
                    </Text>
                </div>

                <div className="space-y-10 font-sans text-sm text-grey-60 font-light leading-relaxed">
                    <section className="space-y-3">
                        <Heading
                            level="h2"
                            className="font-sans text-base text-grey-90 font-medium tracking-wide"
                        >
                            Нашата история
                        </Heading>
                        <Text>
                            Bijou Coquettee е марка за ръчно изработени бижута,
                            вдъхновена от елегантността и женствеността. Всяко
                            бижу е създадено с грижа, използвайки висококачествени
                            материали - кристали Swarovski, естествени камъни и
                            стоманени компоненти.
                        </Text>
                        <Text>
                            Вярваме, че бижутата са повече от аксесоар - те са
                            израз на индивидуалност и стил. Затова всеки наш
                            продукт е проектиран да бъде уникален, елегантен и
                            издръжлив.
                        </Text>
                    </section>

                    <section className="space-y-3">
                        <Heading
                            level="h2"
                            className="font-sans text-base text-grey-90 font-medium tracking-wide"
                        >
                            Качество и материали
                        </Heading>
                        <Text>
                            Работим само с проверени доставчици и използваме
                            материали от най-високо качество. Кристалите Swarovski,
                            които използваме, са гаранция за блясък и
                            дълготрайност. Всяко бижу преминава през внимателен
                            контрол на качеството, преди да достигне до вас.
                        </Text>
                    </section>

                    <section className="space-y-3">
                        <Heading
                            level="h2"
                            className="font-sans text-base text-grey-90 font-medium tracking-wide"
                        >
                            Нашата мисия
                        </Heading>
                        <Text>
                            Стремим се да предоставим на всяка жена достъп до
                            красиви, качествени и достъпни бижута. Нашата цел е да
                            създаваме продукти, които носят радост и увереност на
                            всеки, който ги носи.
                        </Text>
                    </section>
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function AboutPage() {
    const cmsData = await getCmsPage("about")
    const isCmsActive =
        cmsData !== null &&
        cmsData.page.is_published &&
        cmsData.sections.length > 0

    return (
        <main>
            {isCmsActive ? (
                <PageSectionRenderer sections={cmsData.sections} />
            ) : (
                <StaticAboutContent />
            )}

            <Certificates />
        </main>
    )
}
