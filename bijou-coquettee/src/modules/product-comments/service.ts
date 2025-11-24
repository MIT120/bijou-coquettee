import { MedusaService } from "@medusajs/framework/utils"
import ProductComment from "./models/product-comment"

export type CreateCommentInput = {
    product_id: string
    content: string
    customer_id?: string | null
    author_name?: string | null
    author_email?: string | null
    metadata?: Record<string, unknown> | null
}

/**
 * Product Comments Module Service
 * Handles creation and retrieval of product level comments
 */
class ProductCommentsModuleService extends MedusaService({
    ProductComment,
}) {
    /**
     * Persist a new comment and return the created entity
     */
    async createComment(input: CreateCommentInput) {
        const [comment] = await this.createProductComments([
            {
                product_id: input.product_id,
                customer_id: input.customer_id ?? null,
                author_name: input.author_name ?? null,
                author_email: input.author_email ?? null,
                content: input.content,
                metadata: input.metadata ?? null,
                status: "approved",
                is_public: true,
            },
        ])

        return comment
    }

    /**
     * List visible (approved + public) comments for a product
     */
    async listVisibleComments(productId: string, limit = 20, offset = 0) {
        return this.listAndCountProductComments(
            {
                product_id: productId,
                status: "approved",
                is_public: true,
            },
            {
                take: limit,
                skip: offset,
                order: { created_at: "DESC" },
            }
        )
    }
}

export default ProductCommentsModuleService


