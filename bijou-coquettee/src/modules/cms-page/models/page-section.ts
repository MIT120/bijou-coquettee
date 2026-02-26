import { model } from "@medusajs/framework/utils"

const PageSection = model.define("page_section", {
    id: model.id().primaryKey(),
    page_slug: model.text(),
    type: model.text(),
    content: model.json().default({}),
    sort_order: model.number().default(0),
    is_active: model.boolean().default(true),
})

export default PageSection
