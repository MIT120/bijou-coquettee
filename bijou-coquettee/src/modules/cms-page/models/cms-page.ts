import { model } from "@medusajs/framework/utils"

const CmsPage = model.define("cms_page", {
    id: model.id().primaryKey(),
    slug: model.text(),
    title: model.text(),
    seo_title: model.text().nullable(),
    seo_description: model.text().nullable(),
    seo_image: model.text().nullable(),
    is_published: model.boolean().default(false),
})

export default CmsPage
