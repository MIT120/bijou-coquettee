import { getCertificates } from "@lib/data/certificates"
import ContentCardGrid from "@modules/common/components/content-card-grid"

const trustBadges = [
    {
        title: "Сребро 925",
        description: "Всички сребърни бижута са от истинско сребро 925 проба с гарантиран произход.",
        icon: (
            <svg className="w-8 h-8 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
        ),
    },
    {
        title: "Ръчна изработка",
        description: "Всяко бижу е изработено ръчно с внимание към всеки детайл и с любов към занаята.",
        icon: (
            <svg className="w-8 h-8 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
        ),
    },
    {
        title: "Гаранция за качество",
        description: "Гарантираме качеството на всяко изделие. Вашата удовлетвореност е наш приоритет.",
        icon: (
            <svg className="w-8 h-8 text-soft-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
    },
]

export default async function Certificates() {
    const certificates = await getCertificates()

    return (
        <section className="py-12 small:py-16">
            <div className="content-container">
                <div className="text-center mb-10">
                    <span className="font-sans text-xs tracking-[0.18em] uppercase text-grey-60 font-normal">
                        Качество и доверие
                    </span>
                    <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight mt-2">
                        Нашите сертификати
                    </h2>
                    <p className="font-sans text-sm text-grey-50 font-light leading-relaxed text-center max-w-2xl mx-auto mt-5 mb-0">
                        Всяко изделие от Bijou Coquettee е изработено от сертифицирани материали — истинско сребро 925, позлатени покрития и естествени камъни с доказан произход. Нашите сертификати потвърждават ангажимента ни към автентичност, качество и дълготрайност. Купувате с увереност, защото зад всяко бижу стои гаранция за истинска стойност.
                    </p>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-1 small:grid-cols-3 gap-6 mb-12">
                    {trustBadges.map((badge, index) => (
                        <div
                            key={index}
                            className="text-center p-6 small:p-8 bg-grey-5 border border-grey-10 rounded-lg hover:border-grey-20 transition-all duration-300"
                        >
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full border-2 border-soft-gold/30 bg-white flex items-center justify-center">
                                    {badge.icon}
                                </div>
                            </div>
                            <h3 className="font-display text-lg text-grey-90 font-light mb-2">
                                {badge.title}
                            </h3>
                            <p className="font-sans text-xs small:text-sm text-grey-50 font-light leading-relaxed max-w-xs mx-auto">
                                {badge.description}
                            </p>
                        </div>
                    ))}
                </div>

                {certificates.length > 0 && (
                    <ContentCardGrid
                        items={certificates}
                        columns={3}
                        aspectRatio="auto"
                    />
                )}
            </div>
        </section>
    )
}
