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
    toast,
} from "@medusajs/ui"
import {
    ChatBubbleLeftRight,
    Plus,
    EllipsisHorizontal,
    PencilSquare,
    Trash,
    ArrowUpMini,
    ArrowDownMini,
    CheckCircle,
    XCircle,
} from "@medusajs/icons"

type AnnouncementMessage = {
    id: string
    text: string
    sort_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

const MessageFormModal = ({
    isOpen,
    onClose,
    message,
    onSave,
    nextSortOrder,
}: {
    isOpen: boolean
    onClose: () => void
    message: AnnouncementMessage | null
    onSave: () => void
    nextSortOrder: number
}) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        text: "",
        sort_order: 0,
        is_active: true,
    })

    useEffect(() => {
        if (message) {
            setFormData({
                text: message.text,
                sort_order: message.sort_order,
                is_active: message.is_active,
            })
        } else {
            setFormData({
                text: "",
                sort_order: nextSortOrder,
                is_active: true,
            })
        }
    }, [message, isOpen, nextSortOrder])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = message
                ? `/admin/announcement-messages/${message.id}`
                : "/admin/announcement-messages"
            const method = message ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to save message")
            }

            toast.success(message ? "Message updated" : "Message created")
            onSave()
            onClose()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save message")
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
                        {message ? "Edit Message" : "Create Message"}
                    </Heading>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="text">Message Text *</Label>
                        <Input
                            id="text"
                            value={formData.text}
                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                            placeholder="e.g., Безплатна доставка за поръчки над 80лв"
                            required
                        />
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
                            {message ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const AnnouncementMessagesPage = () => {
    const [messages, setMessages] = useState<AnnouncementMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingMessage, setEditingMessage] = useState<AnnouncementMessage | null>(null)

    const fetchMessages = useCallback(async () => {
        try {
            const response = await fetch("/admin/announcement-messages", { credentials: "include" })
            const data = await response.json()
            setMessages(data.messages || [])
        } catch {
            toast.error("Failed to load messages")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchMessages() }, [fetchMessages])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return
        try {
            const response = await fetch(`/admin/announcement-messages/${id}`, {
                method: "DELETE", credentials: "include",
            })
            if (!response.ok) throw new Error("Failed to delete")
            toast.success("Message deleted")
            fetchMessages()
        } catch { toast.error("Failed to delete message") }
    }

    const handleToggleActive = async (msg: AnnouncementMessage) => {
        try {
            const response = await fetch(`/admin/announcement-messages/${msg.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_active: !msg.is_active }),
            })
            if (!response.ok) throw new Error("Failed to update")
            toast.success(msg.is_active ? "Message deactivated" : "Message activated")
            fetchMessages()
        } catch { toast.error("Failed to update message") }
    }

    const handleReorder = async (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= messages.length) return

        try {
            const response = await fetch("/admin/announcement-messages/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    messages: [
                        { id: messages[index].id, sort_order: messages[targetIndex].sort_order },
                        { id: messages[targetIndex].id, sort_order: messages[index].sort_order },
                    ],
                }),
            })
            if (!response.ok) throw new Error("Failed to reorder")
            fetchMessages()
        } catch { toast.error("Failed to reorder messages") }
    }

    const nextSortOrder = messages.length > 0
        ? Math.max(...messages.map((m) => m.sort_order)) + 1
        : 0

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Heading level="h1" className="flex items-center gap-2">
                        <ChatBubbleLeftRight />
                        Announcement Banner
                    </Heading>
                    <Text className="text-ui-fg-muted mt-1">
                        Manage scrolling announcement messages shown at the top of the store
                    </Text>
                </div>
                <Button onClick={() => { setEditingMessage(null); setShowForm(true) }}>
                    <Plus />
                    Add Message
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Text className="text-ui-fg-muted">Loading messages...</Text>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ChatBubbleLeftRight className="w-12 h-12 text-ui-fg-muted mb-4" />
                    <Text className="text-ui-fg-muted mb-4">
                        No announcement messages yet. Default messages will be shown on the storefront.
                    </Text>
                    <Button variant="secondary" onClick={() => { setEditingMessage(null); setShowForm(true) }}>
                        <Plus />
                        Create First Message
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell className="w-16">Order</Table.HeaderCell>
                            <Table.HeaderCell>Message</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Reorder</Table.HeaderCell>
                            <Table.HeaderCell className="w-12"></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {messages.map((msg, index) => (
                            <Table.Row key={msg.id}>
                                <Table.Cell>
                                    <Text className="font-mono text-ui-fg-muted">{msg.sort_order}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text className="font-medium">{msg.text}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color={msg.is_active ? "green" : "grey"}>
                                        {msg.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="flex gap-1">
                                        <IconButton size="small" variant="transparent" onClick={() => handleReorder(index, "up")} disabled={index === 0}>
                                            <ArrowUpMini />
                                        </IconButton>
                                        <IconButton size="small" variant="transparent" onClick={() => handleReorder(index, "down")} disabled={index === messages.length - 1}>
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
                                            <DropdownMenu.Item onClick={() => { setEditingMessage(msg); setShowForm(true) }}>
                                                <PencilSquare className="mr-2" />Edit
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Item onClick={() => handleToggleActive(msg)}>
                                                {msg.is_active ? (<><XCircle className="mr-2" />Deactivate</>) : (<><CheckCircle className="mr-2" />Activate</>)}
                                            </DropdownMenu.Item>
                                            <DropdownMenu.Separator />
                                            <DropdownMenu.Item onClick={() => handleDelete(msg.id)} className="text-ui-fg-error">
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

            <MessageFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingMessage(null) }}
                message={editingMessage}
                onSave={fetchMessages}
                nextSortOrder={nextSortOrder}
            />
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Announcement Banner",
    icon: ChatBubbleLeftRight,
})

export default AnnouncementMessagesPage
