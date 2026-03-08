import { useEffect, useState } from "react"

type ImagePreviewProps = {
    url: string
    size?: number
}

/**
 * Renders a small image thumbnail. Falls back to a placeholder landscape icon
 * when the URL is empty or the image fails to load. The error state resets
 * automatically whenever `url` changes so a new URL is always attempted.
 */
const ImagePreview = ({ url, size = 48 }: ImagePreviewProps) => {
    const [error, setError] = useState(false)

    useEffect(() => {
        setError(false)
    }, [url])

    if (!url || error) {
        return (
            <div
                style={{ width: size, height: size, minWidth: size }}
                className="rounded bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center text-ui-fg-muted flex-shrink-0"
            >
                {/* Landscape / photo placeholder icon */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    style={{ width: size * 0.4, height: size * 0.4 }}
                >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <circle cx="8.5" cy="10.5" r="1.5" />
                    <path
                        d="M21 15l-5-5L5 20"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        )
    }

    return (
        <img
            src={url}
            alt=""
            style={{ width: size, height: size, minWidth: size }}
            className="rounded object-cover border border-ui-border-base flex-shrink-0"
            onError={() => setError(true)}
        />
    )
}

export default ImagePreview
