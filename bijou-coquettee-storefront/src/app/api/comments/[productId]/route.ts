import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"

const RAW_BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "http://localhost:9000"

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ productId: string }> }
) {
    const { productId } = await context.params

    if (!productId) {
        return NextResponse.json(
            {
                error: "Missing productId in path.",
            },
            { status: 400 }
        )
    }

    let body: Record<string, unknown>

    try {
        body = await req.json()
    } catch (error) {
        console.error("Invalid comment payload", error)
        return NextResponse.json(
            { error: "Invalid JSON body." },
            { status: 400 }
        )
    }

    const cookieStore = await cookies()
    const token = cookieStore.get("_medusa_jwt")?.value

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }

    if (token) {
        headers["authorization"] = `Bearer ${token}`
    }

    if (PUBLISHABLE_KEY) {
        headers["x-publishable-api-key"] = PUBLISHABLE_KEY
    }

    try {
        const upstreamResponse = await fetch(
            `${RAW_BACKEND_URL}/store/products/${productId}/comments`,
            {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                cache: "no-store",
            }
        )

        const rawText = await upstreamResponse.text()
        let data: Record<string, unknown> = {}
        try {
            data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {}
        } catch {
            if (rawText) {
                data = { raw: rawText }
            }
        }

        if (!upstreamResponse.ok) {
            console.error("Medusa comment upstream error", {
                status: upstreamResponse.status,
                data,
            })

            return NextResponse.json(
                {
                    error:
                        (data as { message?: string })?.message ||
                        "Failed to create comment.",
                },
                { status: upstreamResponse.status }
            )
        }

        // Revalidate cached product comment tag so next render picks up the new entry.
        revalidateTag(`product-comments:${productId}`)

        return NextResponse.json(data, { status: upstreamResponse.status })
    } catch (error) {
        console.error("Medusa comment proxy error", error)
        return NextResponse.json(
            { error: "Unable to reach Medusa backend." },
            { status: 502 }
        )
    }
}


