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
    Eye,
} from "@medusajs/icons"

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

            toast.success(page ? "Page updated" : "Page created")
            onSave()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save page")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-ui-bg-base rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-ui-bg-base border-b border-ui-border-base px-6 py-4">
                    <Heading level="h2">
                        {page ? "Edit Page" : "Create Page"}
                    </Heading>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {!page && (
                        <div>
                            <Label htmlFor="slug">Slug *</Label>
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
                                placeholder="e.g., about"
                                required
                            />
                            <Text size="xsmall" className="text-ui-fg-muted mt-1">
                                URL path: /about (lowercase, hyphens only)
                            </Text>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="e.g., About Us"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="seo_title">SEO Title</Label>
                        <Input
                            id="seo_title"
                            value={formData.seo_title}
                            onChange={(e) =>
                                setFormData({ ...formData, seo_title: e.target.value })
                            }
                            placeholder="e.g., About Bijou Coquettee | Handcrafted Jewelry"
                        />
                    </div>

                    <div>
                        <Label htmlFor="seo_description">SEO Description</Label>
                        <Textarea
                            id="seo_description"
                            value={formData.seo_description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    seo_description: e.target.value,
                                })
                            }
                            placeholder="Page description for search engines..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="seo_image">SEO Image URL</Label>
                        <Input
                            id="seo_image"
                            value={formData.seo_image}
                            onChange={(e) =>
                                setFormData({ ...formData, seo_image: e.target.value })
                            }
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={formData.is_published}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    is_published: e.target.checked,
                                })
                            }
                            className="w-4 h-4"
                        />
                        <Label htmlFor="is_published">Published</Label>
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
        if (!confirm("Are you sure you want to delete this page and all its sections?"))
            return

        try {
            const response = await fetch(`/admin/cms-pages/${slug}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Page deleted")
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
                page.is_published ? "Page unpublished" : "Page published"
            )
            fetchPages()
        } catch {
            toast.error("Failed to update page")
        }
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Heading level="h1" className="flex items-center gap-2">
                        <DocumentText />
                        CMS Pages
                    </Heading>
                    <Text className="text-ui-fg-muted mt-1">
                        Manage dynamic content pages
                    </Text>
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
                <div className="flex items-center justify-center py-12">
                    <Text className="text-ui-fg-muted">Loading pages...</Text>
                </div>
            ) : pages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <DocumentText className="w-12 h-12 text-ui-fg-muted mb-4" />
                    <Text className="text-ui-fg-muted mb-4">
                        No CMS pages yet. Create your first page to get started.
                    </Text>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setEditingPage(null)
                            setShowForm(true)
                        }}
                    >
                        <Plus />
                        Create First Page
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Slug</Table.HeaderCell>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Sections</Table.HeaderCell>
                            <Table.HeaderCell className="w-28">Status</Table.HeaderCell>
                            <Table.HeaderCell className="w-12"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {pages.map((page) => (
                            <Table.Row key={page.id}>
                                <Table.Cell>
                                    <Text className="font-mono text-ui-fg-muted">
                                        /{page.slug}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text className="font-medium">{page.title}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text className="text-ui-fg-muted">
                                        {page.section_count}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge
                                        color={page.is_published ? "green" : "grey"}
                                    >
                                        {page.is_published ? "Published" : "Draft"}
                                    </Badge>
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
                                                onClick={() =>
                                                    (window.location.href = `/app/cms-pages/${page.slug}`)
                                                }
                                            >
                                                <Eye className="mr-2" />
                                                Edit Sections
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item
                                                onClick={() => {
                                                    setEditingPage(page)
                                                    setShowForm(true)
                                                }}
                                            >
                                                <PencilSquare className="mr-2" />
                                                Edit Page
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item
                                                onClick={() =>
                                                    handleTogglePublish(page)
                                                }
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
                                                onClick={() =>
                                                    handleDelete(page.slug)
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
