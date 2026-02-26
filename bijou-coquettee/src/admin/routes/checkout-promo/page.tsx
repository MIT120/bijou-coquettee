import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag } from "@medusajs/icons"
import {
    Container,
    Heading,
    Table,
    Button,
    Input,
    Label,
    Textarea,
    Switch,
    DropdownMenu,
    Badge,
    Text,
    IconButton,
    toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { EllipsisHorizontal } from "@medusajs/icons"

type CheckoutPromo = {
    id: string
    product_id: string
    variant_id: string
    heading: string | null
    description: string | null
    discount_percent: number | null
    promotion_code: string | null
    promotion_id: string | null
    is_active: boolean
    created_at: string
}

type FormData = {
    product_id: string
    variant_id: string
    heading: string
    description: string
    discount_percent: string
    is_active: boolean
}

const emptyForm: FormData = {
    product_id: "",
    variant_id: "",
    heading: "",
    description: "",
    discount_percent: "",
    is_active: false,
}

function PromoFormModal({
    open,
    onClose,
    onSave,
    editing,
}: {
    open: boolean
    onClose: () => void
    onSave: (data: FormData) => Promise<void>
    editing: CheckoutPromo | null
}) {
    const [form, setForm] = useState<FormData>(emptyForm)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (editing) {
            setForm({
                product_id: editing.product_id,
                variant_id: editing.variant_id,
                heading: editing.heading || "",
                description: editing.description || "",
                discount_percent: editing.discount_percent?.toString() || "",
                is_active: editing.is_active,
            })
        } else {
            setForm(emptyForm)
        }
    }, [editing, open])

    if (!open) return null

    const handleSubmit = async () => {
        if (!form.product_id || !form.variant_id) {
            toast.error("Error", {
                description: "Product ID and Variant ID are required",
            })
            return
        }
        setSaving(true)
        try {
            await onSave(form)
            onClose()
        } catch (e: any) {
            toast.error("Error", { description: e.message || "Failed to save" })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                <Heading level="h2" className="mb-4">
                    {editing ? "Edit Checkout Promo" : "Create Checkout Promo"}
                </Heading>

                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="product_id">Product ID *</Label>
                        <Input
                            id="product_id"
                            placeholder="prod_01ABC..."
                            value={form.product_id}
                            onChange={(e) =>
                                setForm({ ...form, product_id: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="variant_id">Variant ID *</Label>
                        <Input
                            id="variant_id"
                            placeholder="variant_01ABC..."
                            value={form.variant_id}
                            onChange={(e) =>
                                setForm({ ...form, variant_id: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="heading">Heading</Label>
                        <Input
                            id="heading"
                            placeholder="Complete Your Look"
                            value={form.heading}
                            onChange={(e) =>
                                setForm({ ...form, heading: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Add a matching bracelet to your order"
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="discount_percent">Discount % (0 = no discount)</Label>
                        <Input
                            id="discount_percent"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={form.discount_percent}
                            onChange={(e) =>
                                setForm({ ...form, discount_percent: e.target.value })
                            }
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch
                            id="is_active"
                            checked={form.is_active}
                            onCheckedChange={(checked) =>
                                setForm({ ...form, is_active: checked })
                            }
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} isLoading={saving}>
                        {editing ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

const CheckoutPromoPage = () => {
    const [promos, setPromos] = useState<CheckoutPromo[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingPromo, setEditingPromo] = useState<CheckoutPromo | null>(null)

    const fetchPromos = async () => {
        try {
            const res = await fetch("/admin/checkout-promo", {
                credentials: "include",
            })
            const data = await res.json()
            setPromos(data.promos || [])
        } catch (e) {
            toast.error("Error", { description: "Failed to load promos" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPromos()
    }, [])

    const handleSave = async (form: FormData) => {
        const body: Record<string, any> = {
            product_id: form.product_id,
            variant_id: form.variant_id,
            heading: form.heading || null,
            description: form.description || null,
            discount_percent: form.discount_percent
                ? parseInt(form.discount_percent)
                : null,
            is_active: form.is_active,
        }

        const url = editingPromo
            ? `/admin/checkout-promo/${editingPromo.id}`
            : "/admin/checkout-promo"

        const res = await fetch(url, {
            method: editingPromo ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || "Request failed")
        }

        toast.success("Success", {
            description: editingPromo ? "Promo updated" : "Promo created",
        })
        await fetchPromos()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this checkout promo?")) return

        try {
            const res = await fetch(`/admin/checkout-promo/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (!res.ok) throw new Error()
            toast.success("Success", { description: "Promo deleted" })
            await fetchPromos()
        } catch {
            toast.error("Error", { description: "Failed to delete promo" })
        }
    }

    const handleToggleActive = async (promo: CheckoutPromo) => {
        try {
            const res = await fetch(`/admin/checkout-promo/${promo.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_active: !promo.is_active }),
            })
            if (!res.ok) throw new Error()
            toast.success("Success", {
                description: promo.is_active ? "Promo deactivated" : "Promo activated",
            })
            await fetchPromos()
        } catch {
            toast.error("Error", { description: "Failed to toggle promo" })
        }
    }

    if (loading) {
        return (
            <Container className="p-8">
                <Text>Loading...</Text>
            </Container>
        )
    }

    return (
        <Container className="p-8">
            <div className="flex justify-between items-center mb-6">
                <Heading level="h1">Checkout Promo</Heading>
                <Button
                    onClick={() => {
                        setEditingPromo(null)
                        setShowForm(true)
                    }}
                >
                    Create Promo
                </Button>
            </div>

            <Text className="text-ui-fg-subtle mb-6">
                Configure a promotional product to display in the checkout sidebar.
                Only one promo can be active at a time.
            </Text>

            {promos.length === 0 ? (
                <div className="text-center py-12">
                    <Text className="text-ui-fg-subtle mb-4">
                        No checkout promos configured yet.
                    </Text>
                    <Button
                        onClick={() => {
                            setEditingPromo(null)
                            setShowForm(true)
                        }}
                    >
                        Create First Promo
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Heading</Table.HeaderCell>
                            <Table.HeaderCell>Product ID</Table.HeaderCell>
                            <Table.HeaderCell>Discount</Table.HeaderCell>
                            <Table.HeaderCell>Promo Code</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell className="text-right">
                                Actions
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {promos.map((promo) => (
                            <Table.Row key={promo.id}>
                                <Table.Cell>
                                    {promo.heading || "No heading"}
                                </Table.Cell>
                                <Table.Cell>
                                    <code className="text-xs">
                                        {promo.product_id.slice(0, 20)}...
                                    </code>
                                </Table.Cell>
                                <Table.Cell>
                                    {promo.discount_percent
                                        ? `${promo.discount_percent}%`
                                        : "-"}
                                </Table.Cell>
                                <Table.Cell>
                                    {promo.promotion_code ? (
                                        <code className="text-xs">
                                            {promo.promotion_code}
                                        </code>
                                    ) : (
                                        "-"
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge
                                        color={promo.is_active ? "green" : "grey"}
                                    >
                                        {promo.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenu.Trigger asChild>
                                            <IconButton variant="transparent">
                                                <EllipsisHorizontal />
                                            </IconButton>
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Content>
                                            <DropdownMenu.Item
                                                onClick={() => {
                                                    setEditingPromo(promo)
                                                    setShowForm(true)
                                                }}
                                            >
                                                Edit
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item
                                                onClick={() =>
                                                    handleToggleActive(promo)
                                                }
                                            >
                                                {promo.is_active
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Separator />
                                            <DropdownMenu.Item
                                                onClick={() =>
                                                    handleDelete(promo.id)
                                                }
                                                className="text-red-500"
                                            >
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

            <PromoFormModal
                open={showForm}
                onClose={() => {
                    setShowForm(false)
                    setEditingPromo(null)
                }}
                onSave={handleSave}
                editing={editingPromo}
            />
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Checkout Promo",
    icon: ShoppingBag,
})

export default CheckoutPromoPage
