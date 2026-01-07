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
    DatePicker,
    toast,
} from "@medusajs/ui"
import {
    EnvelopeSolid,
    Plus,
    EllipsisHorizontal,
    CheckCircle,
    Clock,
    XCircle,
    PencilSquare,
    Trash,
    ArrowDownTray,
    Eye,
} from "@medusajs/icons"

type CampaignStats = {
    total_subscriptions: number
    codes_used: number
    conversion_rate: number
}

type EmailCampaign = {
    id: string
    name: string
    code_prefix: string
    discount_percent: number
    start_date: string
    end_date: string
    is_active: boolean
    popup_title: string | null
    popup_description: string | null
    max_uses_per_code: number
    // Banner settings
    banner_enabled: boolean
    banner_text: string | null
    banner_cta_text: string | null
    banner_cta_link: string | null
    banner_bg_color: string | null
    created_at: string
    stats: CampaignStats
}

type EmailSubscription = {
    id: string
    campaign_id: string
    email: string
    discount_code: string
    subscribed_at: string
    used_at: string | null
    usage_count: number
}

const getCampaignStatus = (campaign: EmailCampaign): "active" | "scheduled" | "expired" | "inactive" => {
    if (!campaign.is_active) return "inactive"
    const now = new Date()
    const start = new Date(campaign.start_date)
    const end = new Date(campaign.end_date)
    if (now < start) return "scheduled"
    if (now > end) return "expired"
    return "active"
}

