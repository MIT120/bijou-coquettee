export type CmsPage = {
    id: string
    slug: string
    title: string
    seo_title: string | null
    seo_description: string | null
    seo_image: string | null
    is_published: boolean
}

export type SectionType =
    | "hero"
    | "rich_text"
    | "image_text"
    | "gallery"
    | "stats"
    | "team"
    | "cta"
    | "accordion"
    | "video"
    | "file_download"
    | "testimonial"
    | "feature_grid"
    | "divider"
    | "banner"
    | "logo_grid"
    | "certificates"

export type PageSection = {
    id: string
    type: SectionType
    content: Record<string, unknown>
    sort_order: number
}

// Section content types

export type HeroContent = {
    image_url: string
    heading: string
    subheading?: string
    overlay_color?: string
    overlay_opacity?: number
    cta_text?: string
    cta_link?: string
}

export type RichTextContent = {
    label?: string
    heading: string
    body: string
    alignment?: "left" | "center" | "right"
}

export type ImageTextContent = {
    image_url: string
    image_alt?: string
    heading: string
    body: string
    layout?: "image_left" | "image_right"
    cta_text?: string
    cta_link?: string
}

export type GalleryImage = {
    image_url: string
    alt?: string
    caption?: string
}

export type GalleryContent = {
    heading?: string
    columns?: 2 | 3 | 4
    images: GalleryImage[]
}

export type StatItem = {
    value: string
    label: string
}

export type StatsContent = {
    heading?: string
    stats: StatItem[]
}

export type TeamMember = {
    name: string
    role: string
    image_url?: string
    bio?: string
}

export type TeamContent = {
    heading?: string
    members: TeamMember[]
}

export type CtaContent = {
    heading: string
    description?: string
    button_text: string
    button_link: string
    background_color?: string
}

export type CmsPageResponse = {
    page: CmsPage
    sections: PageSection[]
}

export type AccordionItem = {
    question: string
    answer: string
}

export type AccordionContent = {
    heading?: string
    items: AccordionItem[]
}

export type VideoContent = {
    heading?: string
    description?: string
    video_url: string
    aspect_ratio?: "16:9" | "4:3" | "1:1"
}

export type FileItem = {
    file_url: string
    file_name: string
    file_size?: string
    file_type?: string
    description?: string
}

export type FileDownloadContent = {
    heading?: string
    description?: string
    files: FileItem[]
}

export type TestimonialItem = {
    quote: string
    author: string
    role?: string
    image_url?: string
    rating?: number
}

export type TestimonialContent = {
    heading?: string
    testimonials: TestimonialItem[]
}

export type FeatureItem = {
    icon?: string
    title: string
    description: string
}

export type FeatureGridContent = {
    heading?: string
    columns?: 2 | 3 | 4
    features: FeatureItem[]
}

export type DividerContent = {
    style: "line" | "dots" | "space"
    spacing: "small" | "medium" | "large"
}

export type BannerContent = {
    text: string
    background_color?: string
    text_color?: string
    cta_text?: string
    cta_link?: string
    style: "info" | "promo" | "warning"
}

export type LogoItem = {
    image_url: string
    alt: string
    link?: string
}

export type LogoGridContent = {
    heading?: string
    logos: LogoItem[]
}

export type CertificatesContent = {
    label?: string
    heading?: string
    description?: string
    columns?: 2 | 3 | 4
}
