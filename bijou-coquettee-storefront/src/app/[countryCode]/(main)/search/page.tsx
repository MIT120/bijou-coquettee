import { Metadata } from "next"

import SearchTemplate from "@modules/search/templates"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    query?: string
    page?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams
  const query = searchParams.query?.trim()

  const title = query
    ? `Search results for "${query}" | Bijou Coquettee`
    : "Search products | Bijou Coquettee"

  return {
    title,
    description: "Discover Bijou Coquettee products that match your search keywords.",
  }
}

export default async function SearchPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams

  return (
    <SearchTemplate
      query={searchParams.query}
      page={searchParams.page}
      countryCode={params.countryCode}
    />
  )
}


