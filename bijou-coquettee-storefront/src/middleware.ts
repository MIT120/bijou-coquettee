import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"
import { getLocaleFromCountryCode, getLocaleFromHeaders, defaultLocale } from "./i18n/locale"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (!PUBLISHABLE_API_KEY) {
    throw new Error(
      "Middleware.ts: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY environment variable is not set."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    try {
      // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY,
        },
        next: {
          revalidate: 3600,
          tags: [`regions-${cacheId}`],
        },
        cache: "force-cache",
      })

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        throw new Error(
          `Expected JSON response but received ${contentType}. This usually means the backend URL is incorrect or the server is returning an error page. Backend URL: ${BACKEND_URL}/store/regions. Response preview: ${text.substring(0, 200)}`
        )
      }

      const json = await response.json()

      if (!response.ok) {
        throw new Error(
          json.message || `Failed to fetch regions: ${response.status} ${response.statusText}`
        )
      }

      const { regions } = json

      if (!regions?.length) {
        throw new Error(
          "No regions found. Please set up regions in your Medusa Admin."
        )
      }

      // Create a map of country codes to regions.
      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
          regionMapCache.regionMap.set(c.iso_2 ?? "", region)
        })
      })

      regionMapCache.regionMapUpdated = Date.now()
    } catch (error) {
      // Provide more helpful error messages
      if (error instanceof Error) {
        throw new Error(
          `Middleware.ts: Failed to fetch regions from ${BACKEND_URL}/store/regions. ${error.message}`
        )
      }
      throw error
    }
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")

  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  // Check if user has a locale preference cookie (user preference takes priority)
  const existingLocaleCookie = request.cookies.get("NEXT_LOCALE")?.value

  // Detect locale: prioritize existing cookie (user preference), then country code, then headers
  let locale: string
  if (existingLocaleCookie && (existingLocaleCookie === "en" || existingLocaleCookie === "bg")) {
    // User has explicitly set a preference - use it
    locale = existingLocaleCookie
  } else if (countryCode) {
    // No user preference, detect from country code
    locale = getLocaleFromCountryCode(countryCode)
  } else {
    // Fallback to headers
    locale = getLocaleFromHeaders(request.headers)
  }

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    const response = NextResponse.next()
    // Always preserve user's cookie preference, or set initial locale if no preference exists
    if (existingLocaleCookie && (existingLocaleCookie === "en" || existingLocaleCookie === "bg")) {
      // User has a preference - preserve it (don't overwrite)
      // Cookie is already set, no need to set it again
    } else {
      // No user preference yet - set based on detection
      response.cookies.set("NEXT_LOCALE", locale, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      })
    }
    return response
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })

    return response
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
    // Always preserve user's cookie preference, or set initial locale if no preference exists
    if (existingLocaleCookie && (existingLocaleCookie === "en" || existingLocaleCookie === "bg")) {
      // User has a preference - preserve it (don't overwrite)
      // Cookie is already set, no need to set it again
    } else {
      // No user preference yet - set based on detection
      response.cookies.set("NEXT_LOCALE", locale, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      })
    }
  } else if (!urlHasCountryCode && !countryCode) {
    // Handle case where no valid country code exists (empty regions)
    return new NextResponse(
      "No valid regions configured. Please set up regions with countries in your Medusa Admin.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
