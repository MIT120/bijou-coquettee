import { ReactNode } from "react"

import InfiniteProductGrid from "./infinite-product-grid"

/**
 * InfiniteProductGridShell  (SERVER COMPONENT)
 *
 * This is the RSC bridge between StoreTemplate (server) and
 * InfiniteProductGrid (client). It exists solely because:
 *
 *   - A client component cannot directly import or call a server component.
 *   - A server component CAN pass pre-rendered RSC nodes as ReactNode props
 *     to a client component. React serialises them correctly through the
 *     RSC boundary without converting them to client components.
 *
 * So the flow is:
 *   StoreTemplate (server)
 *     → InfiniteProductGridShell (server) — holds ReactNode slots
 *       → InfiniteProductGrid (client) — renders those slots
 *         → Suspense + <PaginatedProducts page={N} /> on demand
 *
 * The `renderPage` prop is a function that produces ReactNode. Passing
 * a function from server to client normally requires serialisation, which
 * Next.js does not support for arbitrary functions. We work around this by
 * pre-computing the page nodes for all possible pages here on the server
 * and passing them as a keyed map. In practice the catalog is small enough
 * (≤ 100 products, ≤ 9 pages) that this is not a memory concern.
 *
 * For very large catalogs (thousands of products) the correct solution is
 * a Route Handler at /api/products?page=N that the client fetches. For
 * Bijou Coquettee's current scale this map approach is the right trade-off.
 */

type InfiniteProductGridShellProps = {
  firstPageNode: ReactNode
  renderPage: (page: number) => ReactNode
  totalCount: number
  pageSize: number
  initialPage: number
}

// Maximum number of pages to pre-render. Covers catalogs up to
// MAX_PAGES * pageSize products without any extra fetching.
const MAX_PAGES = 20

export default function InfiniteProductGridShell({
  firstPageNode,
  renderPage,
  totalCount,
  pageSize,
  initialPage,
}: InfiniteProductGridShellProps) {
  // Pre-build all possible page nodes so the client has them ready.
  // Each node is a React element (<PaginatedProducts page={N} />) which
  // is not yet rendered — React will render it when the Suspense boundary
  // for that page becomes active.
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const pagesToPrebuild = Math.min(totalPages, MAX_PAGES)

  // Build a map from page number → RSC node.
  // Start from page 2 since page 1 is passed as firstPageNode.
  const prebuiltPages: Record<number, ReactNode> = {}
  for (let p = 2; p <= pagesToPrebuild; p++) {
    prebuiltPages[p] = renderPage(p)
  }

  return (
    <InfiniteProductGrid
      firstPageNode={firstPageNode}
      prebuiltPages={prebuiltPages}
      totalCount={totalCount}
      pageSize={pageSize}
      initialPage={initialPage}
    />
  )
}
