import { Heading, Text } from "@medusajs/ui"
import type { GalleryContent } from "@/types/cms"

const GallerySection = ({ content }: { content: GalleryContent }) => {
    const columns = content.columns || 3
    const gridClass =
        columns === 2
            ? "grid-cols-1 small:grid-cols-2"
            : columns === 4
              ? "grid-cols-2 small:grid-cols-4"
              : "grid-cols-1 small:grid-cols-3"

    return (
        <section className="content-container py-14 small:py-24">
            {content.heading && (
                <Heading
                    level="h2"
                    className="font-display text-2xl small:text-3xl large:text-4xl text-grey-90 font-light tracking-tight text-center mb-10 small:mb-16"
                >
                    {content.heading}
                </Heading>
            )}
            <div className={`grid ${gridClass} gap-4 small:gap-6`}>
                {content.images?.map((image, i) => (
                    <div key={i} className="group">
                        <div className="aspect-square overflow-hidden">
                            <img
                                src={image.image_url}
                                alt={image.alt || ""}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        {image.caption && (
                            <Text className="font-sans text-sm text-grey-50 font-light mt-3">
                                {image.caption}
                            </Text>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default GallerySection
