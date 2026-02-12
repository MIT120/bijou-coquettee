import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const RAW_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export async function POST(req: NextRequest) {
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

  let payload: Record<string, unknown>

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 }
    )
  }

  try {
    const upstream = await fetch(
      `${RAW_BACKEND_URL}/store/econt/calculate`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    )

    const bodyText = await upstream.text()
    let data: Record<string, unknown> = {}
    try {
      data = bodyText ? JSON.parse(bodyText) : {}
    } catch {
      data = bodyText ? { raw: bodyText } : {}
    }

    return NextResponse.json(data, { status: upstream.status })
  } catch (error) {
    console.error("Econt calculate proxy error", error)
    return NextResponse.json(
      { message: "Unable to calculate shipping cost." },
      { status: 502 }
    )
  }
}
