import { Metadata } from "next"
import WishlistPageClient from "../../../wishlist/wishlist-client"

export const metadata: Metadata = {
    title: "Wishlist",
    description: "View your wishlist.",
}

type Props = {
    params: Promise<{ countryCode: string }>
}

export default async function Wishlist({ params }: Props) {
    const { countryCode } = await params
    return <WishlistPageClient countryCode={countryCode} />
}

