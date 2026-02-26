import { Heading, Text } from "@medusajs/ui"
import type { RichTextContent } from "@/types/cms"

const RichTextSection = ({ content }: { content: RichTextContent }) => {
    const alignmentClass =
        content.alignment === "left"
            ? "text-left"
            : content.alignment === "right"
              ? "text-right"
              : "text-center"

    return (
        <section className="content-container py-14 small:py-24">
            <div className={`max-w-3xl mx-auto space-y-6 ${alignmentClass}`}>
                {content.label && (
                    <span className="font-sans text-xs small:text-sm tracking-[0.18em] uppercase text-grey-60 font-normal">
                        {content.label}
                    </span>
                )}
                <Heading
                    level="h2"
                    className="font-display text-2xl small:text-3xl large:text-4xl text-grey-90 font-light tracking-tight"
                >
                    {content.heading}
                </Heading>
                <div
                    className="font-sans text-base small:text-lg text-grey-60 font-light leading-relaxed space-y-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-grey-90 [&_a]:underline [&_strong]:font-medium [&_strong]:text-grey-90"
                    dangerouslySetInnerHTML={{ __html: content.body }}
                />
            </div>
        </section>
    )
}

export default RichTextSection
