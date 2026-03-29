import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState, useCallback, useRef } from "react"
import {
    Container, Heading, Text, Badge, Button, Input,
    Table, IconButton, DropdownMenu, Label, Textarea, toast,
} from "@medusajs/ui"
import {
    Photo, Plus, EllipsisHorizontal, PencilSquare, Trash,
    ArrowUpMini, ArrowDownMini, CheckCircle, XCircle, Link as LinkIcon,
} from "@medusajs/icons"

type CarouselSlide = {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    image_url: string
    cta_text: string | null
    cta_link: string | null
    product_handle: string | null
    overlay_color: string | null
    overlay_opacity: number | null
    sort_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

type MedusaProduct = {
    id: string
    title: string
    handle: string
    thumbnail: string | null
}

// Product search hook
const useProductSearch = () => {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<MedusaProduct[]>([])
    const [loading, setLoading] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const search = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); return }
        setLoading(true)
        try {
            const res = await fetch(
                `/admin/products?q=${encodeURIComponent(q)}&limit=8`,
                { credentials: "include" }
            )
            const data = await res.json()
            setResults(data.products ?? [])
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [])

    const handleChange = (q: string) => {
        setQuery(q)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => search(q), 300)
    }

    return { query, setQuery, results, setResults, loading, handleChange }
}

