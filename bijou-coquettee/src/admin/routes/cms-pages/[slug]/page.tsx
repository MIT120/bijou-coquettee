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

const SECTION_TYPES = [
    { value: "hero", label: "Hero Banner" },
    { value: "rich_text", label: "Rich Text" },
    { value: "image_text", label: "Image + Text" },
    { value: "gallery", label: "Gallery" },
    { value: "stats", label: "Stats / Numbers" },
    { value: "team", label: "Team Members" },
    { value: "cta", label: "Call to Action" },
]

const SECTION_TYPE_LABELS: Record<string, string> = {
    hero: "Hero",
    rich_text: "Rich Text",
    image_text: "Image + Text",
    gallery: "Gallery",
    stats: "Stats",
    team: "Team",
    cta: "CTA",
}

// Type-specific content fields
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
                        <Input
                            value={(content.image_url as string) || ""}
                            onChange={(e) => update("image_url", e.target.value)}
                            placeholder="https://..."
                        />
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
                        <Input
                            value={(content.image_url as string) || ""}
                            onChange={(e) => update("image_url", e.target.value)}
                            placeholder="https://..."
                        />
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

        case "gallery":
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
                        <Label>Images (JSON array)</Label>
                        <Textarea
                            value={
                                JSON.stringify(
                                    (content.images as unknown[]) || [],
                                    null,
                                    2
                                )
                            }
                            onChange={(e) => {
                                try {
                                    update("images", JSON.parse(e.target.value))
                                } catch {
                                    // Allow invalid JSON while typing
                                }
                            }}
                            rows={8}
                            placeholder={`[\n  { "image_url": "https://...", "alt": "Description", "caption": "Optional caption" }\n]`}
                        />
                        <Text size="xsmall" className="text-ui-fg-muted mt-1">
                            Each image: image_url (required), alt, caption
                        </Text>
                    </div>
                </div>
            )

        case "stats":
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
                        <Label>Stats (JSON array)</Label>
                        <Textarea
                            value={
                                JSON.stringify(
                                    (content.stats as unknown[]) || [],
                                    null,
                                    2
                                )
                            }
                            onChange={(e) => {
                                try {
                                    update("stats", JSON.parse(e.target.value))
                                } catch {
                                    // Allow invalid JSON while typing
                                }
                            }}
                            rows={6}
                            placeholder={`[\n  { "value": "500+", "label": "Pieces Crafted" },\n  { "value": "50+", "label": "Artisan Partners" }\n]`}
                        />
                        <Text size="xsmall" className="text-ui-fg-muted mt-1">
                            Each stat: value (string), label (string)
                        </Text>
                    </div>
                </div>
            )

        case "team":
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
                        <Label>Members (JSON array)</Label>
                        <Textarea
                            value={
                                JSON.stringify(
                                    (content.members as unknown[]) || [],
                                    null,
                                    2
                                )
                            }
                            onChange={(e) => {
                                try {
                                    update("members", JSON.parse(e.target.value))
                                } catch {
                                    // Allow invalid JSON while typing
                                }
                            }}
                            rows={8}
                            placeholder={`[\n  { "name": "Jane Doe", "role": "Founder", "image_url": "https://...", "bio": "..." }\n]`}
                        />
                        <Text size="xsmall" className="text-ui-fg-muted mt-1">
                            Each member: name, role (required), image_url, bio (optional)
                        </Text>
                    </div>
                </div>
            )

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

