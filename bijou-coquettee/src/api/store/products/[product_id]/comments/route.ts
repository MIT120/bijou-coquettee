import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ProductCommentsModuleService from "../../../../../modules/product-comments/service"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

type CommentResponse = {
    id: string
    product_id: string
    author_name: string | null
    content: string
    created_at: string
}

const sanitizeComment = (comment: any): CommentResponse => ({
    id: comment.id,
    product_id: comment.product_id,
    author_name: comment.author_name,
    content: comment.content,
    created_at:
        typeof comment.created_at === "string"
            ? comment.created_at
            : comment.created_at?.toISOString?.() ?? "",
})

const parseNumberParam = (value: string | string[] | undefined, fallback: number) => {
    const raw = Array.isArray(value) ? value[0] : value
    const parsed = parseInt(raw ?? "", 10)

    if (Number.isNaN(parsed)) {
        return fallback
    }

    return parsed
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const productId = req.params.product_id

        if (!productId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "product_id parameter is required",
            })
        }

        const limitParam = parseNumberParam(req.query.limit as any, DEFAULT_LIMIT)
        const offsetParam = parseNumberParam(req.query.offset as any, 0)

        const limit = Math.min(Math.max(limitParam, 1), MAX_LIMIT)
        const offset = Math.max(offsetParam, 0)

        const commentsService =
            req.scope.resolve<ProductCommentsModuleService>("productCommentsModule")

        const [comments, count] = await commentsService.listVisibleComments(
            productId,
            limit,
            offset
        )

        return res.json({
            comments: comments.map(sanitizeComment),
            count,
            limit,
            offset,
        })
    } catch (error) {
        console.error("Error fetching product comments:", error)
        return res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to fetch product comments",
        })
    }
}

type CreateCommentBody = {
    content?: string
    author_name?: string
    author_email?: string
    metadata?: Record<string, unknown>
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const productId = req.params.product_id

        if (!productId) {
            return res.status(400).json({
                error: "Bad Request",
                message: "product_id parameter is required",
            })
        }

        const { content, author_name, author_email, metadata } =
            (req.body as CreateCommentBody) || {}

        const trimmedContent = content?.trim()

        if (!trimmedContent) {
            return res.status(400).json({
                error: "Bad Request",
                message: "content is required",
            })
        }

        const customerId = (req as any).auth_context?.actor_id ?? null

        if (!customerId && !author_name) {
            return res.status(400).json({
                error: "Bad Request",
                message: "author_name is required for guest comments",
            })
        }

        const commentsService =
            req.scope.resolve<ProductCommentsModuleService>("productCommentsModule")

        const comment = await commentsService.createComment({
            product_id: productId,
            content: trimmedContent,
            customer_id: customerId,
            author_name: author_name ?? null,
            author_email: author_email ?? null,
            metadata: metadata ?? null,
        })

        return res.status(201).json({
            comment: sanitizeComment(comment),
        })
    } catch (error) {
        console.error("Error creating product comment:", error)
        return res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to create product comment",
        })
    }
}


