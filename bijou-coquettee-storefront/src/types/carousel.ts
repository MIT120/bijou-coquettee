export interface CarouselSlide {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    image_url: string
    cta_text: string | null
    cta_link: string | null
    product_handle: string | null
    overlay_color: string | null
    overlay_opacity: number | null
    sort_order: number
    is_active: boolean
}
