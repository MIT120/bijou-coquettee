import Image from "next/image"

export type ContentCard = {
    id: string
    title: string
    description?: string | null
    image_url: string
    link?: string | null
}

type ContentCardGridProps = {
    items: ContentCard[]
    columns?: 2 | 3 | 4
    aspectRatio?: "square" | "video" | "auto"
}

const colsClass = {
    2: "grid-cols-1 xsmall:grid-cols-2",
    3: "grid-cols-1 xsmall:grid-cols-2 medium:grid-cols-3",
    4: "grid-cols-2 xsmall:grid-cols-3 medium:grid-cols-4",
} as const

const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-[4/3]",
} as const

export default function ContentCardGrid({
    items,
    columns = 3,
    aspectRatio = "auto",
}: ContentCardGridProps) {
    if (items.length === 0) return null

    return (
        <div className={`grid ${colsClass[columns]} gap-6`}>
            {items.map((item) => {
                const card = (
                    <div className="group flex flex-col items-center text-center">
                        <div
                            className={`relative w-full ${aspectClass[aspectRatio]} bg-cream-100 border border-grey-20 rounded-sm overflow-hidden p-4`}
                        >
                            <Image
                                src={item.image_url}
                                alt={item.title}
                                fill
                                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                                className="object-contain"
                                loading="lazy"
                            />
                        </div>
                        <h3 className="font-sans text-sm font-medium text-grey-90 mt-3">
                            {item.title}
                        </h3>
                        {item.description && (
                            <p className="font-sans text-xs text-grey-50 mt-1 leading-relaxed">
                                {item.description}
                            </p>
                        )}
                    </div>
                )

                if (item.link) {
                    return (
                        <a
                            key={item.id}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity duration-200"
                        >
                            {card}
                        </a>
                    )
                }

                return (
                    <div key={item.id}>
                        {card}
                    </div>
                )
            })}
        </div>
    )
}
