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
