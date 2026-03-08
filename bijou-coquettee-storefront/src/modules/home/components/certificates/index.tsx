import { getCertificates } from "@lib/data/certificates"
import ContentCardGrid from "@modules/common/components/content-card-grid"

export default async function Certificates() {
    const certificates = await getCertificates()

    if (certificates.length === 0) return null

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

                <ContentCardGrid
                    items={certificates}
                    columns={3}
                    aspectRatio="auto"
                />
            </div>
        </section>
    )
}
