import { useCallback, useEffect, useRef, useState } from "react"
import { Button, Input, Text, toast } from "@medusajs/ui"
import { Link, Photo, Spinner, XMark } from "@medusajs/icons"

type ImageUploadFieldProps = {
    value: string
    onChange: (url: string) => void
    label?: string
}

/**
 * Reusable image upload field for CMS section forms.
 *
 * Supports two input modes:
 *  - Upload mode: drag-and-drop zone or click-to-browse file picker that POSTs
 *    to the Medusa admin upload endpoint and calls onChange with the returned URL.
 *  - URL mode: plain text input for pasting an existing image URL.
 *
 * Always shows a live image preview above the input area when a URL is set.
 */
const ImageUploadField = ({ value, onChange, label }: ImageUploadFieldProps) => {
    const [mode, setMode] = useState<"upload" | "url">("upload")
    const [uploading, setUploading] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [previewError, setPreviewError] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dragCounterRef = useRef(0)

    // Reset preview error whenever the URL value changes externally
    useEffect(() => {
        setPreviewError(false)
    }, [value])

    const uploadFile = useCallback(
        async (file: File) => {
            if (!file.type.startsWith("image/")) {
                toast.error("Only image files are allowed.")
                return
            }

            setUploading(true)
            try {
                const formData = new FormData()
                formData.append("files", file)

                const response = await fetch("/admin/uploads", {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                })

                if (!response.ok) {
                    const errorBody = await response.json().catch(() => ({}))
                    throw new Error(
                        (errorBody as { message?: string }).message ||
                            `Upload failed with status ${response.status}`
                    )
                }

                const data = (await response.json()) as {
                    files: { url: string }[]
                }

                const uploadedUrl = data?.files?.[0]?.url
                if (!uploadedUrl) {
                    throw new Error("No URL returned from upload endpoint.")
                }

                onChange(uploadedUrl)
                toast.success("Image uploaded successfully.")
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Failed to upload image."
                )
            } finally {
                setUploading(false)
            }
        },
        [onChange]
    )

    // ---- Drag-and-drop handlers ----

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounterRef.current += 1
        if (dragCounterRef.current === 1) {
            setDragging(true)
        }
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounterRef.current -= 1
        if (dragCounterRef.current === 0) {
            setDragging(false)
        }
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            dragCounterRef.current = 0
            setDragging(false)

            const file = e.dataTransfer.files?.[0]
            if (file) {
                uploadFile(file)
            }
        },
        [uploadFile]
    )

    // ---- File input handler ----

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                uploadFile(file)
            }
            // Reset the input so the same file can be selected again if needed
            e.target.value = ""
        },
        [uploadFile]
    )

    const handleRemove = () => {
        onChange("")
    }

    // ---- Render ----

    return (
        <div className="space-y-2">
            {label && (
                <Text size="small" className="font-medium text-ui-fg-base">
                    {label}
                </Text>
            )}

            {/* Live image preview */}
            {value && !previewError && (
                <div className="relative inline-block">
                    <img
                        src={value}
                        alt="Preview"
                        className="max-h-40 max-w-full rounded border border-ui-border-base object-contain bg-ui-bg-subtle"
                        onError={() => setPreviewError(true)}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        title="Remove image"
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ui-bg-base border border-ui-border-base flex items-center justify-center text-ui-fg-muted hover:text-ui-fg-error hover:border-ui-border-error transition-colors shadow-elevation-card-rest"
                    >
                        <XMark style={{ width: 10, height: 10 }} />
                    </button>
                </div>
            )}

            {/* Broken URL state */}
            {value && previewError && (
                <div className="flex items-center gap-2 p-2 rounded border border-ui-border-base bg-ui-bg-subtle">
                    <Photo className="text-ui-fg-muted flex-shrink-0" />
                    <Text
                        size="xsmall"
                        className="text-ui-fg-muted font-mono truncate flex-1"
                    >
                        {value}
                    </Text>
                    <button
                        type="button"
                        onClick={handleRemove}
                        title="Remove"
                        className="flex-shrink-0 text-ui-fg-muted hover:text-ui-fg-error transition-colors"
                    >
                        <XMark style={{ width: 14, height: 14 }} />
                    </button>
                </div>
            )}

            {/* Mode toggle */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setMode("upload")}
                    className={[
                        "text-xs px-2.5 py-1 rounded border transition-colors",
                        mode === "upload"
                            ? "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-interactive font-medium"
                            : "border-ui-border-base bg-ui-bg-subtle text-ui-fg-muted hover:text-ui-fg-base hover:border-ui-border-strong",
                    ].join(" ")}
                >
                    Upload file
                </button>
                <button
                    type="button"
                    onClick={() => setMode("url")}
                    className={[
                        "text-xs px-2.5 py-1 rounded border transition-colors",
                        mode === "url"
                            ? "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-interactive font-medium"
                            : "border-ui-border-base bg-ui-bg-subtle text-ui-fg-muted hover:text-ui-fg-base hover:border-ui-border-strong",
                    ].join(" ")}
                >
                    <span className="flex items-center gap-1">
                        <Link style={{ width: 11, height: 11 }} />
                        Paste URL
                    </span>
                </button>
            </div>

            {/* Upload mode */}
            {mode === "upload" && (
                <>
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === " ") && !uploading) {
                                fileInputRef.current?.click()
                            }
                        }}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={[
                            "relative flex flex-col items-center justify-center gap-2",
                            "rounded-lg border-2 border-dashed px-6 py-8",
                            "transition-colors cursor-pointer",
                            uploading ? "cursor-not-allowed opacity-60" : "",
                            dragging
                                ? "border-ui-border-interactive bg-ui-bg-interactive-hover"
                                : "border-ui-border-base bg-ui-bg-subtle hover:border-ui-border-strong hover:bg-ui-bg-base",
                        ].join(" ")}
                    >
                        {uploading ? (
                            <>
                                <Spinner className="text-ui-fg-muted animate-spin" />
                                <Text size="small" className="text-ui-fg-muted">
                                    Uploading...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Photo className="text-ui-fg-muted" />
                                <div className="text-center">
                                    <Text size="small" className="text-ui-fg-base font-medium">
                                        {dragging
                                            ? "Drop image here"
                                            : "Drop image here or click to browse"}
                                    </Text>
                                    <Text size="xsmall" className="text-ui-fg-muted mt-0.5">
                                        PNG, JPG, WEBP, GIF, SVG accepted
                                    </Text>
                                </div>
                            </>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInputChange}
                        disabled={uploading}
                    />
                </>
            )}

            {/* URL mode */}
            {mode === "url" && (
                <div className="flex items-center gap-2">
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                    />
                    {value && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="small"
                            onClick={handleRemove}
                        >
                            <XMark />
                            Remove
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

export default ImageUploadField
