import { useCallback, useRef, useState } from "react"
import { Button, Text, toast } from "@medusajs/ui"
import { ArrowUpRightOnBox, DocumentText, Spinner, XMark } from "@medusajs/icons"

type FileUploadFieldProps = {
    value: string
    onChange: (url: string) => void
    label?: string
    /**
     * Comma-separated list of accepted file extensions or MIME types.
     * Passed directly to the <input accept> attribute.
     * Defaults to common document types.
     */
    accept?: string
}

// ---- Helpers ----

/**
 * Extracts just the filename from a URL path.
 * e.g. "https://cdn.example.com/uploads/my-document.pdf" -> "my-document.pdf"
 */
function extractFilename(url: string): string {
    try {
        const pathname = new URL(url).pathname
        const parts = pathname.split("/")
        return decodeURIComponent(parts[parts.length - 1] || url)
    } catch {
        // Fallback for relative URLs or malformed values
        const parts = url.split("/")
        return decodeURIComponent(parts[parts.length - 1] || url)
    }
}

/**
 * Returns a lowercase extension (without the dot) from a filename, or "file"
 * when no extension is found.
 */
function getExtension(filename: string): string {
    const match = filename.match(/\.([a-zA-Z0-9]+)$/)
    return match ? match[1].toLowerCase() : "file"
}

/**
 * Maps common document extensions to a display colour class and short label
 * shown inside the file icon badge.
 */
type FileTypeInfo = { label: string; colorClass: string }

function getFileTypeInfo(ext: string): FileTypeInfo {
    switch (ext) {
        case "pdf":
            return { label: "PDF", colorClass: "text-rose-600 bg-rose-50 border-rose-200" }
        case "doc":
        case "docx":
            return { label: "DOC", colorClass: "text-blue-600 bg-blue-50 border-blue-200" }
        case "xls":
        case "xlsx":
            return { label: "XLS", colorClass: "text-green-600 bg-green-50 border-green-200" }
        case "csv":
            return { label: "CSV", colorClass: "text-amber-600 bg-amber-50 border-amber-200" }
        case "ppt":
        case "pptx":
            return { label: "PPT", colorClass: "text-orange-600 bg-orange-50 border-orange-200" }
        case "zip":
        case "rar":
        case "7z":
            return { label: "ZIP", colorClass: "text-purple-600 bg-purple-50 border-purple-200" }
        default:
            return { label: ext.toUpperCase().slice(0, 4) || "FILE", colorClass: "text-ui-fg-muted bg-ui-bg-subtle border-ui-border-base" }
    }
}

// ---- File icon SVG ----

const FileIcon = ({ ext }: { ext: string }) => {
    const { label, colorClass } = getFileTypeInfo(ext)
    return (
        <div
            className={[
                "w-10 h-12 rounded border-2 flex flex-col items-center justify-end pb-1.5 flex-shrink-0 relative",
                colorClass,
            ].join(" ")}
        >
            {/* Dog-ear fold */}
            <div
                className={[
                    "absolute top-0 right-0 w-3 h-3 border-b-2 border-l-2",
                    colorClass,
                    "rounded-bl",
                ].join(" ")}
                style={{ borderTopRightRadius: "inherit" }}
            />
            <span className="text-[9px] font-bold leading-none tracking-tight">
                {label}
            </span>
        </div>
    )
}

// ---- Main component ----

const DEFAULT_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx"

const FileUploadField = ({
    value,
    onChange,
    label,
    accept = DEFAULT_ACCEPT,
}: FileUploadFieldProps) => {
    const [uploading, setUploading] = useState(false)
    const [dragging, setDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dragCounterRef = useRef(0)

    const uploadFile = useCallback(
        async (file: File) => {
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
                toast.success("File uploaded successfully.")
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Failed to upload file."
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
            // Reset so the same file can be re-selected if needed
            e.target.value = ""
        },
        [uploadFile]
    )

    const handleRemove = () => {
        onChange("")
    }

    // ---- Render ----

    const filename = value ? extractFilename(value) : ""
    const ext = filename ? getExtension(filename) : "file"

    return (
        <div className="space-y-2">
            {label && (
                <Text size="small" className="font-medium text-ui-fg-base">
                    {label}
                </Text>
            )}

            {/* Current file display */}
            {value && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
                    <FileIcon ext={ext} />

                    <div className="flex-1 min-w-0">
                        <Text
                            size="small"
                            className="font-medium text-ui-fg-base truncate block"
                            title={filename}
                        >
                            {filename}
                        </Text>
                        <Text size="xsmall" className="text-ui-fg-muted font-mono truncate block">
                            {value}
                        </Text>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open file in new tab"
                            className="flex items-center gap-1 text-xs text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors"
                        >
                            <ArrowUpRightOnBox style={{ width: 14, height: 14 }} />
                            Open
                        </a>
                        <Button
                            type="button"
                            variant="secondary"
                            size="small"
                            onClick={handleRemove}
                        >
                            <XMark />
                            Remove
                        </Button>
                    </div>
                </div>
            )}

            {/* Upload zone */}
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
                    "flex flex-col items-center justify-center gap-2",
                    "rounded-lg border-2 border-dashed px-6 py-6",
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
                        <DocumentText className="text-ui-fg-muted" />
                        <div className="text-center">
                            <Text size="small" className="text-ui-fg-base font-medium">
                                {dragging
                                    ? "Drop file here"
                                    : value
                                    ? "Drop a new file to replace"
                                    : "Drop file here or click to browse"}
                            </Text>
                            <Text size="xsmall" className="text-ui-fg-muted mt-0.5">
                                {accept
                                    .split(",")
                                    .map((a) => a.trim().replace(/^\./, "").toUpperCase())
                                    .join(", ")}
                            </Text>
                        </div>
                    </>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileInputChange}
                disabled={uploading}
            />
        </div>
    )
}

export default FileUploadField
