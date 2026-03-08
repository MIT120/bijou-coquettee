import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import {
    Container,
    Heading,
    Text,
    Badge,
    Button,
    Input,
    Table,
    IconButton,
    DropdownMenu,
    Label,
    Textarea,
    toast,
    Select,
} from "@medusajs/ui"
import {
    ArrowUpMini,
    ArrowDownMini,
    Plus,
    EllipsisHorizontal,
    PencilSquare,
    Trash,
    CheckCircle,
    XCircle,
    ArrowLongLeft,
} from "@medusajs/icons"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CmsPage = {
    id: string
    slug: string
    title: string
    seo_title: string | null
    seo_description: string | null
    seo_image: string | null
    is_published: boolean
    created_at: string
    updated_at: string
}

type PageSection = {
    id: string
    page_slug: string
    type: string
    content: Record<string, unknown>
    sort_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

type GalleryImage = {
    image_url: string
    alt: string
    caption: string
}

type Stat = {
    value: string
    label: string
}

type TeamMember = {
    name: string
    role: string
    image_url: string
    bio: string
}

// ---------------------------------------------------------------------------
// Section type metadata
// ---------------------------------------------------------------------------

const SECTION_TYPES = [
    {
        value: "hero",
        label: "Hero Banner",
        description: "Full-width image with heading, subheading, and CTA button.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
                <path d="M7 10h10M7 13h6" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        value: "rich_text",
        label: "Rich Text",
        description: "Heading, body HTML, and optional alignment controls.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path d="M4 6h16M4 10h16M4 14h10M4 18h6" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        value: "image_text",
        label: "Image + Text",
        description: "Side-by-side image and text block with optional CTA.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <rect x="2" y="4" width="9" height="16" rx="1.5" />
                <path d="M15 7h6M15 11h6M15 15h4" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        value: "gallery",
        label: "Gallery",
        description: "Image grid with optional headings, alt text, and captions.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <rect x="2" y="2" width="9" height="9" rx="1.5" />
                <rect x="13" y="2" width="9" height="9" rx="1.5" />
                <rect x="2" y="13" width="9" height="9" rx="1.5" />
                <rect x="13" y="13" width="9" height="9" rx="1.5" />
            </svg>
        ),
    },
    {
        value: "stats",
        label: "Stats / Numbers",
        description: "Showcase key numbers or metrics in a highlighted row.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <path d="M3 17l4-8 4 5 3-3 4 6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 21h18" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        value: "team",
        label: "Team Members",
        description: "Grid of team member cards with photo, name, role, and bio.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <circle cx="9" cy="7" r="3" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M2 21c0-3.3 3.1-6 7-6s7 2.7 7 6" />
                <path d="M16 17c1-.6 2.5-.9 3-.9 2.2 0 4 1.6 4 3.9" />
            </svg>
        ),
    },
    {
        value: "cta",
        label: "Call to Action",
        description: "Prominent CTA block with heading, description, and button.",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                <rect x="2" y="7" width="20" height="10" rx="2" />
                <path d="M9 12h6M12 9v6" strokeLinecap="round" />
            </svg>
        ),
    },
]

const SECTION_TYPE_MAP = Object.fromEntries(SECTION_TYPES.map((t) => [t.value, t]))

// ---------------------------------------------------------------------------
// Small reusable components
// ---------------------------------------------------------------------------

const ImagePreview = ({ url, size = 48 }: { url: string; size?: number }) => {
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: size * 0.4, height: size * 0.4 }}>
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <circle cx="8.5" cy="10.5" r="1.5" />
                    <path d="M21 15l-5-5L5 20" strokeLinecap="round" strokeLinejoin="round" />
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

// ---------------------------------------------------------------------------
// Visual Section Type Picker
// ---------------------------------------------------------------------------