// Section form modal
const SectionFormModal = ({
    isOpen,
    onClose,
    section,
    slug,
    onSave,
    nextSortOrder,
}: {
    isOpen: boolean
    onClose: () => void
    section: PageSection | null
    slug: string
    onSave: () => void
    nextSortOrder: number
}) => {
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState("rich_text")
    const [content, setContent] = useState<Record<string, unknown>>({})
    const [sortOrder, setSortOrder] = useState(0)
    const [isActive, setIsActive] = useState(true)

    useEffect(() => {
        if (section) {
            setType(section.type)
            setContent(section.content || {})
            setSortOrder(section.sort_order)
            setIsActive(section.is_active)
        } else {
            setType("rich_text")
            setContent({})
            setSortOrder(nextSortOrder)
            setIsActive(true)
        }
    }, [section, isOpen, nextSortOrder])

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-ui-bg-base rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-ui-bg-base border-b border-ui-border-base px-6 py-4 z-10">
                    <Heading level="h2">
                        {section ? "Edit Section" : "Add Section"}
                    </Heading>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Section Type *</Label>
                            <Select
                                value={type}
                                onValueChange={(v) => {
                                    setType(v)
                                    if (!section) setContent({})
                                }}
                                disabled={!!section}
                            >
                                <Select.Trigger>
                                    <Select.Value />
                                </Select.Trigger>
                                <Select.Content>
                                    {SECTION_TYPES.map((t) => (
                                        <Select.Item key={t.value} value={t.value}>
                                            {t.label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select>
                        </div>
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
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="section_active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <Label htmlFor="section_active">Active</Label>
                    </div>

                    <div className="border-t border-ui-border-base pt-4">
                        <Text className="font-medium mb-3">Content</Text>
                        <ContentFields
                            type={type}
                            content={content}
                            onChange={setContent}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-ui-border-base">
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
                </form>
            </div>
        </div>
    )
}

// Main Section Editor Page
const SectionEditorPage = () => {
    const { slug } = useParams<{ slug: string }>()
    const [page, setPage] = useState<CmsPage | null>(null)
    const [sections, setSections] = useState<PageSection[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingSection, setEditingSection] = useState<PageSection | null>(null)

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
        if (!confirm("Delete this section?")) return

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

    const nextSortOrder =
        sections.length > 0
            ? Math.max(...sections.map((s) => s.sort_order)) + 1
            : 0

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center py-12">
                    <Text className="text-ui-fg-muted">Loading...</Text>
                </div>
            </Container>
        )
    }

    if (!page) {
        return (
            <Container>
                <Text className="text-ui-fg-muted">Page not found</Text>
            </Container>
        )
    }

    return (
        <Container>
            <div className="mb-6">
                <Button
                    variant="transparent"
                    size="small"
                    onClick={() => (window.location.href = "/app/cms-pages")}
                    className="mb-4"
                >
                    <ArrowLongLeft />
                    Back to Pages
                </Button>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Heading level="h1">{page.title}</Heading>
                            <Badge color={page.is_published ? "green" : "grey"}>
                                {page.is_published ? "Published" : "Draft"}
                            </Badge>
                        </div>
                        <Text className="text-ui-fg-muted mt-1">
                            /{page.slug} &middot; {sections.length} section
                            {sections.length !== 1 ? "s" : ""}
                        </Text>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingSection(null)
                            setShowForm(true)
                        }}
                    >
                        <Plus />
                        Add Section
                    </Button>
                </div>
            </div>

            {/* SEO Info */}
            {(page.seo_title || page.seo_description) && (
                <div className="mb-6 p-4 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                    <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide mb-2">
                        SEO
                    </Text>
                    {page.seo_title && (
                        <Text className="font-medium">{page.seo_title}</Text>
                    )}
                    {page.seo_description && (
                        <Text size="small" className="text-ui-fg-muted mt-1">
                            {page.seo_description}
                        </Text>
                    )}
                </div>
            )}

            {/* Sections List */}
            {sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Text className="text-ui-fg-muted mb-4">
                        No sections yet. Add your first section to build this page.
                    </Text>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setEditingSection(null)
                            setShowForm(true)
                        }}
                    >
                        <Plus />
                        Add First Section
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell className="w-16">Order</Table.HeaderCell>
                            <Table.HeaderCell className="w-28">Type</Table.HeaderCell>
                            <Table.HeaderCell>Preview</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Reorder</Table.HeaderCell>
                            <Table.HeaderCell className="w-12"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {sections.map((section, index) => (
                            <Table.Row key={section.id}>
                                <Table.Cell>
                                    <Text className="font-mono text-ui-fg-muted">
                                        {section.sort_order}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color="blue">
                                        {SECTION_TYPE_LABELS[section.type] ||
                                            section.type}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text
                                        size="small"
                                        className="text-ui-fg-muted truncate max-w-[300px]"
                                    >
                                        {getContentPreview(section)}
                                    </Text>
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
                                            disabled={
                                                index === sections.length - 1
                                            }
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
                        ))}
                    </Table.Body>
                </Table>
            )}

            <SectionFormModal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false)
                    setEditingSection(null)
                }}
                section={editingSection}
                slug={slug!}
                onSave={fetchData}
                nextSortOrder={nextSortOrder}
            />
        </Container>
    )
}

function getContentPreview(section: PageSection): string {
    const c = section.content
    switch (section.type) {
        case "hero":
            return (c.heading as string) || "Hero section"
        case "rich_text":
            return (c.heading as string) || "Rich text section"
        case "image_text":
            return (c.heading as string) || "Image + text section"
        case "gallery": {
            const images = (c.images as unknown[]) || []
            return `${images.length} image${images.length !== 1 ? "s" : ""}`
        }
        case "stats": {
            const stats = (c.stats as unknown[]) || []
            return `${stats.length} stat${stats.length !== 1 ? "s" : ""}`
        }
        case "team": {
            const members = (c.members as unknown[]) || []
            return `${members.length} member${members.length !== 1 ? "s" : ""}`
        }
        case "cta":
            return (c.heading as string) || "CTA section"
        default:
            return section.type
    }
}

export default SectionEditorPage
