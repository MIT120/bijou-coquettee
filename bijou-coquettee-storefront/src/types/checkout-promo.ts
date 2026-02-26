export interface CheckoutPromo {
    id: string
    product_id: string
    variant_id: string
    heading: string | null
    description: string | null
    discount_percent: number | null
    promotion_code: string | null
}
