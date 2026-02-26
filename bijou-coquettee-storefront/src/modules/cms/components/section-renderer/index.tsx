import type {
    PageSection,
    HeroContent,
    RichTextContent,
    ImageTextContent,
    GalleryContent,
    StatsContent,
    TeamContent,
    CtaContent,
} from "@/types/cms"
import HeroSection from "../sections/hero-section"
import RichTextSection from "../sections/rich-text-section"
import ImageTextSection from "../sections/image-text-section"
import GallerySection from "../sections/gallery-section"
import StatsSection from "../sections/stats-section"
import TeamSection from "../sections/team-section"
import CtaSection from "../sections/cta-section"

const SectionRenderer = ({ sections }: { sections: PageSection[] }) => {
    return (
        <>
            {sections.map((section) => {
                switch (section.type) {
                    case "hero":
                        return (
                            <HeroSection
                                key={section.id}
                                content={section.content as unknown as HeroContent}
                            />
                        )
                    case "rich_text":
                        return (
                            <RichTextSection
                                key={section.id}
                                content={section.content as unknown as RichTextContent}
                            />
                        )
                    case "image_text":
                        return (
                            <ImageTextSection
                                key={section.id}
                                content={section.content as unknown as ImageTextContent}
                            />
                        )
                    case "gallery":
                        return (
                            <GallerySection
                                key={section.id}
                                content={section.content as unknown as GalleryContent}
                            />
                        )
                    case "stats":
                        return (
                            <StatsSection
                                key={section.id}
                                content={section.content as unknown as StatsContent}
                            />
                        )
                    case "team":
                        return (
                            <TeamSection
                                key={section.id}
                                content={section.content as unknown as TeamContent}
                            />
                        )
                    case "cta":
                        return (
                            <CtaSection
                                key={section.id}
                                content={section.content as unknown as CtaContent}
                            />
                        )
                    default:
                        return null
                }
            })}
        </>
    )
}

export default SectionRenderer
