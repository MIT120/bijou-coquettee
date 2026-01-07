"use client"

import { useState, useEffect, useCallback } from "react"
import { XMark } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Campaign = {
    id: string
    name: string
    discount_percent: number
    end_date: string
    banner_text: string | null
    banner_cta_text: string | null
    banner_cta_link: string | null
    banner_enabled: boolean
}

const BANNER_COOKIE_NAME = "_discount_banner_dismissed"
const DISMISS_HOURS = 24 // Show again after 24 hours

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

// Cookie utilities
function getCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
}

function setCookie(name: string, value: string, hours: number) {
    if (typeof document === "undefined") return
    const expires = new Date()
    expires.setTime(expires.getTime() + hours * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

type TimeLeft = {
    days: number
    hours: number
    minutes: number
    seconds: number
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
    const difference = new Date(endDate).getTime() - new Date().getTime()

    if (difference <= 0) {
        return null
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    }
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center min-w-[40px]">
            <span className="text-lg font-bold tabular-nums">
                {value.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">
                {label}
            </span>
        </div>
    )
}

function CountdownTimer({ endDate }: { endDate: string }) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setTimeLeft(calculateTimeLeft(endDate))

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft(endDate)
            setTimeLeft(newTimeLeft)

            if (!newTimeLeft) {
                clearInterval(timer)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [endDate])

    if (!mounted || !timeLeft) return null

    return (
        <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm mr-1 sm:mr-2 hidden sm:inline">Ends in:</span>
            <span className="text-xs mr-1 sm:hidden">Ends:</span>
            <div className="flex items-center gap-0.5 sm:gap-1 bg-white/20 rounded-lg px-2 py-1">
                {timeLeft.days > 0 && (
                    <>
                        <TimeUnit value={timeLeft.days} label="d" />
                        <span className="text-lg font-light opacity-60">:</span>
                    </>
                )}
                <TimeUnit value={timeLeft.hours} label="h" />
                <span className="text-lg font-light opacity-60">:</span>
                <TimeUnit value={timeLeft.minutes} label="m" />
                <span className="text-lg font-light opacity-60 hidden sm:inline">:</span>
                <div className="hidden sm:block">
                    <TimeUnit value={timeLeft.seconds} label="s" />
                </div>
            </div>
        </div>
    )
}

export default function DiscountBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const [isClosing, setIsClosing] = useState(false)

    useEffect(() => {
        // Check if banner was dismissed
        const dismissed = getCookie(BANNER_COOKIE_NAME)
        if (dismissed) return

        // Fetch active campaign with banner enabled
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

                if (data.campaign && data.campaign.banner_enabled) {
                    setCampaign(data.campaign)
                    // Small delay for smooth animation
                    setTimeout(() => setIsVisible(true), 100)
                }
            } catch (error) {
                console.error("Failed to fetch campaign for banner:", error)
            }
        }

        fetchCampaign()
    }, [])

    const handleDismiss = useCallback(() => {
        setIsClosing(true)
        setTimeout(() => {
            setCookie(BANNER_COOKIE_NAME, "true", DISMISS_HOURS)
            setIsVisible(false)
        }, 300)
    }, [])

    if (!campaign || !isVisible) return null

    // Check if campaign has ended
    const timeLeft = calculateTimeLeft(campaign.end_date)
    if (!timeLeft) return null

    const bannerText = campaign.banner_text || `${campaign.discount_percent}% OFF - Limited Time Offer!`
    const ctaText = campaign.banner_cta_text || "Shop Now"
    const ctaLink = campaign.banner_cta_link || "/store"

    return (
        <div
            className={clx(
                "relative w-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white",
                "transition-all duration-300 ease-out overflow-hidden",
                isClosing ? "max-h-0 opacity-0" : "max-h-24 opacity-100"
            )}
        >
            <div className="content-container">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3 px-4 sm:px-0">
                    {/* Main content */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 flex-1">
                        {/* Discount badge */}
                        <div className="hidden md:flex items-center gap-2 bg-amber-500 text-neutral-900 px-3 py-1 rounded-full">
                            <span className="text-sm font-bold">
                                {campaign.discount_percent}% OFF
                            </span>
                        </div>

                        {/* Banner text */}
                        <p className="text-sm sm:text-base font-medium text-center sm:text-left">
                            <span className="md:hidden font-bold text-amber-400">
                                {campaign.discount_percent}% OFF -{" "}
                            </span>
                            {bannerText}
                        </p>
                    </div>

                    {/* Countdown and CTA */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        <CountdownTimer endDate={campaign.end_date} />

                        <LocalizedClientLink
                            href={ctaLink}
                            className="bg-white text-neutral-900 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-neutral-100 transition-colors whitespace-nowrap"
                        >
                            {ctaText}
                        </LocalizedClientLink>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Dismiss banner"
                    >
                        <XMark className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
