"use client"

import { useState } from "react"
import type { ProductComment } from "@lib/data/comments"

// Extended type to include formatted date from server
type CommentWithFormattedDate = ProductComment & {
    formatted_date?: string
}

type ProductCommentsClientProps = {
    productId: string
    initialComments: CommentWithFormattedDate[]
    initialCount: number
}

const ProductCommentsClient = ({
    productId,
    initialComments,
    initialCount,
}: ProductCommentsClientProps) => {
    const [comments, setComments] =
        useState<CommentWithFormattedDate[]>(initialComments ?? [])
    const [count, setCount] = useState(initialCount ?? 0)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Dates are pre-formatted on the server to prevent hydration mismatches

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setError(null)
        setSuccess(null)

        if (!content.trim()) {
            setError("Please share a short comment before submitting.")
            return
        }

        if (!name.trim()) {
            setError("Please add a name so the community knows who shared.")
            return
        }

        setIsSubmitting(true)

        try {
            const payload: Record<string, string> = {
                content: content.trim(),
            }

            if (name.trim()) {
                payload.author_name = name.trim()
            }

            if (email.trim()) {
                payload.author_email = email.trim()
            }

            const response = await fetch(
                `/api/comments/${productId}`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )

            if (!response.ok) {
                const details = await response
                    .json()
                    .catch(() => ({ error: "Unable to share comment." }))
                throw new Error(
                    (details as { error?: string })?.error ||
                    "Unable to share comment."
                )
            }

            const data = await response.json()

            if (data?.comment) {
                // Format the date for the new comment to match server formatting
                const formattedComment: CommentWithFormattedDate = {
                    ...data.comment,
                    formatted_date: data.comment.created_at
                        ? new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        }).format(new Date(data.comment.created_at))
                        : "",
                }

                setComments((prev) => {
                    if (prev.some((item) => item.id === formattedComment.id)) {
                        return prev
                    }
                    return [formattedComment, ...prev]
                })
                setCount((prev) => prev + 1)
                setContent("")
                setEmail("")
                setSuccess("Thanks for sharing your thoughts!")
            }
        } catch (submissionError) {
            const message =
                submissionError instanceof Error
                    ? submissionError.message
                    : "Something went wrong. Please try again."
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-10">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="comment-name"
                            className="text-sm font-medium text-ui-fg-base"
                        >
                            Name
                        </label>
                        <input
                            id="comment-name"
                            name="name"
                            placeholder="Add your name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="rounded-xl border border-ui-border-base bg-transparent px-3 py-2 text-sm outline-none focus:border-ui-fg-base"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="comment-email"
                            className="text-sm font-medium text-ui-fg-base"
                        >
                            Email (optional)
                        </label>
                        <input
                            id="comment-email"
                            name="email"
                            type="email"
                            placeholder="We'll never share this"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="rounded-xl border border-ui-border-base bg-transparent px-3 py-2 text-sm outline-none focus:border-ui-fg-base"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="comment-content"
                        className="text-sm font-medium text-ui-fg-base"
                    >
                        Comment
                    </label>
                    <textarea
                        id="comment-content"
                        name="content"
                        placeholder="What makes this piece special to you?"
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        rows={4}
                        className="rounded-2xl border border-ui-border-base bg-transparent px-3 py-2 text-sm outline-none focus:border-ui-fg-base"
                        required
                    />
                </div>
                {error && (
                    <p className="text-sm text-rose-600" role="alert">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="text-sm text-emerald-600" role="status">
                        {success}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-ui-fg-muted">
                        Signed-in customers publish instantly. Guest comments may be
                        reviewed for safety.
                    </p>
                    <button
                        type="submit"
                        className="rounded-full bg-ui-fg-base px-6 py-2 text-sm font-semibold text-ui-bg-base transition hover:bg-ui-fg-subtle disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Sharing..." : "Post comment"}
                    </button>
                </div>
            </form>
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-ui-fg-base">
                        {count} {count === 1 ? "comment" : "comments"}
                    </h3>
                    <p className="text-sm text-ui-fg-muted">
                        We highlight genuine experiences to help collectors choose
                        confidently.
                    </p>
                </div>
                {comments.length === 0 ? (
                    <p className="text-sm text-ui-fg-muted">
                        Be the first to share styling ideas or care tips for this
                        piece.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {comments.map((comment) => (
                            <li
                                key={comment.id}
                                className="rounded-2xl border border-ui-border-base bg-ui-bg-subtle px-4 py-3"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-medium text-ui-fg-base">
                                        {comment.author_name || "Anonymous collector"}
                                    </span>
                                    <span className="text-xs text-ui-fg-muted">
                                        {comment.formatted_date || ""}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-ui-fg-base whitespace-pre-line">
                                    {comment.content}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default ProductCommentsClient


