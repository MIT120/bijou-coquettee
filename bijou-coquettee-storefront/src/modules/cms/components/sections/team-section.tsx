import { Heading, Text } from "@medusajs/ui"
import type { TeamContent } from "@/types/cms"

const TeamSection = ({ content }: { content: TeamContent }) => {
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
            <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 gap-8 small:gap-12 max-w-5xl mx-auto">
                {content.members?.map((member, i) => (
                    <div key={i} className="text-center space-y-4">
                        {member.image_url && (
                            <div className="w-32 h-32 small:w-40 small:h-40 mx-auto rounded-full overflow-hidden">
                                <img
                                    src={member.image_url}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="space-y-1">
                            <Heading
                                level="h3"
                                className="font-display text-lg text-grey-90 font-light"
                            >
                                {member.name}
                            </Heading>
                            <Text className="font-sans text-sm text-grey-50 font-light tracking-wide uppercase">
                                {member.role}
                            </Text>
                        </div>
                        {member.bio && (
                            <Text className="font-sans text-sm text-grey-60 font-light leading-relaxed">
                                {member.bio}
                            </Text>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default TeamSection
