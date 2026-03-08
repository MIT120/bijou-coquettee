import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState, useCallback } from "react"
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
    Switch,
    toast,
} from "@medusajs/ui"
import {
    DocumentText,
    Plus,
    EllipsisHorizontal,
    PencilSquare,
    Trash,
    CheckCircle,
    XCircle,
    QueueList,
    ArrowUpRightOnBox,
    ServerStack,
} from "@medusajs/icons"

const DEFAULT_COUNTRY_CODE = "bg"
const STOREFRONT_URL =
    process.env.NEXT_PUBLIC_STOREFRONT_URL ||
    process.env.STOREFRONT_URL ||
    "http://localhost:8000"

type CmsPage = {
    id: string
    slug: string
    title: string
    seo_title: string | null
    seo_description: string | null
    seo_image: string | null
    is_published: boolean
    section_count: number
    created_at: string
    updated_at: string
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

// ----- Page Form Modal -----

const PageFormModal = ({
    isOpen,
    onClose,
    page,
    onSave,
}: {
    isOpen: boolean
    onClose: () => void
    page: CmsPage | null
    onSave: () => void
}) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        slug: "",
        title: "",
        seo_title: "",
        seo_description: "",
        seo_image: "",
        is_published: false,
    })

    useEffect(() => {
        if (page) {
            setFormData({
                slug: page.slug,
                title: page.title,
                seo_title: page.seo_title || "",
                seo_description: page.seo_description || "",
                seo_image: page.seo_image || "",
                is_published: page.is_published,
            })
        } else {
            setFormData({
                slug: "",
                title: "",
                seo_title: "",
                seo_description: "",
                seo_image: "",
                is_published: false,
            })
        }
    }, [page, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = page
                ? `/admin/cms-pages/${page.slug}`
                : "/admin/cms-pages"
            const method = page ? "PATCH" : "POST"

            const body = page
                ? {
                      title: formData.title,
                      seo_title: formData.seo_title || null,
                      seo_description: formData.seo_description || null,
                      seo_image: formData.seo_image || null,
                      is_published: formData.is_published,
                  }
                : formData

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to save page")
            }

            toast.success(page ? "Page updated successfully" : "Page created successfully")
            onSave()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save page")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const slugPreview = formData.slug
        ? `/${DEFAULT_COUNTRY_CODE}/pages/${formData.slug}`
        : null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-ui-bg-overlay"
                onClick={onClose}
            />
            <div className="relative bg-ui-bg-base text-ui-fg-base border border-ui-border-base shadow-elevation-modal rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-ui-bg-base border-b border-ui-border-base px-6 py-4 z-10">
                    <Heading level="h2" className="text-ui-fg-base">
                        {page ? "Edit Page Settings" : "Create New Page"}
                    </Heading>
                    <Text size="small" className="text-ui-fg-muted mt-0.5">
                        {page
                            ? "Update the page metadata and publish settings"
                            : "Define the URL slug and metadata for your new page"}
                    </Text>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {!page && (
                        <div className="space-y-1.5">
                            <Label htmlFor="slug" className="text-ui-fg-base font-medium">
                                URL Slug *
                            </Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        slug: e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9-]/g, "-")
                                            .replace(/-+/g, "-")
                                            .replace(/^-|-$/g, ""),
                                    })
                                }
                                placeholder="e.g., about-us"
                                required
                            />
                            {slugPreview ? (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <Text size="xsmall" className="text-ui-fg-muted">
                                        Page URL:
                                    </Text>
                                    <Text
                                        size="xsmall"
                                        className="text-ui-fg-interactive font-mono"
                                    >
                                        {slugPreview}
                                    </Text>
                                </div>
                            ) : (
                                <Text size="xsmall" className="text-ui-fg-muted mt-1">
                                    Lowercase letters, numbers, and hyphens only. The URL will be /pages/your-slug.
                                </Text>
                            )}
                        </div>
                    )}

                    {page && (
                        <div className="p-3 bg-ui-bg-subtle rounded-md border border-ui-border-base">
                            <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide mb-1">
                                Page URL
                            </Text>
                            <Text size="small" className="text-ui-fg-interactive font-mono">
                                /{DEFAULT_COUNTRY_CODE}/pages/{page.slug}
                            </Text>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-ui-fg-base font-medium">
                            Page Title *
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="e.g., About Us"
                            required
                        />
                        <Text size="xsmall" className="text-ui-fg-muted">
                            Shown in the browser tab and used as the default SEO title
                        </Text>
                    </div>

                    <div className="border-t border-ui-border-base pt-5">
                        <Text className="text-ui-fg-base font-medium mb-3">
                            SEO Settings
                        </Text>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="seo_title" className="text-ui-fg-base">
                                    SEO Title
                                </Label>
                                <Input
                                    id="seo_title"
                                    value={formData.seo_title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, seo_title: e.target.value })
                                    }
                                    placeholder="e.g., About Bijou Coquettee | Handcrafted Jewelry"
                                />
                                <Text size="xsmall" className="text-ui-fg-muted">
                                    Overrides the page title in search engine results (50-60 characters recommended)
                                </Text>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="seo_description" className="text-ui-fg-base">
                                    SEO Description
                                </Label>
                                <Textarea
                                    id="seo_description"
                                    value={formData.seo_description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            seo_description: e.target.value,
                                        })
                                    }
                                    placeholder="A short description of this page for search engines..."
                                    rows={3}
                                />
                                <Text size="xsmall" className="text-ui-fg-muted">
                                    Shown below the title in search results (150-160 characters recommended)
                                </Text>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="seo_image" className="text-ui-fg-base">
                                    Social Share Image URL
                                </Label>
                                <Input
                                    id="seo_image"
                                    value={formData.seo_image}
                                    onChange={(e) =>
                                        setFormData({ ...formData, seo_image: e.target.value })
                                    }
                                    placeholder="https://..."
                                />
                                <Text size="xsmall" className="text-ui-fg-muted">
                                    Image shown when this page is shared on social media (1200x630px recommended)
                                </Text>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-ui-border-base pt-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="is_published" className="text-ui-fg-base font-medium">
                                    Published
                                </Label>
                                <Text size="xsmall" className="text-ui-fg-muted mt-0.5">
                                    {formData.is_published
                                        ? "This page is visible to visitors on the storefront"
                                        : "This page is hidden from visitors (draft mode)"}
                                </Text>
                            </div>
                            <Switch
                                id="is_published"
                                checked={formData.is_published}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        is_published: checked,
                                    })
                                }
                            />
                        </div>
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
                            {page ? "Update Page" : "Create Page"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ----- Empty State -----

const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center border border-dashed border-ui-border-base rounded-lg bg-ui-bg-subtle">
            <div className="w-12 h-12 rounded-full bg-ui-bg-base border border-ui-border-base flex items-center justify-center mb-5 shadow-elevation-card-rest">
                <DocumentText className="text-ui-fg-muted" />
            </div>
            <Heading level="h2" className="text-ui-fg-base mb-2">
                No pages yet
            </Heading>
            <Text className="text-ui-fg-muted mb-8 max-w-sm">
                Create your first CMS page to add custom content to your storefront - about pages, brand stories, size guides, and more.
            </Text>

            <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-8">
                {[
                    {
                        step: "1",
                        title: "Create a page",
                        description: "Give your page a URL slug and title",
                    },
                    {
                        step: "2",
                        title: "Add sections",
                        description: "Build the layout with hero, text, gallery blocks",
                    },
                    {
                        step: "3",
                        title: "Publish",
                        description: "Make it live for your visitors",
                    },
                ].map(({ step, title, description }) => (
                    <div
                        key={step}
                        className="flex flex-col items-center p-4 bg-ui-bg-base rounded-lg border border-ui-border-base"
                    >
                        <div className="w-7 h-7 rounded-full bg-ui-bg-highlight border border-ui-border-strong flex items-center justify-center mb-2">
                            <Text size="xsmall" className="font-semibold text-ui-fg-base">
                                {step}
                            </Text>
                        </div>
                        <Text size="small" className="font-medium text-ui-fg-base mb-1">
                            {title}
                        </Text>
                        <Text size="xsmall" className="text-ui-fg-muted text-center">
                            {description}
                        </Text>
                    </div>
                ))}
            </div>

            <Button onClick={onCreateClick}>
                <Plus />
                Create First Page
            </Button>
        </div>
    )
}

