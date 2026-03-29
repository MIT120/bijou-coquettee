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
    Tag,
    Plus,
    EllipsisHorizontal,
    PencilSquare,
    Trash,
    CheckCircle,
    XCircle,
} from "@medusajs/icons"

type SpecialOffer = {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    discount_code: string | null
    discount_percent: number | null
    cta_text: string | null
    cta_link: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

const OfferFormModal = ({
    isOpen,
    onClose,
    offer,
    onSave,
}: {
    isOpen: boolean
    onClose: () => void
    offer: SpecialOffer | null
    onSave: () => void
}) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        discount_code: "",
        discount_percent: 20,
        cta_text: "",
        cta_link: "",
        is_active: false,
    })

    useEffect(() => {
        if (offer) {
            setFormData({
                title: offer.title,
                subtitle: offer.subtitle || "",
                description: offer.description || "",
                discount_code: offer.discount_code || "",
                discount_percent: offer.discount_percent ?? 20,
                cta_text: offer.cta_text || "",
                cta_link: offer.cta_link || "",
                is_active: offer.is_active,
            })
        } else {
            setFormData({
                title: "",
                subtitle: "",
                description: "",
                discount_code: "",
                discount_percent: 20,
                cta_text: "",
                cta_link: "",
                is_active: false,
            })
        }
    }, [offer, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = offer
                ? `/admin/special-offers/${offer.id}`
                : "/admin/special-offers"
            const method = offer ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to save offer")
            }

            toast.success(offer ? "Offer updated" : "Offer created")
            onSave()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save offer")
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
                        {offer ? "Edit Special Offer" : "Create Special Offer"}
                    </Heading>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., -20% на всички бижута"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="subtitle">Subtitle (eyebrow label)</Label>
                        <Input
                            id="subtitle"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="e.g., Специална оферта"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g., Използвай код при поръчка. Валидно за ограничен период."
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="discount_code">Discount Code</Label>
                            <Input
                                id="discount_code"
                                value={formData.discount_code}
                                onChange={(e) => setFormData({ ...formData, discount_code: e.target.value })}
                                placeholder="e.g., BIJOU20"
                            />
                        </div>
                        <div>
                            <Label htmlFor="discount_percent">Discount Percent</Label>
                            <Input
                                id="discount_percent"
                                type="number"
                                min={1}
                                max={100}
                                value={formData.discount_percent}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    discount_percent: parseInt(e.target.value) || 0,
                                })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cta_text">CTA Button Text</Label>
                            <Input
                                id="cta_text"
                                value={formData.cta_text}
                                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                                placeholder="e.g., Пазарувай сега"
                            />
                        </div>
                        <div>
                            <Label htmlFor="cta_link">CTA Link</Label>
                            <Input
                                id="cta_link"
                                value={formData.cta_link}
                                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                placeholder="e.g., /store"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <Label htmlFor="is_active">Active (only one offer can be active at a time)</Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-ui-border-base">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            {offer ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const SpecialOffersPage = () => {
    const [offers, setOffers] = useState<SpecialOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null)

    const fetchOffers = useCallback(async () => {
        try {
            const response = await fetch("/admin/special-offers", { credentials: "include" })
            const data = await response.json()
            setOffers(data.offers || [])
        } catch {
            toast.error("Failed to load offers")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchOffers() }, [fetchOffers])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this offer?")) return
        try {
            const response = await fetch(`/admin/special-offers/${id}`, {
                method: "DELETE", credentials: "include",
            })
            if (!response.ok) throw new Error("Failed to delete")
            toast.success("Offer deleted")
            fetchOffers()
        } catch { toast.error("Failed to delete offer") }
    }

    const handleToggleActive = async (offer: SpecialOffer) => {
        try {
            const response = await fetch(`/admin/special-offers/${offer.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_active: !offer.is_active }),
            })
            if (!response.ok) throw new Error("Failed to update")
            toast.success(offer.is_active ? "Offer deactivated" : "Offer activated")
            fetchOffers()
        } catch { toast.error("Failed to update offer") }
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Heading level="h1" className="flex items-center gap-2">
                        <Tag />
                        Special Offers
                    </Heading>
                    <Text className="text-ui-fg-muted mt-1">
                        Manage the special offer section on the homepage. Only one offer can be active at a time.
                    </Text>
                </div>
                <Button onClick={() => { setEditingOffer(null); setShowForm(true) }}>
                    <Plus />
                    Add Offer
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Text className="text-ui-fg-muted">Loading offers...</Text>
                </div>
            ) : offers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Tag className="w-12 h-12 text-ui-fg-muted mb-4" />
                    <Text className="text-ui-fg-muted mb-4">
                        No special offers yet. The default offer will be shown on the storefront.
                    </Text>
                    <Button variant="secondary" onClick={() => { setEditingOffer(null); setShowForm(true) }}>
                        <Plus />
                        Create First Offer
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Code</Table.HeaderCell>
                            <Table.HeaderCell>Discount</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                            <Table.HeaderCell className="w-12"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {offers.map((offer) => (
                            <Table.Row key={offer.id}>
                                <Table.Cell>
                                    <div>
                                        <Text className="font-medium">{offer.title}</Text>
                                        {offer.subtitle && (
                                            <Text size="xsmall" className="text-ui-fg-muted">{offer.subtitle}</Text>
                                        )}
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text className="font-mono">{offer.discount_code || "-"}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text>{offer.discount_percent ? `${offer.discount_percent}%` : "-"}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color={offer.is_active ? "green" : "grey"}>
                                        {offer.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <DropdownMenu>
                                        <DropdownMenu.Trigger asChild>
                                            <IconButton size="small" variant="transparent"><EllipsisHorizontal /></IconButton>
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Content>
                                            <DropdownMenu.Item onClick={() => { setEditingOffer(offer); setShowForm(true) }}>
                                                <PencilSquare className="mr-2" />Edit
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item onClick={() => handleToggleActive(offer)}>
                                                {offer.is_active ? (<><XCircle className="mr-2" />Deactivate</>) : (<><CheckCircle className="mr-2" />Activate</>)}
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Separator />
                                            <DropdownMenu.Item onClick={() => handleDelete(offer.id)} className="text-ui-fg-error">
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

            <OfferFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingOffer(null) }}
                offer={editingOffer}
                onSave={fetchOffers}
            />
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Special Offers",
    icon: Tag,
})

export default SpecialOffersPage
