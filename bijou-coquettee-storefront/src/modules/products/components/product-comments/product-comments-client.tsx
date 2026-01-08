"use client"

import { useState } from "react"
import type { ProductComment } from "@lib/data/comments"
import { clx } from "@medusajs/ui"

// Extended type to include formatted date from server
type CommentWithFormattedDate = ProductComment & {
    formatted_date?: string
}

type ProductCommentsClientProps = {
    productId: string
    initialComments: CommentWithFormattedDate[]
    initialCount: number
}

// Comment icon component
const CommentIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
        />
    </svg>
)

// Chevron icon for expand/collapse
const ChevronIcon = ({ isExpanded, className }: { isExpanded: boolean; className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={clx("w-4 h-4 transition-transform duration-200", className, {
            "rotate-180": isExpanded,
        })}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
)

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
    const [isExpanded, setIsExpanded] = useState(false)
    const [showForm, setShowForm] = useState(false)

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
                setName("")
                setSuccess("Thanks for sharing your thoughts!")
                setShowForm(false)
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
        <div className="flex flex-col">
            {/* Header with toggle button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full py-2 group"
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-ui-bg-subtle border border-ui-border-base group-hover:border-ui-fg-muted transition-colors">
                        <CommentIcon className="w-5 h-5 text-ui-fg-subtle" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-ui-fg-base">
                            {count} {count === 1 ? "Review" : "Reviews"}
                        </span>
                        <span className="text-xs text-ui-fg-muted">
                            {isExpanded ? "Click to collapse" : "Click to view"}
                        </span>
                    </div>
                </div>
                <ChevronIcon isExpanded={isExpanded} />
            </button>

            {/* Expandable content */}
            <div
                className={clx(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    {
                        "max-h-0 opacity-0": !isExpanded,
                        "max-h-[2000px] opacity-100": isExpanded,
                    }
                )}
            >
                <div className="pt-4 flex flex-col gap-6">
                    {/* Write a review button */}
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-dashed border-ui-border-base text-sm font-medium text-ui-fg-subtle hover:border-ui-fg-muted hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-all"
                        >
                            <CommentIcon className="w-4 h-4" />
                            Write a review
                        </button>
                    )}

                    {/* Comment form */}
                    {showForm && (
                        <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-ui-fg-base">Share your thoughts</h4>
                                <button
                                    onClick={() => {
                                        setShowForm(false)
                                        setError(null)
                                        setSuccess(null)
                                    }}
                                    className="text-ui-fg-muted hover:text-ui-fg-base text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
                                    <input
                                        id="comment-name"
                                        name="name"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        className="rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-sm outline-none focus:border-ui-fg-base"
                                        required
                                    />
                                    <input
                                        id="comment-email"
                                        name="email"
                                        type="email"
                                        placeholder="Email (optional)"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-sm outline-none focus:border-ui-fg-base"
                                    />
                                </div>
                                <textarea
                                    id="comment-content"
                                    name="content"
                                    placeholder="What makes this piece special to you?"
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                    rows={3}
                                    className="rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-sm outline-none focus:border-ui-fg-base resize-none"
                                    required
                                />
                                {error && (
                                    <p className="text-xs text-rose-600" role="alert">
                                        {error}
                                    </p>
                                )}
                                {success && (
                                    <p className="text-xs text-emerald-600" role="status">
                                        {success}
                                    </p>
                                )}
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-xs text-ui-fg-muted hidden small:block">
                                        Guest comments may be reviewed.
                                    </p>
                                    <button
                                        type="submit"
                                        className="rounded-full bg-ui-fg-base px-5 py-2 text-sm font-medium text-ui-bg-base transition hover:bg-ui-fg-subtle disabled:cursor-not-allowed disabled:opacity-70 ml-auto"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Posting..." : "Post"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Comments list */}
                    <div className="flex flex-col gap-3">
                        {comments.length === 0 ? (
                            <p className="text-sm text-ui-fg-muted text-center py-4">
                                Be the first to share your experience with this piece.
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {comments.map((comment) => (
                                    <li
                                        key={comment.id}
                                        className="rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 py-3"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-sm font-medium text-ui-fg-base">
                                                {comment.author_name || "Anonymous"}
                                            </span>
                                            <span className="text-xs text-ui-fg-muted">
                                                {comment.formatted_date || ""}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-sm text-ui-fg-subtle whitespace-pre-line">
                                            {comment.content}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCommentsClient


