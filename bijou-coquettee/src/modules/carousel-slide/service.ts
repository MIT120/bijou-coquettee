import { MedusaService } from "@medusajs/framework/utils"
import CarouselSlide from "./models/carousel-slide"

class CarouselSlideModuleService extends MedusaService({
    CarouselSlide,
}) {
    async listActiveSlides() {
        return this.listCarouselSlides(
            { is_active: true },
            { order: { sort_order: "ASC" } }
        )
    }

    async getAllSlides() {
        return this.listCarouselSlides(
            {},
            { order: { sort_order: "ASC" } }
        )
    }

    async reorderSlides(slides: { id: string; sort_order: number }[]) {
        const updates = slides.map((s) => ({
            id: s.id,
            sort_order: s.sort_order,
        }))

        await this.updateCarouselSlides(updates)

        return this.listCarouselSlides(
            {},
            { order: { sort_order: "ASC" } }
        )
    }
}

export default CarouselSlideModuleService
