import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listCategories } from "@lib/data/categories"

export default async function FeaturedCategories() {
  const categories = await listCategories()
  
  // Filter out parent categories and limit to first 3 for display
  const featuredCategories = categories
    ?.filter((cat) => !cat.parent_category) // Only show top-level categories
    .slice(0, 3) || []

  if (featuredCategories.length === 0) {
    return null
  }

  return (
    <section className="content-container py-14 small:py-32 border-t border-grey-10">
      <div className="mb-8 small:mb-16">
        <div className="inline-block mb-4">
          <span className="text-xs small:text-sm tracking-[0.3em] uppercase text-grey-60 font-light">
            Shop by Category
          </span>
        </div>
        <Text className="text-2xl small:text-3xl text-grey-90 font-light tracking-tight">
          Explore Our Collections
        </Text>
      </div>
      
      <div className="grid grid-cols-1 small:grid-cols-3 gap-6 small:gap-8">
        {featuredCategories.map((category) => {
          // Try to get a product image from the category's products as a fallback
          const categoryImage = category.products?.[0]?.thumbnail || 
                               category.products?.[0]?.images?.[0]?.url
          
          return (
            <LocalizedClientLink
              key={category.id}
              href={`/categories/${category.handle}`}
              className="group relative block overflow-hidden bg-grey-5 aspect-[4/5] transition-all duration-300 hover:opacity-90"
            >
              <div className="absolute inset-0 flex flex-col justify-end p-6 small:p-8 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10">
                <Text className="text-white text-xl small:text-2xl font-light tracking-wide group-hover:translate-y-[-4px] transition-transform duration-300">
                  {category.name}
                </Text>
                {category.description && (
                  <Text className="text-white/90 text-sm font-light mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.description}
                  </Text>
                )}
              </div>
              {categoryImage ? (
                <img
                  src={categoryImage}
                  alt={category.name || "Category"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-grey-10 to-grey-20"></div>
              )}
            </LocalizedClientLink>
          )
        })}
      </div>
      
      <div className="mt-12 text-center">
        <LocalizedClientLink
          href="/store"
          className="inline-block text-sm uppercase tracking-wider text-grey-60 hover:text-grey-90 transition-colors duration-200 font-light border-b border-transparent hover:border-grey-60 pb-1"
        >
          View All Categories →
        </LocalizedClientLink>
      </div>
    </section>
  )
}

