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
    Plus,
    EllipsisHorizontal,
    PencilSquare,
    Trash,
    ArrowUpMini,
    ArrowDownMini,
    CheckCircle,
    XCircle,
    AcademicCap,
} from "@medusajs/icons"

type Certificate = {
    id: string
    title: string
    description: string | null
    image_url: string
    link: string | null
    sort_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

const CertificateFormModal = ({
    isOpen,
    onClose,
    certificate,
    onSave,
    nextSortOrder,
}: {
    isOpen: boolean
    onClose: () => void
    certificate: Certificate | null
    onSave: () => void
    nextSortOrder: number
}) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image_url: "",
        link: "",
        sort_order: 0,
        is_active: true,
    })

    useEffect(() => {
        if (certificate) {
            setFormData({
                title: certificate.title,
                description: certificate.description || "",
                image_url: certificate.image_url,
                link: certificate.link || "",
                sort_order: certificate.sort_order,
                is_active: certificate.is_active,
            })
        } else {
            setFormData({
                title: "",
                description: "",
                image_url: "",
                link: "",
                sort_order: nextSortOrder,
                is_active: true,
            })
        }
    }, [certificate, isOpen, nextSortOrder])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = certificate
                ? `/admin/certificates/${certificate.id}`
                : "/admin/certificates"
            const method = certificate ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to save certificate")
            }

            toast.success(certificate ? "Certificate updated" : "Certificate created")
            onSave()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save certificate")
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
                        {certificate ? "Edit Certificate" : "Create Certificate"}
                    </Heading>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., ISO 9001 Certified"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="image_url">Image URL *</Label>
                        <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="e.g., /certificate-iso.png or https://cdn.example.com/cert.jpg"
                            required
                        />
                        {formData.image_url && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-ui-border-base bg-ui-bg-subtle p-2">
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="w-full h-32 object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none"
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g., Quality management certification for our production processes."
                            rows={2}
                        />
                    </div>

                    <div>
                        <Label htmlFor="link">Link (optional)</Label>
                        <Input
                            id="link"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            placeholder="e.g., https://example.com/certificate-details"
                        />
                        <Text size="xsmall" className="text-ui-fg-muted mt-1">
                            External URL for more details about this certificate
                        </Text>
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
                            {certificate ? "Update Certificate" : "Create Certificate"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const CertificatesPage = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)

    const fetchCertificates = useCallback(async () => {
        try {
            const response = await fetch("/admin/certificates", {
                credentials: "include",
            })
            const data = await response.json()
            setCertificates(data.certificates || [])
        } catch (error) {
            toast.error("Failed to load certificates")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCertificates()
    }, [fetchCertificates])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this certificate?")) return

        try {
            const response = await fetch(`/admin/certificates/${id}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Certificate deleted")
            fetchCertificates()
        } catch {
            toast.error("Failed to delete certificate")
        }
    }

    const handleToggleActive = async (certificate: Certificate) => {
        try {
            const response = await fetch(`/admin/certificates/${certificate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_active: !certificate.is_active }),
            })

            if (!response.ok) throw new Error("Failed to update")

            toast.success(certificate.is_active ? "Certificate deactivated" : "Certificate activated")
            fetchCertificates()
        } catch {
            toast.error("Failed to update certificate")
        }
    }

    const handleMoveUp = async (index: number) => {
        if (index === 0) return

        const current = certificates[index]
        const above = certificates[index - 1]

        try {
            const response = await fetch("/admin/certificates/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    certificates: [
                        { id: current.id, sort_order: above.sort_order },
                        { id: above.id, sort_order: current.sort_order },
                    ],
                }),
            })

            if (!response.ok) throw new Error("Failed to reorder")

            fetchCertificates()
        } catch {
            toast.error("Failed to reorder certificates")
        }
    }

    const handleMoveDown = async (index: number) => {
        if (index === certificates.length - 1) return

        const current = certificates[index]
        const below = certificates[index + 1]

        try {
            const response = await fetch("/admin/certificates/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    certificates: [
                        { id: current.id, sort_order: below.sort_order },
                        { id: below.id, sort_order: current.sort_order },
                    ],
                }),
            })

            if (!response.ok) throw new Error("Failed to reorder")

            fetchCertificates()
        } catch {
            toast.error("Failed to reorder certificates")
        }
    }

    const nextSortOrder = certificates.length > 0
        ? Math.max(...certificates.map((c) => c.sort_order)) + 1
        : 0

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Heading level="h1" className="flex items-center gap-2">
                        <AcademicCap />
                        Certificates
                    </Heading>
                    <Text className="text-ui-fg-muted mt-1">
                        Manage quality certifications, awards, and trust badges
                    </Text>
                </div>
                <Button
                    onClick={() => {
                        setEditingCertificate(null)
                        setShowForm(true)
                    }}
                >
                    <Plus />
                    Add Certificate
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Text className="text-ui-fg-muted">Loading certificates...</Text>
                </div>
            ) : certificates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AcademicCap className="w-12 h-12 text-ui-fg-muted mb-4" />
                    <Text className="text-ui-fg-muted mb-4">
                        No certificates yet. Create your first certificate to get started.
                    </Text>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setEditingCertificate(null)
                            setShowForm(true)
                        }}
                    >
                        <Plus />
                        Create First Certificate
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell className="w-16">Order</Table.HeaderCell>
                            <Table.HeaderCell className="w-20">Image</Table.HeaderCell>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Link</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Reorder</Table.HeaderCell>
                            <Table.HeaderCell className="w-12"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {certificates.map((cert, index) => (
                            <Table.Row key={cert.id}>
                                <Table.Cell>
                                    <Text className="font-mono text-ui-fg-muted">
                                        {cert.sort_order}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="w-16 h-10 rounded overflow-hidden bg-ui-bg-subtle border border-ui-border-base p-1">
                                        <img
                                            src={cert.image_url}
                                            alt={cert.title}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40' fill='%23ccc'%3E%3Crect width='64' height='40' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23999'%3ENo img%3C/text%3E%3C/svg%3E"
                                            }}
                                        />
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <div>
                                        <Text className="font-medium">{cert.title}</Text>
                                        {cert.description && (
                                            <Text size="xsmall" className="text-ui-fg-muted">
                                                {cert.description}
                                            </Text>
                                        )}
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    {cert.link ? (
                                        <a
                                            href={cert.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-ui-fg-interactive text-sm hover:underline"
                                        >
                                            View
                                        </a>
                                    ) : (
                                        <Text size="small" className="text-ui-fg-disabled">
                                            -
                                        </Text>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color={cert.is_active ? "green" : "grey"}>
                                        {cert.is_active ? "Active" : "Inactive"}
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
                                            disabled={index === certificates.length - 1}
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
                                                    setEditingCertificate(cert)
                                                    setShowForm(true)
                                                }}
                                            >
                                                <PencilSquare className="mr-2" />
                                                Edit
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item
                                                onClick={() => handleToggleActive(cert)}
                                            >
                                                {cert.is_active ? (
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
                                                onClick={() => handleDelete(cert.id)}
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

            <CertificateFormModal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false)
                    setEditingCertificate(null)
                }}
                certificate={editingCertificate}
                onSave={fetchCertificates}
                nextSortOrder={nextSortOrder}
            />
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Certificates",
    icon: AcademicCap,
})

export default CertificatesPage
