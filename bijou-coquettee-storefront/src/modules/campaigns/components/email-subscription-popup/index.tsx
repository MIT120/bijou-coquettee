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
const POPUP_DELAY_MS = 2500
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

// Fallback campaign shown when no active backend campaign is configured
const FALLBACK_CAMPAIGN: Campaign = {
    id: "",
    name: "Newsletter",
    discount_percent: 5,
    popup_title: "Абонирай се за нашия имейл бюлетин и вземи 5% отстъпка от първата си поръчка",
    popup_description: null,
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
        // Check if popup was dismissed within the last 7 days
        const dismissed = getCookie(POPUP_COOKIE_NAME)
        if (dismissed) return

        // Fetch active campaign — fall back to the default newsletter popup if
        // no campaign is configured or the request fails so the popup always
        // shows on the first visit.
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

                const activeCampaign: Campaign = data.campaign ?? FALLBACK_CAMPAIGN
                setCampaign(activeCampaign)
            } catch {
                // Backend unreachable — still show the default newsletter popup
                setCampaign(FALLBACK_CAMPAIGN)
            } finally {
                setTimeout(() => setIsVisible(true), POPUP_DELAY_MS)
            }
        }

        fetchCampaign()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!campaign || !email) return

        // If there is no real campaign ID (fallback mode), skip the API call
        // and show a generic success state.
        if (!campaign.id) {
            setSuccess(true)
            setCookie(POPUP_COOKIE_NAME, "true", DISMISS_DAYS)
            return
        }

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
                setCookie(POPUP_COOKIE_NAME, "true", DISMISS_DAYS)
            } else {
                setError(data.message || "Неуспешно абониране. Моля, опитай отново.")
            }
        } catch {
            setError("Нещо се обърка. Моля, опитай отново.")
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
                className="absolute inset-0 bg-[rgba(28,20,15,0.60)] backdrop-blur-sm"
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
                    className="absolute top-4 right-4 p-2 rounded-full text-grey-40 hover:text-grey-60 hover:bg-grey-5 transition-colors"
                    aria-label="Close"
                >
                    <XMark className="w-5 h-5" />
                </button>

                {!success ? (
                    // Subscription Form
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pale-pink to-muted-rose rounded-full mb-4">
                                <Sparkles className="w-8 h-8 text-soft-gold" />
                            </div>
                            <h2 className="text-xl font-semibold text-grey-90 mb-2 leading-snug">
                                {campaign.popup_title ||
                                    `Абонирай се за нашия имейл бюлетин и вземи ${campaign.discount_percent}% отстъпка от първата си поръчка`}
                            </h2>
                            {campaign.popup_description && (
                                <p className="text-grey-50 text-sm leading-relaxed">
                                    {campaign.popup_description}
                                </p>
                            )}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Въведи своя имейл адрес"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3.5 bg-grey-5 border border-grey-20 rounded-xl text-sm placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-muted-rose focus:border-transparent transition-all"
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-grey-90 hover:bg-grey-80 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Моля, изчакай..." : "Вземи моя код за отстъпка"}
                            </button>
                        </form>

                        <p className="mt-5 text-xs text-center text-grey-40 leading-relaxed">
                            С абонирането се съгласяваш да получаваш промоционални имейли.<br />
                            Можеш да се отпишеш по всяко време.
                        </p>
                    </div>
                ) : (
                    // Success State
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-50 rounded-full mb-4">
                            <CheckCircleSolid className="w-8 h-8 text-soft-gold" />
                        </div>
                        <h2 className="text-2xl font-semibold text-grey-90 mb-2">
                            Добре дошла в семейството!
                        </h2>
                        <p className="text-grey-50 text-sm mb-6">
                            {discountCode
                                ? "Ето твоя ексклузивен код за отстъпка:"
                                : "Благодарим ти за абонирането! Ще получиш своя код скоро."}
                        </p>

                        {discountCode && (
                            <>
                                <div className="bg-cream border-2 border-dashed border-pale-pink rounded-xl p-5 mb-4">
                                    <code className="text-2xl font-bold text-grey-90 tracking-wider">
                                        {discountCode}
                                    </code>
                                </div>

                                <button
                                    onClick={handleCopyCode}
                                    className="w-full py-3 mb-3 border border-grey-20 text-grey-70 text-sm font-medium rounded-xl hover:bg-grey-5 transition-colors"
                                >
                                    {copied ? "Копирано в клипборда!" : "Копирай кода"}
                                </button>

                                <p className="text-sm text-grey-50 mb-5">
                                    Използвай кода при плащане за {campaign.discount_percent}% отстъпка
                                </p>
                            </>
                        )}

                        <button
                            onClick={handleDismiss}
                            className="w-full py-3.5 bg-grey-90 hover:bg-grey-80 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            Към пазаруване
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
