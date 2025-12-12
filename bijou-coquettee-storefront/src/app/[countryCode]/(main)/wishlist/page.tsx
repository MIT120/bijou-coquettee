import { Metadata } from "next"
import WishlistPageClient from "./wishlist-client"

export const metadata: Metadata = {
    title: "Wishlist",
    description: "View your saved items.",
}

type Props = {
    params: Promise<{ countryCode: string }>
}

export default async function WishlistPage({ params }: Props) {
    const { countryCode } = await params

    return <WishlistPageClient countryCode={countryCode} />
}