const STATUS_CONFIG = {
    active: { color: "green" as const, label: "Active" },
    scheduled: { color: "blue" as const, label: "Scheduled" },
    expired: { color: "grey" as const, label: "Expired" },
    inactive: { color: "red" as const, label: "Inactive" },
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

// Campaign Form Modal
const CampaignFormModal = ({
    isOpen,
    onClose,
    campaign,
    onSave,
}: {
    isOpen: boolean
    onClose: () => void
    campaign: EmailCampaign | null
    onSave: () => void
}) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        code_prefix: "",
        discount_percent: 5,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        popup_title: "",
        popup_description: "",
        max_uses_per_code: 1,
        is_active: true,
        // Banner settings
        banner_enabled: false,
        banner_text: "",
        banner_cta_text: "",
        banner_cta_link: "",
        banner_bg_color: "",
    })

    useEffect(() => {
        if (campaign) {
            setFormData({
                name: campaign.name,
                code_prefix: campaign.code_prefix,
                discount_percent: campaign.discount_percent,
                start_date: new Date(campaign.start_date),
                end_date: new Date(campaign.end_date),
                popup_title: campaign.popup_title || "",
                popup_description: campaign.popup_description || "",
                max_uses_per_code: campaign.max_uses_per_code,
                is_active: campaign.is_active,
                // Banner settings
                banner_enabled: campaign.banner_enabled || false,
                banner_text: campaign.banner_text || "",
                banner_cta_text: campaign.banner_cta_text || "",
                banner_cta_link: campaign.banner_cta_link || "",
                banner_bg_color: campaign.banner_bg_color || "",
            })
        } else {
            setFormData({
                name: "",
                code_prefix: "",
                discount_percent: 5,
                start_date: new Date(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                popup_title: "",
                popup_description: "",
                max_uses_per_code: 1,
                is_active: true,
                // Banner settings
                banner_enabled: false,
                banner_text: "",
                banner_cta_text: "",
                banner_cta_link: "",
                banner_bg_color: "",
            })
        }
    }, [campaign, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = campaign
                ? `/admin/email-campaigns/${campaign.id}`
                : "/admin/email-campaigns"
            const method = campaign ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                    start_date: formData.start_date.toISOString(),
                    end_date: formData.end_date.toISOString(),
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to save campaign")
            }

            toast.success(campaign ? "Campaign updated" : "Campaign created")
            onSave()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save campaign")
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
                        {campaign ? "Edit Campaign" : "Create Campaign"}
                    </Heading>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="name">Campaign Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Welcome Discount"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="code_prefix">Code Prefix *</Label>
                            <Input
                                id="code_prefix"
                                value={formData.code_prefix}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    code_prefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                                })}
                                placeholder="e.g., WELCOME"
                                maxLength={10}
                                required
                            />
                            <Text size="xsmall" className="text-ui-fg-muted mt-1">
                                Codes will be: {formData.code_prefix || "PREFIX"}-XXXXXX
                            </Text>
                        </div>
                        <div>
                            <Label htmlFor="discount_percent">Discount % *</Label>
                            <Input
                                id="discount_percent"
                                type="number"
                                min={1}
                                max={100}
                                value={formData.discount_percent}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    discount_percent: parseInt(e.target.value) || 0
                                })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Start Date *</Label>
                            <DatePicker
                                value={formData.start_date}
                                onChange={(date) => date && setFormData({ ...formData, start_date: date })}
                            />
                        </div>
                        <div>
                            <Label>End Date *</Label>
                            <DatePicker
                                value={formData.end_date}
                                onChange={(date) => date && setFormData({ ...formData, end_date: date })}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="popup_title">Popup Title (optional)</Label>
                        <Input
                            id="popup_title"
                            value={formData.popup_title}
                            onChange={(e) => setFormData({ ...formData, popup_title: e.target.value })}
                            placeholder={`Default: "Get ${formData.discount_percent}% Off"`}
                        />
                    </div>

                    <div>
                        <Label htmlFor="popup_description">Popup Description (optional)</Label>
                        <Textarea
                            id="popup_description"
                            value={formData.popup_description}
                            onChange={(e) => setFormData({ ...formData, popup_description: e.target.value })}
                            placeholder="Default: Subscribe to our newsletter and receive..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="max_uses">Max Uses Per Code</Label>
                        <Input
                            id="max_uses"
                            type="number"
                            min={1}
                            value={formData.max_uses_per_code}
                            onChange={(e) => setFormData({
                                ...formData,
                                max_uses_per_code: parseInt(e.target.value) || 1
                            })}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <Label htmlFor="is_active">Campaign is active</Label>
                    </div>

                    {/* Banner Settings Section */}
                    <div className="border-t border-ui-border-base pt-4 mt-4">
                        <Heading level="h3" className="mb-3">Banner Settings</Heading>
                        <Text size="small" className="text-ui-fg-muted mb-4">
                            Configure the promotional banner shown at the top of your storefront
                        </Text>

                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="banner_enabled"
                                checked={formData.banner_enabled}
                                onChange={(e) => setFormData({ ...formData, banner_enabled: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="banner_enabled">Show promotional banner</Label>
                        </div>

                        {formData.banner_enabled && (
                            <div className="space-y-4 pl-6 border-l-2 border-ui-border-base">
                                <div>
                                    <Label htmlFor="banner_text">Banner Text</Label>
                                    <Input
                                        id="banner_text"
                                        value={formData.banner_text}
                                        onChange={(e) => setFormData({ ...formData, banner_text: e.target.value })}
                                        placeholder={`Default: "${formData.discount_percent}% OFF - Limited Time Offer!"`}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="banner_cta_text">CTA Button Text</Label>
                                        <Input
                                            id="banner_cta_text"
                                            value={formData.banner_cta_text}
                                            onChange={(e) => setFormData({ ...formData, banner_cta_text: e.target.value })}
                                            placeholder="Default: Shop Now"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="banner_cta_link">CTA Button Link</Label>
                                        <Input
                                            id="banner_cta_link"
                                            value={formData.banner_cta_link}
                                            onChange={(e) => setFormData({ ...formData, banner_cta_link: e.target.value })}
                                            placeholder="Default: /store"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="banner_bg_color">Background Color (optional)</Label>
                                    <Input
                                        id="banner_bg_color"
                                        value={formData.banner_bg_color}
                                        onChange={(e) => setFormData({ ...formData, banner_bg_color: e.target.value })}
                                        placeholder="e.g., #1a1a1a or gradient-amber"
                                    />
                                    <Text size="xsmall" className="text-ui-fg-muted mt-1">
                                        Leave empty for default dark gradient
                                    </Text>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-ui-border-base">
                        <Button variant="secondary" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            {campaign ? "Save Changes" : "Create Campaign"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Subscriptions Drawer
const SubscriptionsDrawer = ({
    campaign,
    isOpen,
    onClose,
}: {
    campaign: EmailCampaign | null
    isOpen: boolean
    onClose: () => void
}) => {
    const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([])
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState<CampaignStats | null>(null)

    useEffect(() => {
        if (isOpen && campaign) {
            fetchSubscriptions()
        }
    }, [isOpen, campaign])

    const fetchSubscriptions = async () => {
        if (!campaign) return
        setLoading(true)
        try {
            const response = await fetch(
                `/admin/email-campaigns/${campaign.id}/subscriptions?limit=100`,
                { credentials: "include" }
            )
            const data = await response.json()
            setSubscriptions(data.subscriptions || [])
            setStats(data.stats || null)
        } catch (error) {
            console.error("Error fetching subscriptions:", error)
        } finally {
            setLoading(false)
        }
    }

    const exportCSV = () => {
        if (!subscriptions.length) return

        const headers = ["Email", "Discount Code", "Subscribed At", "Used At", "Usage Count"]
        const rows = subscriptions.map((s) => [
            s.email,
            s.discount_code,
            formatDateTime(s.subscribed_at),
            s.used_at ? formatDateTime(s.used_at) : "Not used",
            s.usage_count.toString(),
        ])

        const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${campaign?.code_prefix || "campaign"}-subscriptions.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!isOpen || !campaign) return null

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative ml-auto w-full max-w-2xl bg-ui-bg-base shadow-xl overflow-y-auto">
                <div className="sticky top-0 bg-ui-bg-base border-b border-ui-border-base px-6 py-4 flex items-center justify-between">
                    <div>
                        <Heading level="h2">{campaign.name} - Subscriptions</Heading>
                        {stats && (
                            <Text size="small" className="text-ui-fg-muted">
                                {stats.total_subscriptions} subscriptions, {stats.codes_used} used ({stats.conversion_rate}% conversion)
                            </Text>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="small" onClick={exportCSV}>
                            <ArrowDownTray className="w-4 h-4 mr-1" />
                            Export CSV
                        </Button>
                        <Button variant="secondary" size="small" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <Text className="text-center py-8">Loading...</Text>
                    ) : subscriptions.length === 0 ? (
                        <Text className="text-center py-8 text-ui-fg-muted">
                            No subscriptions yet
                        </Text>
                    ) : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Email</Table.HeaderCell>
                                    <Table.HeaderCell>Code</Table.HeaderCell>
                                    <Table.HeaderCell>Subscribed</Table.HeaderCell>
                                    <Table.HeaderCell>Status</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {subscriptions.map((sub) => (
                                    <Table.Row key={sub.id}>
                                        <Table.Cell>{sub.email}</Table.Cell>
                                        <Table.Cell>
                                            <code className="text-ui-fg-subtle bg-ui-bg-subtle px-1 rounded">
                                                {sub.discount_code}
                                            </code>
                                        </Table.Cell>
                                        <Table.Cell>{formatDateTime(sub.subscribed_at)}</Table.Cell>
                                        <Table.Cell>
                                            {sub.used_at ? (
                                                <Badge color="green">Used ({sub.usage_count}x)</Badge>
                                            ) : (
                                                <Badge color="grey">Unused</Badge>
                                            )}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    )
}

// Main Page Component
const EmailCampaignsPage = () => {
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
    const [loading, setLoading] = useState(true)
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [subscriptionsDrawerOpen, setSubscriptionsDrawerOpen] = useState(false)
    const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)

    const fetchCampaigns = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch("/admin/email-campaigns", {
                credentials: "include",
            })
            const data = await response.json()
            setCampaigns(data.campaigns || [])
        } catch (error) {
            console.error("Error fetching campaigns:", error)
            toast.error("Failed to load campaigns")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCampaigns()
    }, [fetchCampaigns])

    const handleCreateCampaign = () => {
        setSelectedCampaign(null)
        setFormModalOpen(true)
    }

    const handleEditCampaign = (campaign: EmailCampaign) => {
        setSelectedCampaign(campaign)
        setFormModalOpen(true)
    }

    const handleViewSubscriptions = (campaign: EmailCampaign) => {
        setSelectedCampaign(campaign)
        setSubscriptionsDrawerOpen(true)
    }

    const handleDeleteCampaign = async (campaign: EmailCampaign) => {
        if (!confirm(`Are you sure you want to delete "${campaign.name}"?`)) return

        try {
            const response = await fetch(`/admin/email-campaigns/${campaign.id}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Campaign deleted")
            fetchCampaigns()
        } catch (error) {
            toast.error("Failed to delete campaign")
        }
    }

    const handleToggleActive = async (campaign: EmailCampaign) => {
        try {
            const response = await fetch(`/admin/email-campaigns/${campaign.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_active: !campaign.is_active }),
            })

            if (!response.ok) throw new Error("Failed to update")

            toast.success(campaign.is_active ? "Campaign deactivated" : "Campaign activated")
            fetchCampaigns()
        } catch (error) {
            toast.error("Failed to update campaign")
        }
    }

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <EnvelopeSolid className="w-6 h-6 text-ui-fg-subtle" />
                    <div>
                        <Heading level="h1">Email Campaigns</Heading>
                        <Text className="text-ui-fg-subtle">
                            Manage email subscription popup campaigns
                        </Text>
                    </div>
                </div>
                <Button onClick={handleCreateCampaign}>
                    <Plus className="w-4 h-4 mr-1" />
                    Create Campaign
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <Text>Loading campaigns...</Text>
                </div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-ui-border-base rounded-lg">
                    <EnvelopeSolid className="w-12 h-12 mx-auto text-ui-fg-muted mb-4" />
                    <Heading level="h2" className="mb-2">No campaigns yet</Heading>
                    <Text className="text-ui-fg-muted mb-4">
                        Create your first email subscription campaign to start collecting subscribers.
                    </Text>
                    <Button onClick={handleCreateCampaign}>
                        <Plus className="w-4 h-4 mr-1" />
                        Create Campaign
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Campaign</Table.HeaderCell>
                            <Table.HeaderCell>Discount</Table.HeaderCell>
                            <Table.HeaderCell>Period</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Subscriptions</Table.HeaderCell>
                            <Table.HeaderCell>Conversion</Table.HeaderCell>
                            <Table.HeaderCell></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {campaigns.map((campaign) => {
                            const status = getCampaignStatus(campaign)
                            const config = STATUS_CONFIG[status]

                            return (
                                <Table.Row key={campaign.id}>
                                    <Table.Cell>
                                        <div>
                                            <Text weight="plus">{campaign.name}</Text>
                                            <Text size="small" className="text-ui-fg-muted">
                                                {campaign.code_prefix}-XXXXXX
                                            </Text>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge color="purple">{campaign.discount_percent}% OFF</Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text size="small">
                                            {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex items-center gap-2">
                                            <Badge color={config.color}>{config.label}</Badge>
                                            {campaign.banner_enabled && (
                                                <Badge color="orange">Banner</Badge>
                                            )}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text>{campaign.stats.total_subscriptions}</Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text>
                                            {campaign.stats.codes_used} / {campaign.stats.total_subscriptions}
                                            {" "}({campaign.stats.conversion_rate}%)
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <DropdownMenu>
                                            <DropdownMenu.Trigger asChild>
                                                <IconButton variant="transparent">
                                                    <EllipsisHorizontal />
                                                </IconButton>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Content>
                                                <DropdownMenu.Item onClick={() => handleViewSubscriptions(campaign)}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Subscriptions
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item onClick={() => handleEditCampaign(campaign)}>
                                                    <PencilSquare className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item onClick={() => handleToggleActive(campaign)}>
                                                    {campaign.is_active ? (
                                                        <>
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Separator />
                                                <DropdownMenu.Item
                                                    className="text-ui-fg-error"
                                                    onClick={() => handleDeleteCampaign(campaign)}
                                                >
                                                    <Trash className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            )}

            <CampaignFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                campaign={selectedCampaign}
                onSave={fetchCampaigns}
            />

            <SubscriptionsDrawer
                campaign={selectedCampaign}
                isOpen={subscriptionsDrawerOpen}
                onClose={() => setSubscriptionsDrawerOpen(false)}
            />
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Email Campaigns",
    icon: EnvelopeSolid,
})

export default EmailCampaignsPage