// Slide Form Modal
const SlideFormModal = ({
    isOpen, onClose, slide, onSave, nextSortOrder,
}: {
    isOpen: boolean
    onClose: () => void
    slide: CarouselSlide | null
    onSave: () => void
    nextSortOrder: number
}) => {
    const [loading, setLoading] = useState(false)
    const [showProductSearch, setShowProductSearch] = useState(false)
    const productSearch = useProductSearch()
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        image_url: "",
        cta_text: "",
        cta_link: "",
        product_handle: "",
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
                product_handle: slide.product_handle || "",
                overlay_color: slide.overlay_color || "",
                overlay_opacity: slide.overlay_opacity ?? 40,
                sort_order: slide.sort_order,
                is_active: slide.is_active,
            })
            productSearch.setQuery(slide.product_handle || "")
        } else {
            setFormData({
                title: "",
                subtitle: "",
                description: "",
                image_url: "",
                cta_text: "",
                cta_link: "",
                product_handle: "",
                overlay_color: "",
                overlay_opacity: 40,
                sort_order: nextSortOrder,
                is_active: true,
            })
            productSearch.setQuery("")
        }
    }, [slide, isOpen, nextSortOrder])

    const selectProduct = (product: MedusaProduct) => {
        setFormData((prev) => ({
            ...prev,
            product_handle: product.handle,
            title: prev.title || product.title,
            image_url: prev.image_url || product.thumbnail || "",
        }))
        productSearch.setQuery(product.handle)
        productSearch.setResults([])
        setShowProductSearch(false)
    }

    const clearProduct = () => {
        setFormData((prev) => ({ ...prev, product_handle: "" }))
        productSearch.setQuery("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = slide ? `/admin/carousel-slides/${slide.id}` : "/admin/carousel-slides"
            const method = slide ? "PATCH" : "POST"
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                    product_handle: formData.product_handle || null,
                }),
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
                    <Heading level="h2">{slide ? "Edit Slide" : "Create Slide"}</Heading>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* ── PRODUCT LINK ───────────────────────── */}
                    <div>
                        <Label>Linked Product</Label>
                        <Text size="xsmall" className="text-ui-fg-muted mb-2">
                            Clicking this slide in the storefront will navigate to the product page.
                        </Text>

                        {formData.product_handle ? (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
                                <LinkIcon className="text-ui-fg-muted shrink-0" />
                                <Text size="small" className="flex-1 font-mono">/products/{formData.product_handle}</Text>
                                <Button
                                    type="button"
                                    variant="transparent"
                                    size="small"
                                    onClick={clearProduct}
                                    className="text-ui-fg-muted hover:text-ui-fg-base"
                                >
                                    ✕ Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="small"
                                    onClick={() => setShowProductSearch((v) => !v)}
                                    className="w-full"
                                >
                                    <Plus />
                                    Link a product
                                </Button>

                                {showProductSearch && (
                                    <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-ui-bg-base border border-ui-border-base rounded-lg shadow-lg overflow-hidden">
                                        <div className="p-2 border-b border-ui-border-base">
                                            <Input
                                                autoFocus
                                                placeholder="Search products by name…"
                                                value={productSearch.query}
                                                onChange={(e) => productSearch.handleChange(e.target.value)}
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {productSearch.loading && (
                                                <div className="px-3 py-2">
                                                    <Text size="small" className="text-ui-fg-muted">Searching…</Text>
                                                </div>
                                            )}
                                            {!productSearch.loading && productSearch.results.length === 0 && productSearch.query && (
                                                <div className="px-3 py-2">
                                                    <Text size="small" className="text-ui-fg-muted">No products found</Text>
                                                </div>
                                            )}
                                            {productSearch.results.map((product) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => selectProduct(product)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-ui-bg-hover text-left transition-colors"
                                                >
                                                    {product.thumbnail ? (
                                                        <img
                                                            src={product.thumbnail}
                                                            alt={product.title}
                                                            className="w-8 h-8 rounded object-cover shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded bg-ui-bg-subtle shrink-0 flex items-center justify-center">
                                                            <Photo className="w-4 h-4 text-ui-fg-muted" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <Text size="small" className="font-medium truncate">{product.title}</Text>
                                                        <Text size="xsmall" className="text-ui-fg-muted font-mono truncate">/{product.handle}</Text>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── TITLE ──────────────────────────────── */}
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

                    {/* ── IMAGE URL ──────────────────────────── */}
                    <div>
                        <Label htmlFor="image_url">Image URL *</Label>
                        <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="/bracelet-pearl.png or https://cdn.example.com/image.jpg"
                            required
                        />
                        {formData.image_url && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-ui-border-base">
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="w-full h-32 object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                                />
                            </div>
                        )}
                    </div>

                    {/* ── SUBTITLE ───────────────────────────── */}
                    <div>
                        <Label htmlFor="subtitle">Subtitle (collection label)</Label>
                        <Input
                            id="subtitle"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="e.g., Swarovski Collection"
                        />
                    </div>

                    {/* ── DESCRIPTION ────────────────────────── */}
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Short product description shown on hover"
                            rows={2}
                        />
                    </div>

                    {/* ── CTA (fallback if no product linked) ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cta_text">CTA Text (fallback)</Label>
                            <Input
                                id="cta_text"
                                value={formData.cta_text}
                                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                placeholder="e.g., Shop Now"
                            />
                        </div>
                        <div>
                            <Label htmlFor="cta_link">CTA Link (fallback)</Label>
                            <Input
                                id="cta_link"
                                value={formData.cta_link}
                                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                placeholder="/store or /collections/swarovski"
                            />
                        </div>
                    </div>

                    {/* ── SORT + ACTIVE ──────────────────────── */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
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
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
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
            const response = await fetch("/admin/carousel-slides", { credentials: "include" })
            const data = await response.json()
            setSlides(data.slides || [])
        } catch {
            toast.error("Failed to load slides")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchSlides() }, [fetchSlides])

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this slide?")) return
        try {
            const response = await fetch(`/admin/carousel-slides/${id}`, { method: "DELETE", credentials: "include" })
            if (!response.ok) throw new Error()
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
            if (!response.ok) throw new Error()
            toast.success(slide.is_active ? "Slide deactivated" : "Slide activated")
            fetchSlides()
        } catch {
            toast.error("Failed to update slide")
        }
    }

    const handleMove = async (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= slides.length) return
        const current = slides[index]
        const target = slides[targetIndex]
        try {
            const response = await fetch("/admin/carousel-slides/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    slides: [
                        { id: current.id, sort_order: target.sort_order },
                        { id: target.id, sort_order: current.sort_order },
                    ],
                }),
            })
            if (!response.ok) throw new Error()
            fetchSlides()
        } catch {
            toast.error("Failed to reorder slides")
        }
    }

    const nextSortOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.sort_order)) + 1 : 0

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Heading level="h1" className="flex items-center gap-2">
                        <Photo />
                        Carousel Slides
                    </Heading>
                    <Text className="text-ui-fg-muted mt-1">
                        Manage homepage hero carousel — groups of 3 slides = one carousel page
                    </Text>
                </div>
                <Button onClick={() => { setEditingSlide(null); setShowForm(true) }}>
                    <Plus />
                    Add Slide
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Text className="text-ui-fg-muted">Loading slides…</Text>
                </div>
            ) : slides.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Photo className="w-12 h-12 text-ui-fg-muted mb-4" />
                    <Text className="text-ui-fg-muted mb-4">No carousel slides yet.</Text>
                    <Button variant="secondary" onClick={() => { setEditingSlide(null); setShowForm(true) }}>
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
                            <Table.HeaderCell>Linked Product</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Reorder</Table.HeaderCell>
                            <Table.HeaderCell className="w-12"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {slides.map((slide, index) => (
                            <Table.Row key={slide.id}>
                                <Table.Cell>
                                    <Text className="font-mono text-ui-fg-muted">{slide.sort_order}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="w-16 h-10 rounded overflow-hidden bg-ui-bg-subtle border border-ui-border-base">
                                        <img
                                            src={slide.image_url}
                                            alt={slide.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40'%3E%3Crect width='64' height='40' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23999'%3ENo img%3C/text%3E%3C/svg%3E"
                                            }}
                                        />
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <div>
                                        <Text className="font-medium">{slide.title}</Text>
                                        {slide.subtitle && (
                                            <Text size="xsmall" className="text-ui-fg-muted">{slide.subtitle}</Text>
                                        )}
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    {slide.product_handle ? (
                                        <div className="flex items-center gap-1.5">
                                            <LinkIcon className="w-3.5 h-3.5 text-ui-fg-muted shrink-0" />
                                            <Text size="xsmall" className="font-mono text-ui-fg-subtle truncate max-w-[140px]">
                                                {slide.product_handle}
                                            </Text>
                                        </div>
                                    ) : (
                                        <Text size="small" className="text-ui-fg-disabled">—</Text>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color={slide.is_active ? "green" : "grey"}>
                                        {slide.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="flex gap-1">
                                        <IconButton size="small" variant="transparent" onClick={() => handleMove(index, "up")} disabled={index === 0}>
                                            <ArrowUpMini />
                                        </IconButton>
                                        <IconButton size="small" variant="transparent" onClick={() => handleMove(index, "down")} disabled={index === slides.length - 1}>
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
                                            <DropdownMenu.Item onClick={() => { setEditingSlide(slide); setShowForm(true) }}>
                                                <PencilSquare className="mr-2" />Edit
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item onClick={() => handleToggleActive(slide)}>
                                                {slide.is_active ? (
                                                    <><XCircle className="mr-2" />Deactivate</>
                                                ) : (
                                                    <><CheckCircle className="mr-2" />Activate</>
                                                )}
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Separator />
                                            <DropdownMenu.Item onClick={() => handleDelete(slide.id)} className="text-ui-fg-error">
                                                <Trash className="mr-2" />Delete
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
                onClose={() => { setShowForm(false); setEditingSlide(null) }}
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
