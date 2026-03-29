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
    Select,
    toast,
} from "@medusajs/ui"
import {
    Star,
    Plus,
    EllipsisHorizontal,
    PencilSquare,
    Trash,
    ArrowUpMini,
    ArrowDownMini,
    CheckCircle,
    XCircle,
} from "@medusajs/icons"

type ServiceHighlight = {
    id: string
    title: string
    description: string | null
    icon_name: string
    sort_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

const ICON_OPTIONS = [
    { value: "shipping", label: "Shipping (truck)" },
    { value: "payment", label: "Secure Payment (shield)" },
    { value: "authenticity", label: "Authenticity (badge)" },
    { value: "return", label: "Easy Return (arrow)" },
    { value: "handmade", label: "Handmade (star)" },
    { value: "quality", label: "Quality (diamond)" },
    { value: "gift", label: "Gift (box)" },
    { value: "heart", label: "Heart" },
]

const HighlightFormModal = ({
    isOpen,
    onClose,
    highlight,
    onSave,
    nextSortOrder,
}: {
    isOpen: boolean
    onClose: () => void
    highlight: ServiceHighlight | null
    onSave: () => void
    nextSortOrder: number
}) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        icon_name: "shipping",
        sort_order: 0,
        is_active: true,
    })

    useEffect(() => {
        if (highlight) {
            setFormData({
                title: highlight.title,
                description: highlight.description || "",
                icon_name: highlight.icon_name,
                sort_order: highlight.sort_order,
                is_active: highlight.is_active,
            })
        } else {
            setFormData({
                title: "",
                description: "",
                icon_name: "shipping",
                sort_order: nextSortOrder,
                is_active: true,
            })
        }
    }, [highlight, isOpen, nextSortOrder])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = highlight
                ? `/admin/service-highlights/${highlight.id}`
                : "/admin/service-highlights"
            const method = highlight ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to save highlight")
            }

            toast.success(highlight ? "Highlight updated" : "Highlight created")
            onSave()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save highlight")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-ui-bg-base rounded-lg shadow-xl w-full max-w-lg">
                <div className="border-b border-ui-border-base px-6 py-4">
                    <Heading level="h2">
                        {highlight ? "Edit Service Highlight" : "Create Service Highlight"}
                    </Heading>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Безплатна доставка"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g., За поръчки над 80 лв."
                        />
                    </div>

                    <div>
                        <Label htmlFor="icon_name">Icon</Label>
                        <Select
                            value={formData.icon_name}
                            onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
                        >
                            <Select.Trigger>
                                <Select.Value placeholder="Select icon" />
                            </Select.Trigger>
                            <Select.Content className="!z-[9999]">
                                {ICON_OPTIONS.map((opt) => (
                                    <Select.Item key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select>
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
                                    sort_order: parseInt(e.target.value) || 0,
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
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            {highlight ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const ServiceHighlightsPage = () => {
    const [highlights, setHighlights] = useState<ServiceHighlight[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingHighlight, setEditingHighlight] = useState<ServiceHighlight | null>(null)

    const fetchHighlights = useCallback(async () => {
        try {
            const response = await fetch("/admin/service-highlights", { credentials: "include" })
            const data = await response.json()
            setHighlights(data.highlights || [])
        } catch {
            toast.error("Failed to load highlights")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchHighlights() }, [fetchHighlights])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this highlight?")) return
        try {
            const response = await fetch(`/admin/service-highlights/${id}`, {
                method: "DELETE", credentials: "include",
            })
            if (!response.ok) throw new Error("Failed to delete")
            toast.success("Highlight deleted")
            fetchHighlights()
        } catch { toast.error("Failed to delete highlight") }
    }

    const handleToggleActive = async (h: ServiceHighlight) => {
        try {
            const response = await fetch(`/admin/service-highlights/${h.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_active: !h.is_active }),
            })
            if (!response.ok) throw new Error("Failed to update")
            toast.success(h.is_active ? "Highlight deactivated" : "Highlight activated")
            fetchHighlights()
        } catch { toast.error("Failed to update highlight") }
    }

    const handleReorder = async (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= highlights.length) return

        try {
            const response = await fetch("/admin/service-highlights/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    highlights: [
                        { id: highlights[index].id, sort_order: highlights[targetIndex].sort_order },
                        { id: highlights[targetIndex].id, sort_order: highlights[index].sort_order },
                    ],
                }),
            })
            if (!response.ok) throw new Error("Failed to reorder")
            fetchHighlights()
        } catch { toast.error("Failed to reorder highlights") }
    }

    const nextSortOrder = highlights.length > 0
        ? Math.max(...highlights.map((h) => h.sort_order)) + 1
        : 0

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Heading level="h1" className="flex items-center gap-2">
                        <Star />
                        Service Highlights
                    </Heading>
                    <Text className="text-ui-fg-muted mt-1">
                        Manage service badges displayed on the homepage (free shipping, secure payment, etc.)
                    </Text>
                </div>
                <Button onClick={() => { setEditingHighlight(null); setShowForm(true) }}>
                    <Plus />
                    Add Highlight
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Text className="text-ui-fg-muted">Loading highlights...</Text>
                </div>
            ) : highlights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Star className="w-12 h-12 text-ui-fg-muted mb-4" />
                    <Text className="text-ui-fg-muted mb-4">
                        No service highlights yet. Default highlights will be shown on the storefront.
                    </Text>
                    <Button variant="secondary" onClick={() => { setEditingHighlight(null); setShowForm(true) }}>
                        <Plus />
                        Create First Highlight
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell className="w-16">Order</Table.HeaderCell>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Description</Table.HeaderCell>
                            <Table.HeaderCell className="w-28">Icon</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Reorder</Table.HeaderCell>
                            <Table.HeaderCell className="w-12"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {highlights.map((h, index) => (
                            <Table.Row key={h.id}>
                                <Table.Cell>
                                    <Text className="font-mono text-ui-fg-muted">{h.sort_order}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text className="font-medium">{h.title}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="small" className="text-ui-fg-muted">
                                        {h.description || "-"}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color="blue">{h.icon_name}</Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color={h.is_active ? "green" : "grey"}>
                                        {h.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="flex gap-1">
                                        <IconButton size="small" variant="transparent" onClick={() => handleReorder(index, "up")} disabled={index === 0}>
                                            <ArrowUpMini />
                                        </IconButton>
                                        <IconButton size="small" variant="transparent" onClick={() => handleReorder(index, "down")} disabled={index === highlights.length - 1}>
                                            <ArrowDownMini />
                                        </IconButton>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <DropdownMenu>
                                        <DropdownMenu.Trigger asChild>
                                            <IconButton size="small" variant="transparent"><EllipsisHorizontal /></IconButton>
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Content>
                                            <DropdownMenu.Item onClick={() => { setEditingHighlight(h); setShowForm(true) }}>
                                                <PencilSquare className="mr-2" />Edit
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item onClick={() => handleToggleActive(h)}>
                                                {h.is_active ? (<><XCircle className="mr-2" />Deactivate</>) : (<><CheckCircle className="mr-2" />Activate</>)}
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Separator />
                                            <DropdownMenu.Item onClick={() => handleDelete(h.id)} className="text-ui-fg-error">
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

            <HighlightFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingHighlight(null) }}
                highlight={editingHighlight}
                onSave={fetchHighlights}
                nextSortOrder={nextSortOrder}
            />
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Service Highlights",
    icon: Star,
})

export default ServiceHighlightsPage
