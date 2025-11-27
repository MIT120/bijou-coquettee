export type NavChildItem = {
    key: string
    href: string
    translationKey: string
}

export type NavItem = {
    key: string
    href: string
    translationKey: string
    children?: NavChildItem[]
}

export type TranslatedNavChild = NavChildItem & {
    label: string
}

export type TranslatedNavItem = NavItem & {
    label: string
    children?: TranslatedNavChild[]
}

export const NAV_ITEMS: NavItem[] = [
    {
        key: "home",
        href: "/",
        translationKey: "navigation.home",
    },
    {
        key: "jewelry",
        href: "/store",
        translationKey: "navigation.jewelry",
        children: [
            {
                key: "jewelry-earrings",
                href: "/categories/earrings",
                translationKey: "navigation.jewelry_earrings",
            },
            {
                key: "jewelry-bracelets",
                href: "/categories/bracelets",
                translationKey: "navigation.jewelry_bracelets",
            },
            {
                key: "jewelry-necklaces",
                href: "/categories/necklaces",
                translationKey: "navigation.jewelry_necklaces",
            },
        ],
    },
    {
        key: "accessories",
        href: "/categories/sets",
        translationKey: "navigation.accessories",
    },
    {
        key: "collections",
        href: "/collections",
        translationKey: "navigation.collections",
    },
    {
        key: "promo",
        href: "/#promo",
        translationKey: "navigation.promo",
    },
    {
        key: "about",
        href: "/#about",
        translationKey: "navigation.about",
    },
]

