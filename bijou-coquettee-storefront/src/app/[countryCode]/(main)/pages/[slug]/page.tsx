import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCmsPage } from "@lib/data/cms-pages"
import PageSectionRenderer from "@modules/common/components/page-section-renderer"

type Props = {
    params: Promise<{ slug: string; countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { slug } = await props.params

    const data = await getCmsPage(slug)

    if (!data || !data.page.is_published) {
        return { title: "Page Not Found" }
    }

    return {
        title: data.page.seo_title || `${data.page.title} | Bijou Coquettee`,
        description: data.page.seo_description || undefined,
        openGraph: data.page.seo_image
            ? { images: [{ url: data.page.seo_image }] }
            : undefined,
    }
}

export default async function CmsPage(props: Props) {
    const { slug } = await props.params

    const data = await getCmsPage(slug)

    if (!data || !data.page.is_published) {
        notFound()
    }

    const { page, sections } = data

    // If the page has no sections yet, show the title as a placeholder
    if (sections.length === 0) {
        return (
            <div className="py-16 small:py-24">
                <div className="content-container max-w-3xl">
                    <div className="space-y-3 mb-12">
                        <span className="font-sans text-xs tracking-[0.18em] uppercase text-grey-60 font-normal">
                            {page.title}
                        </span>
                        <h1 className="font-display text-3xl small:text-4xl text-grey-90 font-light tracking-tight">
                            {page.title}
                        </h1>
                        <p className="font-sans text-base text-grey-50 font-light leading-relaxed">
                            This page has no content sections yet. Add sections from the admin panel.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageSectionRenderer sections={sections} />
        </div>
    )
}
