import { getProductComments } from "@lib/data/comments"
import ProductCommentsClient from "./product-comments-client"
import type { ProductComment } from "@lib/data/comments"

type ProductCommentsSectionProps = {
    productId: string
}

// Format date consistently on server side to prevent hydration mismatches
const formatCommentDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date)
}

// Add formatted date to comment for client component
const addFormattedDates = (comments: ProductComment[]) => {
    return comments.map((comment) => ({
        ...comment,
        formatted_date: comment.created_at
            ? formatCommentDate(comment.created_at)
            : "",
    }))
}

const ProductCommentsSection = async ({
    productId,
}: ProductCommentsSectionProps) => {
    const data = await getProductComments(productId, { limit: 25 })

    // Format dates on server side to ensure consistency
    const commentsWithFormattedDates = addFormattedDates(data.comments)

    return (
        <section className="w-full rounded-3xl border border-ui-border-base bg-ui-bg-base shadow-sm">
            <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold text-ui-fg-base">
                        Hear from other collectors
                    </h2>
                    <p className="text-sm text-ui-fg-subtle">
                        Share styling tips, ask questions, and inspire fellow jewelry
                        lovers.
                    </p>
                </div>
                <ProductCommentsClient
                    productId={productId}
                    initialComments={commentsWithFormattedDates}
                    initialCount={data.count}
                />
            </div>
        </section>
    )
}

export default ProductCommentsSection


