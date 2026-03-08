import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag, MagnifyingGlass } from "@medusajs/icons"
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
    Select,
} from "@medusajs/ui"
import { useEffect, useState, useRef, useCallback } from "react"
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

type AdminProduct = {
    id: string
    title: string
    thumbnail: string | null
    variants: Array<{
        id: string
        title: string
    }>
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

// Product search hook with 300ms debounce
function useProductSearch() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<AdminProduct[]>([])
    const [searching, setSearching] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const search = useCallback((term: string) => {
        setQuery(term)
        if (timerRef.current) clearTimeout(timerRef.current)

        if (!term.trim()) {
            setResults([])
            return
        }

        timerRef.current = setTimeout(async () => {
            setSearching(true)
            try {
                const res = await fetch(
                    `/admin/products?q=${encodeURIComponent(term)}&limit=10`,
                    { credentials: "include" }
                )
                const data = await res.json()
                setResults(data.products || [])
            } catch {
                setResults([])
            } finally {
                setSearching(false)
            }
        }, 300)
    }, [])

    const clear = useCallback(() => {
        setQuery("")
        setResults([])
        if (timerRef.current) clearTimeout(timerRef.current)
    }, [])

    return { query, results, searching, search, clear }
}

function ProductSearchField({
    onSelect,
    initialProductId,
}: {
    onSelect: (product: AdminProduct) => void
    initialProductId?: string
}) {
    const { query, results, searching, search, clear } = useProductSearch()
    const [selectedTitle, setSelectedTitle] = useState("")
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Fetch the product title when editing an existing promo
    useEffect(() => {
        if (!initialProductId) return
        const fetchTitle = async () => {
            try {
                const res = await fetch(`/admin/products/${initialProductId}`, {
                    credentials: "include",
                })
                const data = await res.json()
                if (data.product?.title) {
                    setSelectedTitle(data.product.title)
                }
            } catch {
                // silently ignore — the manual ID field is still populated
            }
        }
        fetchTitle()
    }, [initialProductId])

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleSelect = (product: AdminProduct) => {
        setSelectedTitle(product.title)
        setOpen(false)
        clear()
        onSelect(product)
    }

    const handleInput = (value: string) => {
        setSelectedTitle("")
        setOpen(true)
        search(value)
    }

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-fg-muted w-4 h-4" />
                <Input
                    placeholder="Search products by name..."
                    value={selectedTitle || query}
                    onChange={(e) => handleInput(e.target.value)}
                    onFocus={() => {
                        if (query) setOpen(true)
                    }}
                    className="pl-8"
                />
            </div>

            {open && (query || searching) && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-ui-bg-base border border-ui-border-base rounded-lg shadow-elevation-flyout max-h-60 overflow-y-auto">
                    {searching && (
                        <div className="px-3 py-2 text-xs text-ui-fg-muted">
                            Searching...
                        </div>
                    )}
                    {!searching && results.length === 0 && query && (
                        <div className="px-3 py-2 text-xs text-ui-fg-muted">
                            No products found
                        </div>
                    )}
                    {results.map((product) => (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSelect(product)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-ui-bg-subtle transition-colors"
                        >
                            {product.thumbnail ? (
                                <img
                                    src={product.thumbnail}
                                    alt={product.title}
                                    className="w-8 h-8 object-cover rounded flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-ui-bg-subtle rounded flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                                <p className="text-sm text-ui-fg-base font-medium truncate">
                                    {product.title}
                                </p>
                                <p className="text-xs text-ui-fg-muted truncate">
                                    {product.variants.length} variant
                                    {product.variants.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
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
    const [selectedProduct, setSelectedProduct] =
        useState<AdminProduct | null>(null)
    const [showManualIds, setShowManualIds] = useState(false)

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
            setSelectedProduct(null)
            setShowManualIds(false)
        } else {
            setForm(emptyForm)
            setSelectedProduct(null)
            setShowManualIds(false)
        }
    }, [editing, open])

    if (!open) return null

    const handleProductSelect = (product: AdminProduct) => {
        setSelectedProduct(product)
        setForm((prev) => ({
            ...prev,
            product_id: product.id,
            variant_id: "",
        }))
    }

    const handleVariantSelect = (variantId: string) => {
        setForm((prev) => ({ ...prev, variant_id: variantId }))
    }

    const handleSubmit = async () => {
        if (!form.product_id || !form.variant_id) {
            toast.error("Error", {
                description: "A product and variant are required",
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

    // Variants available from selected product or empty when editing
    const variantOptions = selectedProduct?.variants ?? []

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-bg-overlay">
            <div className="bg-ui-bg-base text-ui-fg-base rounded-lg shadow-elevation-modal w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 border border-ui-border-base">
                <Heading level="h2" className="mb-4">
                    {editing ? "Edit Checkout Promo" : "Create Checkout Promo"}
                </Heading>

                <div className="flex flex-col gap-5">
                    {/* Product search */}
                    <div>
                        <Label className="mb-1.5 block">
                            Product *
                        </Label>
                        <ProductSearchField
                            onSelect={handleProductSelect}
                            initialProductId={editing?.product_id}
                        />
                        {form.product_id && (
                            <p className="mt-1 text-xs text-ui-fg-muted font-mono">
                                {form.product_id}
                            </p>
                        )}
                    </div>

                    {/* Variant select — shown when a product has been picked via search */}
                    {variantOptions.length > 0 && (
                        <div>
                            <Label className="mb-1.5 block">Variant *</Label>
                            <Select
                                value={form.variant_id}
                                onValueChange={handleVariantSelect}
                            >
                                <Select.Trigger>
                                    <Select.Value placeholder="Select a variant..." />
                                </Select.Trigger>
                                <Select.Content>
                                    {variantOptions.map((v) => (
                                        <Select.Item key={v.id} value={v.id}>
                                            {v.title}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select>
                            {form.variant_id && (
                                <p className="mt-1 text-xs text-ui-fg-muted font-mono">
                                    {form.variant_id}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Manual ID toggle */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowManualIds((v) => !v)}
                            className="text-xs text-ui-fg-muted underline hover:text-ui-fg-base transition-colors"
                        >
                            {showManualIds
                                ? "Hide manual ID fields"
                                : "Enter IDs manually"}
                        </button>

                        {showManualIds && (
                            <div className="mt-3 flex flex-col gap-3 p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                                <Text className="text-xs text-ui-fg-muted">
                                    Use these fields to paste product/variant IDs directly.
                                    They override any selection above.
                                </Text>
                                <div>
                                    <Label htmlFor="product_id_manual">
                                        Product ID
                                    </Label>
                                    <Input
                                        id="product_id_manual"
                                        placeholder="prod_01ABC..."
                                        value={form.product_id}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                product_id: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="variant_id_manual">
                                        Variant ID
                                    </Label>
                                    <Input
                                        id="variant_id_manual"
                                        placeholder="variant_01ABC..."
                                        value={form.variant_id}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                variant_id: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        )}
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
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="discount_percent">
                            Discount % (0 = no discount)
                        </Label>
                        <Input
                            id="discount_percent"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={form.discount_percent}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    discount_percent: e.target.value,
                                })
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
                description: promo.is_active
                    ? "Promo deactivated"
                    : "Promo activated",
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
                Configure a promotional product to display in the checkout
                sidebar. Only one promo can be active at a time.
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
                                        color={
                                            promo.is_active ? "green" : "grey"
                                        }
                                    >
                                        {promo.is_active
                                            ? "Active"
                                            : "Inactive"}
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