// ----- Main Page Component -----

const CmsPagesPage = () => {
    const [pages, setPages] = useState<CmsPage[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingPage, setEditingPage] = useState<CmsPage | null>(null)

    const fetchPages = useCallback(async () => {
        try {
            const response = await fetch("/admin/cms-pages", {
                credentials: "include",
            })
            const data = await response.json()
            setPages(data.pages || [])
        } catch {
            toast.error("Failed to load pages")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPages()
    }, [fetchPages])

    const handleDelete = async (slug: string) => {
        if (
            !confirm(
                "Are you sure you want to delete this page and all its sections? This action cannot be undone."
            )
        )
            return

        try {
            const response = await fetch(`/admin/cms-pages/${slug}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Page deleted successfully")
            fetchPages()
        } catch {
            toast.error("Failed to delete page")
        }
    }

    const handleTogglePublish = async (page: CmsPage) => {
        try {
            const response = await fetch(`/admin/cms-pages/${page.slug}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_published: !page.is_published }),
            })

            if (!response.ok) throw new Error("Failed to update")

            toast.success(
                page.is_published ? "Page unpublished" : "Page published and now live"
            )
            fetchPages()
        } catch {
            toast.error("Failed to update page status")
        }
    }

    const handleNavigateToSections = (slug: string) => {
        window.location.href = `/app/cms-pages/${slug}`
    }

    const handleOpenInStorefront = (slug: string) => {
        window.open(
            `${STOREFRONT_URL}/${DEFAULT_COUNTRY_CODE}/pages/${slug}`,
            "_blank",
            "noopener,noreferrer"
        )
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div>
                        <Heading level="h1" className="flex items-center gap-2">
                            <DocumentText />
                            CMS Pages
                        </Heading>
                        <Text className="text-ui-fg-muted mt-0.5">
                            Create and manage custom content pages for your storefront
                        </Text>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setEditingPage(null)
                        setShowForm(true)
                    }}
                >
                    <Plus />
                    Add Page
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Text className="text-ui-fg-muted">Loading pages...</Text>
                </div>
            ) : pages.length === 0 ? (
                <EmptyState
                    onCreateClick={() => {
                        setEditingPage(null)
                        setShowForm(true)
                    }}
                />
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Page</Table.HeaderCell>
                            <Table.HeaderCell className="w-36">Status</Table.HeaderCell>
                            <Table.HeaderCell className="w-32">Sections</Table.HeaderCell>
                            <Table.HeaderCell className="w-32">Last Updated</Table.HeaderCell>
                            <Table.HeaderCell className="w-12"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {pages.map((page) => (
                            <Table.Row
                                key={page.id}
                                className="cursor-pointer"
                                onClick={() => handleNavigateToSections(page.slug)}
                            >
                                <Table.Cell>
                                    <div>
                                        <Text className="font-medium text-ui-fg-base">
                                            {page.title}
                                        </Text>
                                        <Text
                                            size="xsmall"
                                            className="text-ui-fg-muted font-mono mt-0.5"
                                        >
                                            /pages/{page.slug}
                                        </Text>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge
                                        color={page.is_published ? "green" : "grey"}
                                        size="base"
                                    >
                                        {page.is_published ? "Published" : "Draft"}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <button
                                        className="flex items-center gap-1.5 group"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleNavigateToSections(page.slug)
                                        }}
                                        title="Edit sections"
                                    >
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-ui-bg-subtle border border-ui-border-base group-hover:bg-ui-bg-base group-hover:border-ui-border-strong transition-colors">
                                            <QueueList className="text-ui-fg-subtle w-3 h-3" />
                                            <Text
                                                size="xsmall"
                                                className="text-ui-fg-subtle font-medium"
                                            >
                                                {page.section_count}{" "}
                                                {page.section_count === 1 ? "section" : "sections"}
                                            </Text>
                                        </div>
                                    </button>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="small" className="text-ui-fg-muted">
                                        {formatDate(page.updated_at)}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-1">
                                        <IconButton
                                            size="small"
                                            variant="transparent"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleNavigateToSections(page.slug)
                                            }}
                                            title="Edit sections"
                                        >
                                            <ServerStack />
                                        </IconButton>
                                        <DropdownMenu>
                                            <DropdownMenu.Trigger asChild>
                                                <IconButton
                                                    size="small"
                                                    variant="transparent"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <EllipsisHorizontal />
                                                </IconButton>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Content>
                                                <DropdownMenu.Item
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleNavigateToSections(page.slug)
                                                    }}
                                                >
                                                    <ServerStack className="mr-2" />
                                                    Edit Sections
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setEditingPage(page)
                                                        setShowForm(true)
                                                    }}
                                                >
                                                    <PencilSquare className="mr-2" />
                                                    Edit Settings
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleOpenInStorefront(page.slug)
                                                    }}
                                                >
                                                    <ArrowUpRightOnBox className="mr-2" />
                                                    View on Site
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleTogglePublish(page)
                                                    }}
                                                >
                                                    {page.is_published ? (
                                                        <>
                                                            <XCircle className="mr-2" />
                                                            Unpublish
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2" />
                                                            Publish
                                                        </>
                                                    )}
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Separator />
                                                <DropdownMenu.Item
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(page.slug)
                                                    }}
                                                    className="text-ui-fg-error"
                                                >
                                                    <Trash className="mr-2" />
                                                    Delete
                                                </DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}

            <PageFormModal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false)
                    setEditingPage(null)
                }}
                page={editingPage}
                onSave={fetchPages}
            />
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "CMS Pages",
    icon: DocumentText,
})

export default CmsPagesPage