const SectionTypePicker = ({
    selected,
    onSelect,
}: {
    selected: string
    onSelect: (value: string) => void
}) => {
    return (
        <div className="grid grid-cols-2 gap-3">
            {SECTION_TYPES.map((type) => {
                const isSelected = selected === type.value
                return (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => onSelect(type.value)}
                        className={[
                            "text-left rounded-lg border p-3 transition-all cursor-pointer",
                            "flex items-start gap-3",
                            isSelected
                                ? "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-interactive"
                                : "border-ui-border-base bg-ui-bg-subtle hover:border-ui-border-strong hover:bg-ui-bg-base",
                        ].join(" ")}
                    >
                        <span
                            className={[
                                "mt-0.5 flex-shrink-0",
                                isSelected ? "text-ui-fg-interactive" : "text-ui-fg-muted",
                            ].join(" ")}
                        >
                            {type.icon}
                        </span>
                        <span className="min-w-0">
                            <span
                                className={[
                                    "block text-sm font-medium leading-tight",
                                    isSelected ? "text-ui-fg-interactive" : "text-ui-fg-base",
                                ].join(" ")}
                            >
                                {type.label}
                            </span>
                            <span className="block text-xs text-ui-fg-muted mt-0.5 leading-snug">
                                {type.description}
                            </span>
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Gallery section builder
// ---------------------------------------------------------------------------

const GalleryBuilder = ({
    images,
    onChange,
}: {
    images: GalleryImage[]
    onChange: (images: GalleryImage[]) => void
}) => {
    const addImage = () => {
        onChange([...images, { image_url: "", alt: "", caption: "" }])
    }

    const updateImage = (index: number, field: keyof GalleryImage, value: string) => {
        const updated = images.map((img, i) =>
            i === index ? { ...img, [field]: value } : img
        )
        onChange(updated)
    }

    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index))
    }

    const moveUp = (index: number) => {
        if (index === 0) return
        const updated = [...images]
        ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
        onChange(updated)
    }

    const moveDown = (index: number) => {
        if (index === images.length - 1) return
        const updated = [...images]
        ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
        onChange(updated)
    }

    return (
        <div className="space-y-3">
            {images.length === 0 && (
                <div className="rounded-lg border border-dashed border-ui-border-base bg-ui-bg-subtle py-6 text-center">
                    <Text size="small" className="text-ui-fg-muted">
                        No images yet. Click "Add Image" to get started.
                    </Text>
                </div>
            )}
            {images.map((img, index) => (
                <div
                    key={index}
                    className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4 space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <Text size="small" className="font-medium text-ui-fg-base">
                            Image {index + 1}
                        </Text>
                        <div className="flex items-center gap-1">
                            <IconButton
                                size="small"
                                variant="transparent"
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                type="button"
                            >
                                <ArrowUpMini />
                            </IconButton>
                            <IconButton
                                size="small"
                                variant="transparent"
                                onClick={() => moveDown(index)}
                                disabled={index === images.length - 1}
                                type="button"
                            >
                                <ArrowDownMini />
                            </IconButton>
                            <IconButton
                                size="small"
                                variant="transparent"
                                onClick={() => removeImage(index)}
                                type="button"
                                className="text-ui-fg-error"
                            >
                                <Trash />
                            </IconButton>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ImagePreview url={img.image_url} size={64} />
                        <div className="flex-1 space-y-2">
                            <div>
                                <Label>Image URL *</Label>
                                <Input
                                    value={img.image_url}
                                    onChange={(e) => updateImage(index, "image_url", e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Alt Text</Label>
                            <Input
                                value={img.alt}
                                onChange={(e) => updateImage(index, "alt", e.target.value)}
                                placeholder="Describe the image"
                            />
                        </div>
                        <div>
                            <Label>Caption</Label>
                            <Input
                                value={img.caption}
                                onChange={(e) => updateImage(index, "caption", e.target.value)}
                                placeholder="Optional caption"
                            />
                        </div>
                    </div>
                </div>
            ))}
            <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={addImage}
            >
                <Plus />
                Add Image
            </Button>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Stats section builder
// ---------------------------------------------------------------------------

const StatsBuilder = ({
    stats,
    onChange,
}: {
    stats: Stat[]
    onChange: (stats: Stat[]) => void
}) => {
    const addStat = () => {
        onChange([...stats, { value: "", label: "" }])
    }

    const updateStat = (index: number, field: keyof Stat, value: string) => {
        const updated = stats.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
        )
        onChange(updated)
    }

    const removeStat = (index: number) => {
        onChange(stats.filter((_, i) => i !== index))
    }

    const moveUp = (index: number) => {
        if (index === 0) return
        const updated = [...stats]
        ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
        onChange(updated)
    }

    const moveDown = (index: number) => {
        if (index === stats.length - 1) return
        const updated = [...stats]
        ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
        onChange(updated)
    }

    return (
        <div className="space-y-3">
            {stats.length === 0 && (
                <div className="rounded-lg border border-dashed border-ui-border-base bg-ui-bg-subtle py-6 text-center">
                    <Text size="small" className="text-ui-fg-muted">
                        No stats yet. Click "Add Stat" to get started.
                    </Text>
                </div>
            )}
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3 flex items-center gap-3"
                >
                    <div className="flex flex-col gap-1">
                        <IconButton
                            size="small"
                            variant="transparent"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            type="button"
                        >
                            <ArrowUpMini />
                        </IconButton>
                        <IconButton
                            size="small"
                            variant="transparent"
                            onClick={() => moveDown(index)}
                            disabled={index === stats.length - 1}
                            type="button"
                        >
                            <ArrowDownMini />
                        </IconButton>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                            <Label>Value *</Label>
                            <Input
                                value={stat.value}
                                onChange={(e) => updateStat(index, "value", e.target.value)}
                                placeholder="500+"
                            />
                        </div>
                        <div>
                            <Label>Label *</Label>
                            <Input
                                value={stat.label}
                                onChange={(e) => updateStat(index, "label", e.target.value)}
                                placeholder="Pieces Crafted"
                            />
                        </div>
                    </div>
                    <IconButton
                        size="small"
                        variant="transparent"
                        onClick={() => removeStat(index)}
                        type="button"
                        className="text-ui-fg-error flex-shrink-0"
                    >
                        <Trash />
                    </IconButton>
                </div>
            ))}
            <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={addStat}
            >
                <Plus />
                Add Stat
            </Button>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Team section builder
// ---------------------------------------------------------------------------

const TeamBuilder = ({
    members,
    onChange,
}: {
    members: TeamMember[]
    onChange: (members: TeamMember[]) => void
}) => {
    const addMember = () => {
        onChange([...members, { name: "", role: "", image_url: "", bio: "" }])
    }

    const updateMember = (index: number, field: keyof TeamMember, value: string) => {
        const updated = members.map((m, i) =>
            i === index ? { ...m, [field]: value } : m
        )
        onChange(updated)
    }

    const removeMember = (index: number) => {
        onChange(members.filter((_, i) => i !== index))
    }

    const moveUp = (index: number) => {
        if (index === 0) return
        const updated = [...members]
        ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
        onChange(updated)
    }

    const moveDown = (index: number) => {
        if (index === members.length - 1) return
        const updated = [...members]
        ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
        onChange(updated)
    }

    return (
        <div className="space-y-3">
            {members.length === 0 && (
                <div className="rounded-lg border border-dashed border-ui-border-base bg-ui-bg-subtle py-6 text-center">
                    <Text size="small" className="text-ui-fg-muted">
                        No team members yet. Click "Add Member" to get started.
                    </Text>
                </div>
            )}
            {members.map((member, index) => (
                <div
                    key={index}
                    className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4 space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <Text size="small" className="font-medium text-ui-fg-base">
                            {member.name || `Member ${index + 1}`}
                        </Text>
                        <div className="flex items-center gap-1">
                            <IconButton
                                size="small"
                                variant="transparent"
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                type="button"
                            >
                                <ArrowUpMini />
                            </IconButton>
                            <IconButton
                                size="small"
                                variant="transparent"
                                onClick={() => moveDown(index)}
                                disabled={index === members.length - 1}
                                type="button"
                            >
                                <ArrowDownMini />
                            </IconButton>
                            <IconButton
                                size="small"
                                variant="transparent"
                                onClick={() => removeMember(index)}
                                type="button"
                                className="text-ui-fg-error"
                            >
                                <Trash />
                            </IconButton>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ImagePreview url={member.image_url} size={72} />
                        <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Name *</Label>
                                    <Input
                                        value={member.name}
                                        onChange={(e) => updateMember(index, "name", e.target.value)}
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                    <Label>Role *</Label>
                                    <Input
                                        value={member.role}
                                        onChange={(e) => updateMember(index, "role", e.target.value)}
                                        placeholder="Founder"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Photo URL</Label>
                                <Input
                                    value={member.image_url}
                                    onChange={(e) => updateMember(index, "image_url", e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label>Bio</Label>
                        <Textarea
                            value={member.bio}
                            onChange={(e) => updateMember(index, "bio", e.target.value)}
                            placeholder="A short bio..."
                            rows={2}
                        />
                    </div>
                </div>
            ))}
            <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={addMember}
            >
                <Plus />
                Add Member
            </Button>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Content fields per section type
// ---------------------------------------------------------------------------

const ContentFields = ({
    type,
    content,
    onChange,
}: {
    type: string
    content: Record<string, unknown>
    onChange: (content: Record<string, unknown>) => void
}) => {
    const update = (key: string, value: unknown) => {
        onChange({ ...content, [key]: value })
    }

    switch (type) {
        case "hero":
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Image URL *</Label>
                        <div className="flex items-center gap-3 mt-1">
                            <ImagePreview url={(content.image_url as string) || ""} size={64} />
                            <Input
                                value={(content.image_url as string) || ""}
                                onChange={(e) => update("image_url", e.target.value)}
                                placeholder="https://..."
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Heading *</Label>
                        <Input
                            value={(content.heading as string) || ""}
                            onChange={(e) => update("heading", e.target.value)}
                            placeholder="Main hero heading"
                        />
                    </div>
                    <div>
                        <Label>Subheading</Label>
                        <Input
                            value={(content.subheading as string) || ""}
                            onChange={(e) => update("subheading", e.target.value)}
                            placeholder="Small uppercase label above heading"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Overlay Color</Label>
                            <Input
                                value={(content.overlay_color as string) || ""}
                                onChange={(e) => update("overlay_color", e.target.value)}
                                placeholder="rgba(0,0,0,0.4)"
                            />
                        </div>
                        <div>
                            <Label>Overlay Opacity (0-100)</Label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={(content.overlay_opacity as number) ?? 40}
                                onChange={(e) =>
                                    update("overlay_opacity", parseInt(e.target.value) || 0)
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>CTA Text</Label>
                            <Input
                                value={(content.cta_text as string) || ""}
                                onChange={(e) => update("cta_text", e.target.value)}
                                placeholder="Shop Now"
                            />
                        </div>
                        <div>
                            <Label>CTA Link</Label>
                            <Input
                                value={(content.cta_link as string) || ""}
                                onChange={(e) => update("cta_link", e.target.value)}
                                placeholder="/collections/new"
                            />
                        </div>
                    </div>
                </div>
            )

        case "rich_text":
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Label (small uppercase)</Label>
                        <Input
                            value={(content.label as string) || ""}
                            onChange={(e) => update("label", e.target.value)}
                            placeholder="Our Story"
                        />
                    </div>
                    <div>
                        <Label>Heading *</Label>
                        <Input
                            value={(content.heading as string) || ""}
                            onChange={(e) => update("heading", e.target.value)}
                            placeholder="Section heading"
                        />
                    </div>
                    <div>
                        <Label>Body (HTML) *</Label>
                        <Textarea
                            value={(content.body as string) || ""}
                            onChange={(e) => update("body", e.target.value)}
                            placeholder="<p>Your content here...</p>"
                            rows={6}
                        />
                        <Text size="xsmall" className="text-ui-fg-muted mt-1">
                            Supports HTML: &lt;p&gt;, &lt;strong&gt;, &lt;a&gt;, &lt;ul&gt;, &lt;ol&gt;
                        </Text>
                    </div>
                    <div>
                        <Label>Alignment</Label>
                        <Select
                            value={(content.alignment as string) || "center"}
                            onValueChange={(v) => update("alignment", v)}
                        >
                            <Select.Trigger>
                                <Select.Value />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="left">Left</Select.Item>
                                <Select.Item value="center">Center</Select.Item>
                                <Select.Item value="right">Right</Select.Item>
                            </Select.Content>
                        </Select>
                    </div>
                </div>
            )

        case "image_text":
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Image URL *</Label>
                        <div className="flex items-center gap-3 mt-1">
                            <ImagePreview url={(content.image_url as string) || ""} size={64} />
                            <Input
                                value={(content.image_url as string) || ""}
                                onChange={(e) => update("image_url", e.target.value)}
                                placeholder="https://..."
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Image Alt Text</Label>
                        <Input
                            value={(content.image_alt as string) || ""}
                            onChange={(e) => update("image_alt", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Heading *</Label>
                        <Input
                            value={(content.heading as string) || ""}
                            onChange={(e) => update("heading", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Body Text *</Label>
                        <Textarea
                            value={(content.body as string) || ""}
                            onChange={(e) => update("body", e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div>
                        <Label>Layout</Label>
                        <Select
                            value={(content.layout as string) || "image_left"}
                            onValueChange={(v) => update("layout", v)}
                        >
                            <Select.Trigger>
                                <Select.Value />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="image_left">Image Left</Select.Item>
                                <Select.Item value="image_right">Image Right</Select.Item>
                            </Select.Content>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>CTA Text</Label>
                            <Input
                                value={(content.cta_text as string) || ""}
                                onChange={(e) => update("cta_text", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>CTA Link</Label>
                            <Input
                                value={(content.cta_link as string) || ""}
                                onChange={(e) => update("cta_link", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )

        case "gallery": {
            const rawImages = (content.images as GalleryImage[]) || []
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Heading</Label>
                        <Input
                            value={(content.heading as string) || ""}
                            onChange={(e) => update("heading", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Columns</Label>
                        <Select
                            value={String((content.columns as number) || 3)}
                            onValueChange={(v) => update("columns", parseInt(v))}
                        >
                            <Select.Trigger>
                                <Select.Value />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="2">2 Columns</Select.Item>
                                <Select.Item value="3">3 Columns</Select.Item>
                                <Select.Item value="4">4 Columns</Select.Item>
                            </Select.Content>
                        </Select>
                    </div>
                    <div>
                        <Label className="mb-2 block">Images</Label>
                        <GalleryBuilder
                            images={rawImages}
                            onChange={(images) => update("images", images)}
                        />
                    </div>
                </div>
            )
        }

        case "stats": {
            const rawStats = (content.stats as Stat[]) || []
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Heading</Label>
                        <Input
                            value={(content.heading as string) || ""}
                            onChange={(e) => update("heading", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block">Stats</Label>
                        <StatsBuilder
                            stats={rawStats}
                            onChange={(stats) => update("stats", stats)}
                        />
                    </div>
                </div>
            )
        }

        case "team": {
            const rawMembers = (content.members as TeamMember[]) || []
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Heading</Label>
                        <Input
                            value={(content.heading as string) || ""}
                            onChange={(e) => update("heading", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block">Team Members</Label>
                        <TeamBuilder
                            members={rawMembers}
                            onChange={(members) => update("members", members)}
                        />
                    </div>
                </div>
            )
        }

        case "cta":
            return (
                <div className="space-y-4">
                    <div>
                        <Label>Heading *</Label>
                        <Input
                            value={(content.heading as string) || ""}
                            onChange={(e) => update("heading", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={(content.description as string) || ""}
                            onChange={(e) => update("description", e.target.value)}
                            rows={2}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Button Text *</Label>
                            <Input
                                value={(content.button_text as string) || ""}
                                onChange={(e) => update("button_text", e.target.value)}
                                placeholder="Shop Now"
                            />
                        </div>
                        <div>
                            <Label>Button Link *</Label>
                            <Input
                                value={(content.button_link as string) || ""}
                                onChange={(e) => update("button_link", e.target.value)}
                                placeholder="/store"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Background Color</Label>
                        <Input
                            value={(content.background_color as string) || ""}
                            onChange={(e) => update("background_color", e.target.value)}
                            placeholder="#f9f5f0"
                        />
                    </div>
                </div>
            )

        default:
            return (
                <div>
                    <Label>Content (JSON)</Label>
                    <Textarea
                        value={JSON.stringify(content, null, 2)}
                        onChange={(e) => {
                            try {
                                onChange(JSON.parse(e.target.value))
                            } catch {
                                // Allow invalid JSON while typing
                            }
                        }}
                        rows={10}
                    />
                </div>
            )
    }
}

// ---------------------------------------------------------------------------
// Section form modal
// ---------------------------------------------------------------------------

const SectionFormModal = ({
    isOpen,
    onClose,
    section,
    slug,
    onSave,
    nextSortOrder,
    initialType,
}: {
    isOpen: boolean
    onClose: () => void
    section: PageSection | null
    slug: string
    onSave: () => void
    nextSortOrder: number
    initialType?: string
}) => {
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState("rich_text")
    const [content, setContent] = useState<Record<string, unknown>>({})
    const [sortOrder, setSortOrder] = useState(0)
    const [isActive, setIsActive] = useState(true)
    const [step, setStep] = useState<"pick_type" | "fill_content">(
        section ? "fill_content" : "pick_type"
    )

    useEffect(() => {
        if (section) {
            setType(section.type)
            setContent(section.content || {})
            setSortOrder(section.sort_order)
            setIsActive(section.is_active)
            setStep("fill_content")
        } else {
            setType(initialType || "rich_text")
            setContent({})
            setSortOrder(nextSortOrder)
            setIsActive(true)
            setStep(initialType ? "fill_content" : "pick_type")
        }
    }, [section, isOpen, nextSortOrder, initialType])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = section
                ? `/admin/cms-pages/${slug}/sections/${section.id}`
                : `/admin/cms-pages/${slug}/sections`
            const method = section ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    type,
                    content,
                    sort_order: sortOrder,
                    is_active: isActive,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to save section")
            }

            toast.success(section ? "Section updated" : "Section created")
            onSave()
            onClose()
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to save section"
            )
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const selectedTypeInfo = SECTION_TYPE_MAP[type]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-ui-bg-overlay"
                onClick={onClose}
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            />
            <div className="relative bg-ui-bg-base text-ui-fg-base border border-ui-border-base shadow-elevation-modal rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col">
                {/* Modal header */}
                <div className="flex-shrink-0 border-b border-ui-border-base px-6 py-4 flex items-center justify-between">
                    <div>
                        <Heading level="h2">
                            {section ? "Edit Section" : step === "pick_type" ? "Choose Section Type" : "Configure Section"}
                        </Heading>
                        {!section && step === "fill_content" && selectedTypeInfo && (
                            <Text size="small" className="text-ui-fg-muted mt-0.5">
                                {selectedTypeInfo.label} — {selectedTypeInfo.description}
                            </Text>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-ui-fg-muted hover:text-ui-fg-base transition-colors w-8 h-8 flex items-center justify-center rounded-md hover:bg-ui-bg-subtle"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Modal body */}
                <div className="flex-1 overflow-y-auto">
                    {/* Step 1: Pick type (new sections only) */}
                    {!section && step === "pick_type" && (
                        <div className="p-6 space-y-4">
                            <Text size="small" className="text-ui-fg-muted">
                                Select the type of content block to add to this page.
                            </Text>
                            <SectionTypePicker
                                selected={type}
                                onSelect={(v) => setType(v)}
                            />
                            <div className="flex justify-end pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setStep("fill_content")}
                                >
                                    Continue
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 ml-1">
                                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Fill content */}
                    {(section || step === "fill_content") && (
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Type indicator for editing */}
                            {section && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-ui-bg-subtle border border-ui-border-base">
                                    <span className="text-ui-fg-muted">
                                        {selectedTypeInfo?.icon}
                                    </span>
                                    <div>
                                        <Text size="small" className="font-medium text-ui-fg-base">
                                            {selectedTypeInfo?.label || type}
                                        </Text>
                                        <Text size="xsmall" className="text-ui-fg-muted">
                                            {selectedTypeInfo?.description}
                                        </Text>
                                    </div>
                                    <Badge color="blue" className="ml-auto flex-shrink-0">
                                        {type}
                                    </Badge>
                                </div>
                            )}

                            {/* Sort order and active toggle */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Sort Order</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={sortOrder}
                                        onChange={(e) =>
                                            setSortOrder(parseInt(e.target.value) || 0)
                                        }
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <label className="flex items-center gap-2 cursor-pointer pb-1">
                                        <div
                                            role="checkbox"
                                            aria-checked={isActive}
                                            onClick={() => setIsActive(!isActive)}
                                            className={[
                                                "w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center px-1",
                                                isActive ? "bg-ui-bg-interactive" : "bg-ui-border-strong",
                                            ].join(" ")}
                                        >
                                            <div
                                                className={[
                                                    "w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                                                    isActive ? "translate-x-4" : "translate-x-0",
                                                ].join(" ")}
                                            />
                                        </div>
                                        <Text size="small" className="text-ui-fg-base select-none">
                                            {isActive ? "Active" : "Inactive"}
                                        </Text>
                                    </label>
                                </div>
                            </div>

                            {/* Content fields */}
                            <div className="border-t border-ui-border-base pt-5">
                                <Text className="font-medium text-ui-fg-base mb-4">Content</Text>
                                <ContentFields
                                    type={type}
                                    content={content}
                                    onChange={setContent}
                                />
                            </div>

                            {/* Footer buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-ui-border-base">
                                <div>
                                    {!section && (
                                        <Button
                                            type="button"
                                            variant="transparent"
                                            size="small"
                                            onClick={() => setStep("pick_type")}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 mr-1">
                                                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Change Type
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" isLoading={loading}>
                                        {section ? "Update Section" : "Add Section"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

const EmptyState = ({ onAdd, onQuickAdd }: { onAdd: () => void; onQuickAdd: (type: string) => void }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-xl bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center mb-4 text-ui-fg-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M12 8v8M8 12h8" strokeLinecap="round" />
                </svg>
            </div>
            <Heading level="h3" className="mb-2">
                No sections yet
            </Heading>
            <Text className="text-ui-fg-muted mb-8 max-w-sm">
                Build this page by adding content blocks. Choose from heroes, text, galleries, and more.
            </Text>

            <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-lg">
                {SECTION_TYPES.slice(0, 6).map((type) => (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => onQuickAdd(type.value)}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle hover:border-ui-border-strong hover:bg-ui-bg-base transition-all text-center cursor-pointer"
                    >
                        <span className="text-ui-fg-muted">{type.icon}</span>
                        <span className="text-xs font-medium text-ui-fg-base leading-tight">
                            {type.label}
                        </span>
                    </button>
                ))}
            </div>

            <Button onClick={onAdd}>
                <Plus />
                Add First Section
            </Button>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Rich content preview for table
// ---------------------------------------------------------------------------

function getContentPreview(section: PageSection): React.ReactNode {
    const c = section.content
    switch (section.type) {
        case "hero":
        case "image_text": {
            const heading = (c.heading as string) || ""
            const imageUrl = (c.image_url as string) || ""
            return (
                <div className="flex items-center gap-2">
                    {imageUrl && <ImagePreview url={imageUrl} size={32} />}
                    <span className="truncate text-sm text-ui-fg-base">
                        {heading || (section.type === "hero" ? "Hero section" : "Image + text section")}
                    </span>
                </div>
            )
        }
        case "rich_text":
            return (
                <span className="truncate text-sm text-ui-fg-base">
                    {(c.heading as string) || "Rich text section"}
                </span>
            )
        case "gallery": {
            const images = (c.images as GalleryImage[]) || []
            const previews = images.slice(0, 3)
            return (
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {previews.map((img, i) => (
                            <ImagePreview key={i} url={img.image_url} size={28} />
                        ))}
                    </div>
                    <span className="text-sm text-ui-fg-muted">
                        {images.length} image{images.length !== 1 ? "s" : ""}
                        {c.heading ? ` — ${c.heading}` : ""}
                    </span>
                </div>
            )
        }
        case "stats": {
            const stats = (c.stats as Stat[]) || []
            return (
                <div className="flex items-center gap-2">
                    {stats.slice(0, 3).map((s, i) => (
                        <span
                            key={i}
                            className="text-xs font-medium px-2 py-0.5 rounded bg-ui-bg-subtle border border-ui-border-base text-ui-fg-base"
                        >
                            {s.value}
                        </span>
                    ))}
                    {stats.length > 3 && (
                        <span className="text-xs text-ui-fg-muted">
                            +{stats.length - 3} more
                        </span>
                    )}
                    {stats.length === 0 && (
                        <span className="text-sm text-ui-fg-muted">No stats</span>
                    )}
                </div>
            )
        }
        case "team": {
            const members = (c.members as TeamMember[]) || []
            return (
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {members.slice(0, 3).map((m, i) => (
                            <div
                                key={i}
                                className="w-7 h-7 rounded-full border-2 border-ui-bg-base overflow-hidden"
                            >
                                <ImagePreview url={m.image_url} size={28} />
                            </div>
                        ))}
                    </div>
                    <span className="text-sm text-ui-fg-muted">
                        {members.length === 0
                            ? "No members"
                            : members.map((m) => m.name || "Unnamed").join(", ")}
                    </span>
                </div>
            )
        }
        case "cta":
            return (
                <span className="truncate text-sm text-ui-fg-base">
                    {(c.heading as string) || "CTA section"}
                    {(c.button_text as string) ? ` — "${c.button_text}"` : ""}
                </span>
            )
        default:
            return (
                <span className="text-sm text-ui-fg-muted">{section.type}</span>
            )
    }
}

// ---------------------------------------------------------------------------
// Main Section Editor Page
// ---------------------------------------------------------------------------

const SectionEditorPage = () => {
    const { slug } = useParams<{ slug: string }>()
    const [page, setPage] = useState<CmsPage | null>(null)
    const [sections, setSections] = useState<PageSection[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingSection, setEditingSection] = useState<PageSection | null>(null)
    const [quickAddType, setQuickAddType] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`/admin/cms-pages/${slug}`, {
                credentials: "include",
            })
            const data = await response.json()
            setPage(data.page || null)
            setSections(data.sections || [])
        } catch {
            toast.error("Failed to load page")
        } finally {
            setLoading(false)
        }
    }, [slug])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this section? This cannot be undone.")) return

        try {
            const response = await fetch(
                `/admin/cms-pages/${slug}/sections/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            )

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Section deleted")
            fetchData()
        } catch {
            toast.error("Failed to delete section")
        }
    }

    const handleToggleActive = async (section: PageSection) => {
        try {
            const response = await fetch(
                `/admin/cms-pages/${slug}/sections/${section.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ is_active: !section.is_active }),
                }
            )

            if (!response.ok) throw new Error("Failed to update")

            toast.success(
                section.is_active ? "Section deactivated" : "Section activated"
            )
            fetchData()
        } catch {
            toast.error("Failed to update section")
        }
    }

    const handleMoveUp = async (index: number) => {
        if (index === 0) return

        const current = sections[index]
        const above = sections[index - 1]

        try {
            const response = await fetch(
                `/admin/cms-pages/${slug}/sections/reorder`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        sections: [
                            { id: current.id, sort_order: above.sort_order },
                            { id: above.id, sort_order: current.sort_order },
                        ],
                    }),
                }
            )

            if (!response.ok) throw new Error("Failed to reorder")

            fetchData()
        } catch {
            toast.error("Failed to reorder sections")
        }
    }

    const handleMoveDown = async (index: number) => {
        if (index === sections.length - 1) return

        const current = sections[index]
        const below = sections[index + 1]

        try {
            const response = await fetch(
                `/admin/cms-pages/${slug}/sections/reorder`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        sections: [
                            { id: current.id, sort_order: below.sort_order },
                            { id: below.id, sort_order: current.sort_order },
                        ],
                    }),
                }
            )

            if (!response.ok) throw new Error("Failed to reorder")

            fetchData()
        } catch {
            toast.error("Failed to reorder sections")
        }
    }

    const openAddForm = () => {
        setQuickAddType(null)
        setEditingSection(null)
        setShowForm(true)
    }

    const openQuickAdd = (type: string) => {
        setQuickAddType(type)
        setEditingSection(null)
        setShowForm(true)
    }

    const nextSortOrder =
        sections.length > 0
            ? Math.max(...sections.map((s) => s.sort_order)) + 1
            : 0

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-ui-border-base border-t-ui-fg-interactive animate-spin" />
                        <Text className="text-ui-fg-muted">Loading page...</Text>
                    </div>
                </div>
            </Container>
        )
    }

    if (!slug || !page) {
        return (
            <Container>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-xl bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center mb-4 text-ui-fg-muted">
                        <XCircle />
                    </div>
                    <Heading level="h3" className="mb-2">Page not found</Heading>
                    <Text className="text-ui-fg-muted mb-4">
                        The page with slug "{slug}" could not be found.
                    </Text>
                    <Button
                        variant="secondary"
                        onClick={() => (window.location.href = "/app/cms-pages")}
                    >
                        <ArrowLongLeft />
                        Back to Pages
                    </Button>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="transparent"
                    size="small"
                    onClick={() => (window.location.href = "/app/cms-pages")}
                    className="mb-4 -ml-2"
                >
                    <ArrowLongLeft />
                    Back to Pages
                </Button>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <Heading level="h1">{page.title}</Heading>
                            <Badge color={page.is_published ? "green" : "grey"}>
                                {page.is_published ? "Published" : "Draft"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <Text className="text-ui-fg-muted">
                                /{page.slug}
                            </Text>
                            <span className="text-ui-fg-muted text-sm">&middot;</span>
                            <Text className="text-ui-fg-muted">
                                {sections.length} section{sections.length !== 1 ? "s" : ""}
                            </Text>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={() =>
                                window.open(`/bg/pages/${page.slug}`, "_blank")
                            }
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Preview Page
                        </Button>
                        <Button onClick={openAddForm}>
                            <Plus />
                            Add Section
                        </Button>
                    </div>
                </div>
            </div>

            {/* SEO Info */}
            {(page.seo_title || page.seo_description) && (
                <div className="mb-6 p-4 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                    <div className="flex items-center gap-2 mb-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-ui-fg-muted">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                        </svg>
                        <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide font-medium">
                            SEO
                        </Text>
                    </div>
                    {page.seo_title && (
                        <Text className="font-medium text-ui-fg-base">{page.seo_title}</Text>
                    )}
                    {page.seo_description && (
                        <Text size="small" className="text-ui-fg-muted mt-1">
                            {page.seo_description}
                        </Text>
                    )}
                    {page.seo_image && (
                        <div className="flex items-center gap-2 mt-2">
                            <ImagePreview url={page.seo_image} size={32} />
                            <Text size="xsmall" className="text-ui-fg-muted truncate">
                                {page.seo_image}
                            </Text>
                        </div>
                    )}
                </div>
            )}

            {/* Sections List */}
            {sections.length === 0 ? (
                <EmptyState onAdd={openAddForm} onQuickAdd={openQuickAdd} />
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell className="w-16">
                                <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
                                    Order
                                </Text>
                            </Table.HeaderCell>
                            <Table.HeaderCell className="w-36">
                                <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
                                    Type
                                </Text>
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
                                    Preview
                                </Text>
                            </Table.HeaderCell>
                            <Table.HeaderCell className="w-24">
                                <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
                                    Status
                                </Text>
                            </Table.HeaderCell>
                            <Table.HeaderCell className="w-24">
                                <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
                                    Reorder
                                </Text>
                            </Table.HeaderCell>
                            <Table.HeaderCell className="w-12" />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {sections.map((section, index) => {
                            const typeInfo = SECTION_TYPE_MAP[section.type]
                            return (
                                <Table.Row key={section.id}>
                                    <Table.Cell>
                                        <Text className="font-mono text-ui-fg-muted text-sm">
                                            {section.sort_order}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-ui-fg-muted flex-shrink-0">
                                                {typeInfo?.icon && (
                                                    <span className="w-4 h-4 inline-flex">
                                                        {typeInfo.icon}
                                                    </span>
                                                )}
                                            </span>
                                            <Badge color="blue">
                                                {typeInfo?.label || section.type}
                                            </Badge>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="max-w-xs overflow-hidden">
                                            {getContentPreview(section)}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            color={section.is_active ? "green" : "grey"}
                                        >
                                            {section.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex gap-1">
                                            <IconButton
                                                size="small"
                                                variant="transparent"
                                                onClick={() => handleMoveUp(index)}
                                                disabled={index === 0}
                                            >
                                                <ArrowUpMini />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                variant="transparent"
                                                onClick={() => handleMoveDown(index)}
                                                disabled={index === sections.length - 1}
                                            >
                                                <ArrowDownMini />
                                            </IconButton>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <DropdownMenu>
                                            <DropdownMenu.Trigger asChild>
                                                <IconButton
                                                    size="small"
                                                    variant="transparent"
                                                >
                                                    <EllipsisHorizontal />
                                                </IconButton>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Content>
                                                <DropdownMenu.Item
                                                    onClick={() => {
                                                        setEditingSection(section)
                                                        setShowForm(true)
                                                    }}
                                                >
                                                    <PencilSquare className="mr-2" />
                                                    Edit
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item
                                                    onClick={() =>
                                                        handleToggleActive(section)
                                                    }
                                                >
                                                    {section.is_active ? (
                                                        <>
                                                            <XCircle className="mr-2" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Separator />
                                                <DropdownMenu.Item
                                                    onClick={() =>
                                                        handleDelete(section.id)
                                                    }
                                                    className="text-ui-fg-error"
                                                >
                                                    <Trash className="mr-2" />
                                                    Delete
                                                </DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            )}

            {/* Section form modal */}
            <SectionFormModal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false)
                    setEditingSection(null)
                    setQuickAddType(null)
                }}
                section={editingSection}
                slug={slug || ""}
                onSave={fetchData}
                nextSortOrder={nextSortOrder}
                initialType={quickAddType ?? undefined}
            />
        </Container>
    )
}

export default SectionEditorPage
