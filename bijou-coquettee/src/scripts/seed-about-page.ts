import CmsPageModuleService from "../modules/cms-page/service"
import { CMS_PAGE_MODULE } from "../modules/cms-page"

/**
 * Seed About Page with CMS Content
 * Run with: npx medusa exec ./src/scripts/seed-about-page.ts
 *
 * Creates the "about" CMS page pre-populated with sections matching
 * the current hardcoded About page content (Bulgarian).
 * Safe to run multiple times — skips if "about" page already exists.
 */
export default async function seedAboutPage({ container }: any) {
    const cmsService: CmsPageModuleService = container.resolve(CMS_PAGE_MODULE)

    console.log("🌱 Seeding About page CMS content...")

    // ── Check if page already exists ──────────────────────────────
    const existing = await cmsService.getPageBySlug("about")
    if (existing) {
        console.log("ℹ️  About page already exists (slug: about). Skipping seed.")
        console.log("   To re-seed, delete the page from the admin first.")
        return
    }

    // ── Create the CMS page ───────────────────────────────────────
    const [page] = await cmsService.createCmsPages([
        {
            slug: "about",
            title: "За нас",
            seo_title: "За нас | Bijou Coquettee",
            seo_description:
                "Научете повече за Bijou Coquettee - ръчно изработени бижута с кристали Swarovski и естествени камъни.",
            is_published: true,
        },
    ])

    console.log(`✅ Created page: "${page.title}" (slug: ${page.slug})`)

    // ── Create sections ───────────────────────────────────────────

    // Section 1: Header / Intro
    await cmsService.createPageSections([
        {
            page_slug: "about",
            type: "rich_text",
            sort_order: 0,
            is_active: true,
            content: {
                label: "About",
                heading: "За нас",
                body: "<p>Ръчно изработени бижута, създадени с внимание към детайла и любов към красотата.</p>",
                alignment: "center",
            },
        },
    ])
    console.log("   ✅ Section 1: Header (rich_text)")

    // Section 2: Our Story
    await cmsService.createPageSections([
        {
            page_slug: "about",
            type: "rich_text",
            sort_order: 1,
            is_active: true,
            content: {
                heading: "Нашата история",
                body: "<p>Bijou Coquettee е марка за ръчно изработени бижута, вдъхновена от елегантността и женствеността. Всяко бижу е създадено с грижа, използвайки висококачествени материали - кристали Swarovski, естествени камъни и стоманени компоненти.</p><p>Вярваме, че бижутата са повече от аксесоар - те са израз на индивидуалност и стил. Затова всеки наш продукт е проектиран да бъде уникален, елегантен и издръжлив.</p>",
                alignment: "left",
            },
        },
    ])
    console.log("   ✅ Section 2: Нашата история (rich_text)")

    // Section 3: Quality & Materials
    await cmsService.createPageSections([
        {
            page_slug: "about",
            type: "rich_text",
            sort_order: 2,
            is_active: true,
            content: {
                heading: "Качество и материали",
                body: "<p>Работим само с проверени доставчици и използваме материали от най-високо качество. Кристалите Swarovski, които използваме, са гаранция за блясък и дълготрайност. Всяко бижу преминава през внимателен контрол на качеството, преди да достигне до вас.</p>",
                alignment: "left",
            },
        },
    ])
    console.log("   ✅ Section 3: Качество и материали (rich_text)")

    // Section 4: Our Mission
    await cmsService.createPageSections([
        {
            page_slug: "about",
            type: "rich_text",
            sort_order: 3,
            is_active: true,
            content: {
                heading: "Нашата мисия",
                body: "<p>Стремим се да предоставим на всяка жена достъп до красиви, качествени и достъпни бижута. Нашата цел е да създаваме продукти, които носят радост и увереност на всеки, който ги носи.</p>",
                alignment: "left",
            },
        },
    ])
    console.log("   ✅ Section 4: Нашата мисия (rich_text)")

    // Section 5: Certificates (auto-fetched from certificate module)
    await cmsService.createPageSections([
        {
            page_slug: "about",
            type: "certificates",
            sort_order: 4,
            is_active: true,
            content: {
                label: "Качество и доверие",
                heading: "Нашите сертификати",
                description:
                    "Всяко изделие от Bijou Coquettee е изработено от сертифицирани материали — истинско сребро 925, позлатени покрития и естествени камъни с доказан произход. Нашите сертификати потвърждават ангажимента ни към автентичност, качество и дълготрайност. Купувате с увереност, защото зад всяко бижу стои гаранция за истинска стойност.",
                columns: 3,
            },
        },
    ])
    console.log("   ✅ Section 5: Certificates (certificates)")

    console.log("")
    console.log("🎉 About page seeded successfully!")
    console.log("   📝 Admin: /app/cms-pages/about")
    console.log("   🌐 Store: /{countryCode}/about")
}
