import { MedusaService } from "@medusajs/framework/utils"
import CmsPage from "./models/cms-page"
import PageSection from "./models/page-section"

class CmsPageModuleService extends MedusaService({
    CmsPage,
    PageSection,
}) {
    async getPublishedPage(slug: string) {
        const [page] = await this.listCmsPages(
            { slug, is_published: true },
            { take: 1 }
        )
        return page || null
    }

    async getPageBySlug(slug: string) {
        const [page] = await this.listCmsPages(
            { slug },
            { take: 1 }
        )
        return page || null
    }

    async listActiveSections(pageSlug: string) {
        return this.listPageSections(
            { page_slug: pageSlug, is_active: true },
            { order: { sort_order: "ASC" } }
        )
    }

    async listAllSections(pageSlug: string) {
        return this.listPageSections(
            { page_slug: pageSlug },
            { order: { sort_order: "ASC" } }
        )
    }

    async reorderSections(sections: { id: string; sort_order: number }[]) {
        const updates = sections.map((s) => ({
            id: s.id,
            sort_order: s.sort_order,
        }))

        await this.updatePageSections(updates)

        return this.listPageSections(
            {},
            { order: { sort_order: "ASC" } }
        )
    }
}

export default CmsPageModuleService
