"use server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

/**
 * Get active campaign for popup
 */
export async function getActiveCampaign() {
    try {
        const response = await fetch(`${BACKEND_URL}/store/campaigns/active`, {
            next: { revalidate: 60 }, // Cache for 1 minute
        })
        const data = await response.json()
        return data.campaign
    } catch (error) {
        console.error("Error fetching active campaign:", error)
        return null
    }
}

/**
 * Subscribe email to campaign
 */
export async function subscribeToCampaign(email: string, campaignId: string) {
    try {
        const response = await fetch(`${BACKEND_URL}/store/campaigns/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, campaign_id: campaignId }),
        })
        return await response.json()
    } catch (error) {
        console.error("Error subscribing to campaign:", error)
        return { success: false, message: "Failed to subscribe" }
    }
}

/**
 * Check if email has a campaign discount
 */
export async function checkEmailDiscount(email: string) {
    try {
        const response = await fetch(`${BACKEND_URL}/store/campaigns/check-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        })
        return await response.json()
    } catch (error) {
        console.error("Error checking email discount:", error)
        return { has_code: false }
    }
}
