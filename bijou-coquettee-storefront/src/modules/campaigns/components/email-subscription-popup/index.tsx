"use client"

import { useState, useEffect } from "react"
import { XMark, CheckCircleSolid, Sparkles } from "@medusajs/icons"
import { clx } from "@medusajs/ui"

type Campaign = {
    id: string
    name: string
    discount_percent: number
    popup_title: string | null
    popup_description: string | null
}

const POPUP_COOKIE_NAME = "_campaign_popup_dismissed"
const POPUP_DELAY_MS = 5000
const DISMISS_DAYS = 7

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

// Cookie utilities
function getCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
}

function setCookie(name: string, value: string, days: number) {
    if (typeof document === "undefined") return
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

export default function EmailSubscriptionPopup() {
    const [isVisible, setIsVisible] = useState(false)
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [discountCode, setDiscountCode] = useState("")
    const [error, setError] = useState("")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        // Check if popup was dismissed
        const dismissed = getCookie(POPUP_COOKIE_NAME)
        if (dismissed) return

        // Fetch active campaign
        const fetchCampaign = async () => {
            try {
                const headers: Record<string, string> = {}
                if (PUBLISHABLE_KEY) {
                    headers["x-publishable-api-key"] = PUBLISHABLE_KEY
                }

                const response = await fetch(
                    `${BACKEND_URL}/store/campaigns/active`,
                    { headers }
                )
                const data = await response.json()

                if (data.campaign) {
                    setCampaign(data.campaign)
                    setTimeout(() => setIsVisible(true), POPUP_DELAY_MS)
                }
            } catch (error) {
                console.error("Failed to fetch campaign:", error)
            }
        }

        fetchCampaign()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!campaign || !email) return

        setLoading(true)
        setError("")

        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            }
            if (PUBLISHABLE_KEY) {
                headers["x-publishable-api-key"] = PUBLISHABLE_KEY
            }

            const response = await fetch(
                `${BACKEND_URL}/store/campaigns/subscribe`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        email,
                        campaign_id: campaign.id,
                    }),
                }
            )

            const data = await response.json()

            if (data.success) {
                setDiscountCode(data.discount_code)
                setSuccess(true)
            } else {
                setError(data.message || "Failed to subscribe. Please try again.")
            }
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleDismiss = () => {
        setCookie(POPUP_COOKIE_NAME, "true", DISMISS_DAYS)
        setIsVisible(false)
    }

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(discountCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            const textArea = document.createElement("textarea")
            textArea.value = discountCode
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand("copy")
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (!campaign || !isVisible) return null

    return (
        <div
            className={clx(
                "fixed inset-0 z-50 flex items-center justify-center p-4",
                "transition-all duration-300 ease-out",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleDismiss}
            />

            {/* Modal */}
            <div
                className={clx(
                    "relative w-full max-w-md bg-white rounded-2xl shadow-2xl",
                    "transform transition-all duration-300 ease-out",
                    isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                )}
            >
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                    aria-label="Close"
                >
                    <XMark className="w-5 h-5" />
                </button>

                {!success ? (
                    // Subscription Form
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mb-4">
                                <Sparkles className="w-8 h-8 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                                {campaign.popup_title || `Unlock ${campaign.discount_percent}% Off`}
                            </h2>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                {campaign.popup_description ||
                                    `Join our exclusive list and get ${campaign.discount_percent}% off your first jewelry purchase.`}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Please wait..." : "Get My Discount Code"}
                            </button>
                        </form>

                        <p className="mt-5 text-xs text-center text-neutral-400 leading-relaxed">
                            By subscribing, you agree to receive promotional emails.<br />
                            Unsubscribe anytime.
                        </p>
                    </div>
                ) : (
                    // Success State
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircleSolid className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                            Welcome to the family!
                        </h2>
                        <p className="text-neutral-500 text-sm mb-6">
                            Here's your exclusive discount code:
                        </p>

                        <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl p-5 mb-4">
                            <code className="text-2xl font-bold text-neutral-900 tracking-wider">
                                {discountCode}
                            </code>
                        </div>

                        <button
                            onClick={handleCopyCode}
                            className="w-full py-3 mb-3 border border-neutral-200 text-neutral-700 text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                            {copied ? "Copied to clipboard!" : "Copy Code"}
                        </button>

                        <p className="text-sm text-neutral-500 mb-5">
                            Use this code at checkout for {campaign.discount_percent}% off
                        </p>

                        <button
                            onClick={handleDismiss}
                            className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
