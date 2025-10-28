import { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { getWishlist } from "@lib/data/wishlist"
import WishlistTemplate from "@modules/account/templates/wishlist-template"

export const metadata: Metadata = {
    title: "Wishlist",
    description: "View your wishlist.",
}

export default async function Wishlist() {
    const customer = await retrieveCustomer()

    if (!customer) {
        notFound()
    }

    const wishlist = await getWishlist()

    return <WishlistTemplate wishlist={wishlist} />
}

