"use client"

import { useState, useCallback } from "react"

type CampaignCheckResult = {
    has_code: boolean
    discount_code?: string
    discount_percent?: number
    reason?: string
}

/**
 * Hook for checking and applying campaign discounts based on email
 */
export function useCampaignDiscount() {
    const [checking, setChecking] = useState(false)
    const [campaignCode, setCampaignCode] = useState<string | null>(null)
    const [discountPercent, setDiscountPercent] = useState<number | null>(null)

    /**
     * Check if an email has a campaign discount code
     */
    const checkEmailForDiscount = useCallback(
        async (email: string): Promise<CampaignCheckResult | null> => {
            if (!email) return null

            setChecking(true)
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/campaigns/check-email`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                    }
                )
                const data = await response.json()

                if (data.has_code) {
                    setCampaignCode(data.discount_code)
                    setDiscountPercent(data.discount_percent)
                } else {
                    setCampaignCode(null)
                    setDiscountPercent(null)
                }

                return data
            } catch (error) {
                console.error("Error checking email for discount:", error)
                return null
            } finally {
                setChecking(false)
            }
        },
        []
    )

    /**
     * Clear the cached campaign code
     */
    const clearCampaignCode = useCallback(() => {
        setCampaignCode(null)
        setDiscountPercent(null)
    }, [])

    return {
        checking,
        campaignCode,
        discountPercent,
        checkEmailForDiscount,
        clearCampaignCode,
    }
}
