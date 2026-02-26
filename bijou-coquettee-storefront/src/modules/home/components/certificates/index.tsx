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
                        Quality & Trust
                    </span>
                    <h2 className="font-display text-2xl small:text-3xl text-grey-90 font-light tracking-tight mt-2">
                        Our Certificates
                    </h2>
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
