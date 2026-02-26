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
    Photo,
    Plus,
    EllipsisHorizontal,
    PencilSquare,
    Trash,
    ArrowUpMini,
    ArrowDownMini,
    CheckCircle,
    XCircle,
} from "@medusajs/icons"

type CarouselSlide = {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    image_url: string
    cta_text: string | null
    cta_link: string | null
    overlay_color: string | null
    overlay_opacity: number | null
    sort_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

// Slide Form Modal
const SlideFormModal = ({
    isOpen,
    onClose,
    slide,
    onSave,
    nextSortOrder,
}: {
    isOpen: boolean
    onClose: () => void
    slide: CarouselSlide | null
    onSave: () => void
    nextSortOrder: number
}) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        image_url: "",
        cta_text: "",
        cta_link: "",
        overlay_color: "",
        overlay_opacity: 40,
        sort_order: 0,
        is_active: true,
    })

    useEffect(() => {
        if (slide) {
            setFormData({
                title: slide.title,
                subtitle: slide.subtitle || "",
                description: slide.description || "",
                image_url: slide.image_url,
                cta_text: slide.cta_text || "",
                cta_link: slide.cta_link || "",
                overlay_color: slide.overlay_color || "",
                overlay_opacity: slide.overlay_opacity ?? 40,
                sort_order: slide.sort_order,
                is_active: slide.is_active,
            })
        } else {
            setFormData({
                title: "",
                subtitle: "",
                description: "",
                image_url: "",
                cta_text: "",
                cta_link: "",
                overlay_color: "",
                overlay_opacity: 40,
                sort_order: nextSortOrder,
                is_active: true,
            })
        }
    }, [slide, isOpen, nextSortOrder])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = slide
                ? `/admin/carousel-slides/${slide.id}`
                : "/admin/carousel-slides"
            const method = slide ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to save slide")
            }

            toast.success(slide ? "Slide updated" : "Slide created")
            onSave()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save slide")
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
                        {slide ? "Edit Slide" : "Create Slide"}
                    </Heading>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Pearl & Crystal Bracelet"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="image_url">Image URL *</Label>
                        <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="e.g., /bracelet-pearl.png or https://cdn.example.com/image.jpg"
                            required
                        />
                        {formData.image_url && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-ui-border-base">
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="w-full h-32 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none"
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="subtitle">Subtitle (small uppercase label)</Label>
                        <Input
                            id="subtitle"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="e.g., Swarovski Collection"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description (caption)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g., Delicate pearl bracelet with Swarovski crystal accent."
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cta_text">CTA Text</Label>
                            <Input
                                id="cta_text"
                                value={formData.cta_text}
                                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                placeholder="e.g., Shop Now"
                            />
                        </div>
                        <div>
                            <Label htmlFor="cta_link">CTA Link</Label>
                            <Input
                                id="cta_link"
                                value={formData.cta_link}
                                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                placeholder="e.g., /collections/swarovski"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="overlay_color">Overlay Color</Label>
                            <Input
                                id="overlay_color"
                                value={formData.overlay_color}
                                onChange={(e) => setFormData({ ...formData, overlay_color: e.target.value })}
                                placeholder="e.g., rgba(0,0,0,0.4)"
                            />
                            <Text size="xsmall" className="text-ui-fg-muted mt-1">
                                CSS color for image overlay
                            </Text>
                        </div>
                        <div>
                            <Label htmlFor="overlay_opacity">Overlay Opacity (0-100)</Label>
                            <Input
                                id="overlay_opacity"
                                type="number"
                                min={0}
                                max={100}
                                value={formData.overlay_opacity}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    overlay_opacity: parseInt(e.target.value) || 0
                                })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={formData.sort_order}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    sort_order: parseInt(e.target.value) || 0
                                })}
                            />
                        </div>
                        <div className="flex items-end pb-1">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
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
                            {slide ? "Update Slide" : "Create Slide"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Main Page
const CarouselSlidesPage = () => {
    const [slides, setSlides] = useState<CarouselSlide[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)

    const fetchSlides = useCallback(async () => {
        try {
            const response = await fetch("/admin/carousel-slides", {
                credentials: "include",
            })
            const data = await response.json()
            setSlides(data.slides || [])
        } catch (error) {
            toast.error("Failed to load slides")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSlides()
    }, [fetchSlides])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this slide?")) return

        try {
            const response = await fetch(`/admin/carousel-slides/${id}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Slide deleted")
            fetchSlides()
        } catch {
            toast.error("Failed to delete slide")
        }
    }

    const handleToggleActive = async (slide: CarouselSlide) => {
        try {
            const response = await fetch(`/admin/carousel-slides/${slide.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_active: !slide.is_active }),
            })

            if (!response.ok) throw new Error("Failed to update")

            toast.success(slide.is_active ? "Slide deactivated" : "Slide activated")
            fetchSlides()
        } catch {
            toast.error("Failed to update slide")
        }
    }

    const handleMoveUp = async (index: number) => {
        if (index === 0) return

        const current = slides[index]
        const above = slides[index - 1]

        try {
            const response = await fetch("/admin/carousel-slides/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    slides: [
                        { id: current.id, sort_order: above.sort_order },
                        { id: above.id, sort_order: current.sort_order },
                    ],
                }),
            })

            if (!response.ok) throw new Error("Failed to reorder")

            fetchSlides()
        } catch {
            toast.error("Failed to reorder slides")
        }
    }

    const handleMoveDown = async (index: number) => {
        if (index === slides.length - 1) return

        const current = slides[index]
        const below = slides[index + 1]

        try {
            const response = await fetch("/admin/carousel-slides/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    slides: [
                        { id: current.id, sort_order: below.sort_order },
                        { id: below.id, sort_order: current.sort_order },
                    ],
                }),
            })

            if (!response.ok) throw new Error("Failed to reorder")

            fetchSlides()
        } catch {
            toast.error("Failed to reorder slides")
        }
    }

    const nextSortOrder = slides.length > 0
        ? Math.max(...slides.map((s) => s.sort_order)) + 1
        : 0

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Heading level="h1" className="flex items-center gap-2">
                        <Photo />
                        Carousel Slides
                    </Heading>
                    <Text className="text-ui-fg-muted mt-1">
                        Manage homepage hero carousel slides
                    </Text>
                </div>
                <Button
                    onClick={() => {
                        setEditingSlide(null)
                        setShowForm(true)
                    }}
                >
                    <Plus />
                    Add Slide
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Text className="text-ui-fg-muted">Loading slides...</Text>
                </div>
            ) : slides.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Photo className="w-12 h-12 text-ui-fg-muted mb-4" />
                    <Text className="text-ui-fg-muted mb-4">
                        No carousel slides yet. Create your first slide to get started.
                    </Text>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setEditingSlide(null)
                            setShowForm(true)
                        }}
                    >
                        <Plus />
                        Create First Slide
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell className="w-16">Order</Table.HeaderCell>
                            <Table.HeaderCell className="w-20">Image</Table.HeaderCell>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>CTA</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Reorder</Table.HeaderCell>
                            <Table.HeaderCell className="w-12"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {slides.map((slide, index) => (
                            <Table.Row key={slide.id}>
                                <Table.Cell>
                                    <Text className="font-mono text-ui-fg-muted">
                                        {slide.sort_order}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="w-16 h-10 rounded overflow-hidden bg-ui-bg-subtle border border-ui-border-base">
                                        <img
                                            src={slide.image_url}
                                            alt={slide.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40' fill='%23ccc'%3E%3Crect width='64' height='40' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23999'%3ENo img%3C/text%3E%3C/svg%3E"
                                            }}
                                        />
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <div>
                                        <Text className="font-medium">{slide.title}</Text>
                                        {slide.subtitle && (
                                            <Text size="xsmall" className="text-ui-fg-muted">
                                                {slide.subtitle}
                                            </Text>
                                        )}
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    {slide.cta_text ? (
                                        <Text size="small" className="text-ui-fg-muted">
                                            {slide.cta_text}
                                        </Text>
                                    ) : (
                                        <Text size="small" className="text-ui-fg-disabled">
                                            -
                                        </Text>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color={slide.is_active ? "green" : "grey"}>
                                        {slide.is_active ? "Active" : "Inactive"}
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
                                            disabled={index === slides.length - 1}
                                        >
                                            <ArrowDownMini />
                                        </IconButton>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <DropdownMenu>
                                        <DropdownMenu.Trigger asChild>
                                            <IconButton size="small" variant="transparent">
                                                <EllipsisHorizontal />
                                            </IconButton>
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Content>
                                            <DropdownMenu.Item
                                                onClick={() => {
                                                    setEditingSlide(slide)
                                                    setShowForm(true)
                                                }}
                                            >
                                                <PencilSquare className="mr-2" />
                                                Edit
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item
                                                onClick={() => handleToggleActive(slide)}
                                            >
                                                {slide.is_active ? (
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
                                                onClick={() => handleDelete(slide.id)}
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

            <SlideFormModal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false)
                    setEditingSlide(null)
                }}
                slide={editingSlide}
                onSave={fetchSlides}
                nextSortOrder={nextSortOrder}
            />
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Carousel Slides",
    icon: Photo,
})

export default CarouselSlidesPage
