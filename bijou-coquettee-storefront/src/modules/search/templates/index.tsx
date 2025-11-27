import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { t } from "@lib/util/translations-server"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"

const PRODUCT_LIMIT = 12

type SearchTemplateProps = {
  query?: string
  page?: string
  countryCode: string
}

const SearchTemplate = async ({
  query,
  page,
  countryCode,
}: SearchTemplateProps) => {
  const searchTerm = query?.trim() ?? ""
  const pageNumber = page ? Math.max(parseInt(page, 10) || 1, 1) : 1
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const featuredProductsPromise = listProducts({
    pageParam: 1,
    queryParams: {
      limit: 6,
    },
    countryCode,
  })

  let products: Awaited<
    ReturnType<typeof listProducts>
  >["response"]["products"] = []
  let count = 0

  if (searchTerm) {
    const {
      response: { products: responseProducts, count: responseCount },
    } = await listProducts({
      pageParam: pageNumber,
      queryParams: {
        limit: PRODUCT_LIMIT,
        q: searchTerm,
      },
      countryCode,
    })

    products = responseProducts
    count = responseCount
  }

  const {
    response: { products: featuredProducts },
  } = await featuredProductsPromise

  const totalPages = count > 0 ? Math.ceil(count / PRODUCT_LIMIT) : 0

  const showResults = Boolean(searchTerm)

  return (
    <div className="content-container py-8 space-y-12">
      {showResults ? (
        <section className="space-y-8">
          <div className="space-y-2">
            <p className="text-small-regular uppercase tracking-wide text-ui-fg-muted">
              {await t("search.resultsCount", countryCode, {
                count: count.toString(),
              })}
            </p>
            <h1 className="text-3xl-regular">
              {await t("search.title", countryCode, { term: searchTerm })}
            </h1>
          </div>

          {products.length === 0 ? (
            <div className="py-16 text-center space-y-4 rounded-lg border border-ui-border-base">
              <p className="text-base-regular">
                {await t("search.empty", countryCode, { term: searchTerm })}
              </p>
              <p className="text-small-regular text-ui-fg-muted">
                {await t("search.noQuery", countryCode)}
              </p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
                {products.map((product) => (
                  <li key={product.id}>
                    <ProductPreview product={product} region={region} />
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <Pagination
                  data-testid="search-pagination"
                  page={pageNumber}
                  totalPages={totalPages}
                />
              )}
            </>
          )}
        </section>
      ) : (
        <section className="py-12 text-center space-y-4 rounded-lg border border-dashed border-ui-border-base">
          <h1 className="text-2xl-semi">
            {await t("common.brand", countryCode)}
          </h1>
          <p className="text-base-regular text-ui-fg-muted">
            {await t("search.noQuery", countryCode)}
          </p>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-small-regular uppercase tracking-wide text-ui-fg-muted">
              {await t("search.suggestionsSubtitle", countryCode)}
            </p>
            <h2 className="text-2xl-semi">
              {await t("search.suggestionsTitle", countryCode)}
            </h2>
          </div>
          <ul className="grid grid-cols-2 w-full small:grid-cols-3 gap-x-6 gap-y-8">
            {featuredProducts.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default SearchTemplate
