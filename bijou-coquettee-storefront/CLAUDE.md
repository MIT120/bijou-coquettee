# CLAUDE.md - Bijou Coquettee Storefront

## Project Overview

Bijou Coquettee Storefront is a **Next.js 15 e-commerce frontend** for a jewelry marketplace. It provides customers with a beautiful, fast shopping experience for browsing and purchasing jewelry products.

**Goal**: Elegant, modern jewelry shopping experience with size guides, wishlists, reviews, and integrated Bulgarian shipping (Econt).

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.3.1 | React framework (App Router) |
| React | 19.0.0-rc | UI library |
| TypeScript | - | Type-safe development |
| Tailwind CSS | 3.0.23 | Utility-first styling |
| @medusajs/ui | - | UI component library |
| @medusajs/js-sdk | - | Medusa API client |
| Radix UI | - | Accessible UI primitives |
| Headless UI | - | Unstyled accessible components |
| Stripe | - | Payment processing |
| next-intl | 4.5.3 | Internationalization |
| lucide-react | - | Icon library |

---

## Project Structure

```
src/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout (metadata, analytics)
│   ├── not-found.tsx               # Global 404
│   └── [countryCode]/              # Country-based routing
│       ├── (main)/                 # Main layout (nav + footer)
│       │   ├── layout.tsx          # Main layout with campaigns
│       │   ├── page.tsx            # Homepage
│       │   ├── products/[handle]/page.tsx
│       │   ├── collections/[handle]/page.tsx
│       │   ├── categories/[...category]/page.tsx
│       │   ├── cart/page.tsx
│       │   ├── wishlist/page.tsx
│       │   ├── search/page.tsx
│       │   ├── store/page.tsx
│       │   ├── account/            # Parallel routes
│       │   │   ├── @dashboard/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── profile/page.tsx
│       │   │   │   ├── addresses/page.tsx
│       │   │   │   ├── orders/page.tsx
│       │   │   │   ├── orders/details/[id]/page.tsx
│       │   │   │   └── wishlist/page.tsx
│       │   │   └── @login/page.tsx
│       │   └── order/[id]/
│       │       ├── confirmed/page.tsx
│       │       └── transfer/[token]/page.tsx
│       └── (checkout)/             # Checkout layout (isolated)
│           ├── layout.tsx
│           └── checkout/page.tsx
│
├── modules/                        # Feature modules
│   ├── campaigns/                  # Email marketing UI
│   │   └── components/
│   │       ├── discount-banner/index.tsx      # Top banner (24h dismiss)
│   │       └── email-subscription-popup/index.tsx  # Modal (7d dismiss)
│   │
│   ├── products/                   # Product catalog
│   │   ├── components/
│   │   │   ├── image-gallery/      # Product images with zoom
│   │   │   ├── product-actions/    # Add to cart, options
│   │   │   │   ├── index.tsx
│   │   │   │   ├── option-select.tsx
│   │   │   │   └── mobile-actions.tsx
│   │   │   ├── product-comments/   # Reviews & ratings
│   │   │   │   ├── index.tsx
│   │   │   │   └── product-comments-client.tsx
│   │   │   ├── product-preview/    # Product card
│   │   │   ├── product-price/
│   │   │   ├── product-tabs/       # Details accordion
│   │   │   ├── related-products/
│   │   │   ├── size-guide/         # Jewelry sizing
│   │   │   │   ├── index.tsx
│   │   │   │   ├── size-chart.tsx
│   │   │   │   ├── size-finder.tsx
│   │   │   │   └── measurement-guide.tsx
│   │   │   ├── size-guide-button/
│   │   │   ├── thumbnail/
│   │   │   └── wishlist-button/
│   │   └── templates/
│   │       ├── index.tsx
│   │       └── product-info/
│   │
│   ├── cart/                       # Shopping cart
│   │   ├── components/
│   │   │   ├── cart-item-select/
│   │   │   └── item/
│   │   └── templates/
│   │       ├── index.tsx           # Cart page
│   │       ├── items.tsx
│   │       ├── preview.tsx         # Mini-cart dropdown
│   │       └── summary.tsx
│   │
│   ├── checkout/                   # Checkout flow
│   │   ├── components/
│   │   │   ├── addresses/          # Address form
│   │   │   ├── billing_address/
│   │   │   ├── checkout-progress/  # Step indicator
│   │   │   ├── discount-code/
│   │   │   ├── econt-shipping-form/ # Econt integration
│   │   │   ├── payment/
│   │   │   ├── payment-wrapper/    # Stripe wrapper
│   │   │   ├── review/             # Order review
│   │   │   ├── shipping/           # Shipping method
│   │   │   └── trust-signals/
│   │   └── templates/
│   │       ├── checkout-form/
│   │       └── checkout-summary/
│   │
│   ├── account/                    # User account
│   │   ├── components/
│   │   │   ├── account-info/
│   │   │   ├── address-book/
│   │   │   ├── address-card/
│   │   │   ├── order-card/
│   │   │   ├── order-overview/
│   │   │   ├── profile-*/          # Profile sections
│   │   │   └── transfer-request-form/
│   │   └── templates/
│   │       ├── account-layout.tsx
│   │       ├── login-template.tsx
│   │       └── wishlist-template.tsx
│   │
│   ├── layout/                     # Navigation & structure
│   │   ├── components/
│   │   │   ├── cart-button/
│   │   │   ├── cart-dropdown/
│   │   │   ├── cart-mismatch-banner/
│   │   │   ├── country-select/
│   │   │   ├── desktop-nav-links/
│   │   │   ├── language-switcher/
│   │   │   ├── search-bar/
│   │   │   ├── search-overlay/
│   │   │   ├── side-menu/
│   │   │   └── wishlist-nav/
│   │   └── templates/
│   │       ├── footer/
│   │       └── nav/
│   │
│   ├── home/                       # Homepage sections
│   │   └── components/
│   │       ├── hero/
│   │       ├── featured-products/
│   │       ├── featured-categories/
│   │       ├── brand-story/
│   │       ├── testimonials/
│   │       ├── service-highlights/
│   │       ├── gift-guide/
│   │       ├── care-guide/
│   │       ├── newsletter/         # TODO: Not implemented
│   │       └── lookbook-carousel/
│   │
│   ├── order/                      # Order management
│   │   ├── components/
│   │   │   ├── order-details/
│   │   │   ├── order-summary/
│   │   │   ├── shipping-details/
│   │   │   └── transfer-actions/
│   │   └── templates/
│   │
│   ├── common/                     # Shared components
│   │   ├── components/
│   │   │   ├── checkbox/
│   │   │   ├── delete-button/
│   │   │   ├── input/
│   │   │   ├── modal/
│   │   │   ├── native-select/
│   │   │   └── radio/
│   │   └── icons/                  # 20+ SVG icons
│   │
│   ├── skeletons/                  # Loading states
│   │   ├── components/
│   │   └── templates/
│   │
│   └── shipping/
│       └── components/
│           └── free-shipping-price-nudge/
│
├── lib/                            # Utilities & data
│   ├── config.ts                   # Medusa SDK initialization
│   ├── constants.tsx               # Payment icons, etc.
│   │
│   ├── data/                       # Server-side data fetching
│   │   ├── campaigns.ts            # Campaign APIs
│   │   ├── cart.ts                 # Cart operations
│   │   ├── categories.ts
│   │   ├── collections.ts
│   │   ├── comments.ts             # Product reviews
│   │   ├── customer.ts             # Auth & profile
│   │   ├── cookies-server.ts
│   │   ├── cookies-client.ts
│   │   ├── fulfillment.ts
│   │   ├── orders.ts
│   │   ├── payment.ts
│   │   ├── products.ts
│   │   ├── regions.ts
│   │   ├── size-guide.ts
│   │   └── wishlist.ts
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-in-view.tsx         # Intersection Observer
│   │   ├── use-toggle-state.tsx
│   │   ├── use-synced-locale.tsx
│   │   └── use-campaign-discount.tsx  # Empty (TODO)
│   │
│   ├── context/                    # Context providers
│   │   ├── modal-context.tsx
│   │   ├── wishlist-context.tsx    # Auth + guest support
│   │   └── analytics-context.tsx
│   │
│   ├── util/                       # Utility functions
│   │   ├── compare-addresses.ts
│   │   ├── env.ts
│   │   ├── get-percentage-diff.ts
│   │   ├── get-product-price.ts
│   │   ├── isEmpty.ts
│   │   ├── medusa-error.ts
│   │   ├── money.ts                # Currency formatting
│   │   ├── prices.ts
│   │   ├── product.ts
│   │   ├── repeat.ts
│   │   ├── sort-products.ts
│   │   ├── translations.ts
│   │   └── translations-server.ts
│   │
│   └── components/
│       ├── analytics-wrapper.tsx
│       └── meta-pixel.tsx
│
├── i18n/                           # Internationalization
├── types/                          # TypeScript definitions
└── styles/                         # Global styles
```

---

## Key Features

### 1. Product Catalog
- Grid/list views with filtering
- Image galleries with zoom
- Variant selection
- Related products

### 2. Jewelry Size Guides
**Location**: `modules/products/components/size-guide/`
- Ring sizing (US, UK, EU, Asia)
- Necklace/chain lengths
- Bracelet sizing
- Interactive measurement finder

### 3. Wishlist System
**Location**: `lib/context/wishlist-context.tsx`
- Works for authenticated and guest users
- Guest wishlists use localStorage
- Shareable wishlists

### 4. Product Reviews
**Location**: `modules/products/components/product-comments/`
- Customer ratings and reviews
- Guest and authenticated reviews
- Server-side data fetching

### 5. Econt Shipping (Bulgaria)
**Location**: `modules/checkout/components/econt-shipping-form/`
- Office pickup selection
- Address delivery
- Real-time location search
- Saturday delivery option

### 6. Email Campaigns
**Location**: `modules/campaigns/components/`
- `discount-banner/`: Top banner with countdown timer
  - Customizable colors
  - Dismissible for 24 hours
- `email-subscription-popup/`: Modal subscription
  - Appears 5s after page load
  - Dismissible for 7 days
  - Copy-to-clipboard discount code

### 7. Checkout Flow
**Location**: `modules/checkout/`
- Multi-step checkout
- Address validation
- Stripe payment integration
- Order review

---

## Data Fetching Patterns

### Server Components (Default)
```typescript
// lib/data/products.ts
export const getProductByHandle = cache(async (handle: string) => {
  return sdk.store.product.list({ handle })
})
```

### SDK Configuration
**File**: `lib/config.ts`
```typescript
import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
```

### Authentication
- Server: `getAuthHeaders()`, `setAuthToken()`
- Cache: `revalidateTag("carts")`, `revalidateTag("customers")`

### Data Files Summary

| File | Purpose |
|------|---------|
| `campaigns.ts` | getActiveCampaign, subscribeToCampaign, checkEmailDiscount |
| `cart.ts` | retrieveCart, updateCart, addToCart, applyPromotions |
| `products.ts` | listProducts, getProductsByIds, listProductsWithSort |
| `wishlist.ts` | getWishlist, addToWishlist, removeFromWishlist |
| `comments.ts` | getProductComments |
| `orders.ts` | retrieveOrder, listOrders, createTransferRequest |
| `customer.ts` | retrieveCustomer, signup, login |
| `size-guide.ts` | getSizeGuide, findSize |

---

## Routing Structure

### Layout Groups
- `[countryCode]/(main)/` - Main store with nav/footer
- `[countryCode]/(checkout)/` - Checkout without nav/footer

### Parallel Routes (Account)
```
account/
├── @dashboard/       # Authenticated user content
│   ├── page.tsx      # Dashboard home
│   ├── profile/
│   ├── addresses/
│   ├── orders/
│   └── wishlist/
└── @login/           # Login form
    └── page.tsx
```

### Dynamic Routes
```
/[countryCode]/products/[handle]           # Product detail
/[countryCode]/collections/[handle]        # Collection
/[countryCode]/categories/[...category]    # Multi-level category
/[countryCode]/account/@dashboard/orders/details/[id]
/[countryCode]/order/[id]/confirmed
/[countryCode]/order/[id]/transfer/[token]
```

---

## Context Providers

### WishlistProvider
**File**: `lib/context/wishlist-context.tsx`
```typescript
// Provides:
wishlist: WishlistItem[]
isInWishlist(productId: string): boolean
addToWishlist(productId: string, variantId?: string): void
removeFromWishlist(productId: string): void
clearWishlist(): void
isLoading: boolean
```
- Uses localStorage for guests
- Syncs with backend for authenticated users

### ModalContext
**File**: `lib/context/modal-context.tsx`
- Manages modal dialog state

### AnalyticsContext
**File**: `lib/context/analytics-context.tsx`
- Analytics tracking

---

## Development Commands

```bash
# Install dependencies
npm install

# Development (with Turbopack)
npm run dev              # Port 8000

# Build
npm run build

# Production
npm run start

# Linting
npm run lint

# Bundle analysis
npm run analyze
```

---

## Environment Variables

```env
# Backend API
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...

# Stripe
NEXT_PUBLIC_STRIPE_KEY=pk_test_...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Cache
REVALIDATE_WINDOW=60
```

---

## Known Issues

### 1. Wishlist Server Fetch Disabled
**File**: `app/[countryCode]/(main)/layout.tsx`
```typescript
// DISABLED: Wishlist fetch temporarily disabled
```
Client-side wishlist still works via localStorage.

### 2. Newsletter Not Implemented
**File**: `modules/home/components/newsletter/index.tsx`
```typescript
// TODO: Implement newsletter subscription
```
Component exists but functionality incomplete.

### 3. use-campaign-discount Hook Empty
**File**: `lib/hooks/use-campaign-discount.tsx`
Hook file exists but has no implementation.

### 4. Duplicate Cookie Utilities
**Issue**: `getCookie`/`setCookie` functions duplicated in:
- `modules/campaigns/components/discount-banner/index.tsx`
- `modules/campaigns/components/email-subscription-popup/index.tsx`

**Fix**: Extract to `lib/util/cookies.ts`

### 5. Environment URL Inconsistency
**Issue**: Different fallback patterns:
```typescript
// campaigns.ts
process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

// discount-banner/index.tsx
process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
```

**Fix**: Standardize in `lib/config.ts`

### 6. Missing Loading States
- Econt form: No loading indicator during city/office fetch
- Some cart operations lack skeleton screens

### 7. Campaign Type Not Shared
**Issue**: Campaign type defined inline in components
```typescript
type Campaign = {
  id: string
  name: string
  // ...
}
```

**Fix**: Create `types/campaign.ts` shared type

---

## Performance Optimizations

- Server Components by default
- Image optimization via `next/image`
- Route-based code splitting
- Caching with `unstable_cache`
- Turbopack for development

---

## Styling Guidelines

- Use Tailwind CSS classes
- Mobile-first approach
- Use `@medusajs/ui` for consistency
- Custom colors in `tailwind.config.js`

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js configuration |
| `tailwind.config.js` | Tailwind setup |
| `src/lib/config.ts` | Medusa SDK setup |
| `src/middleware.ts` | Route middleware |
| `src/i18n/request.ts` | i18n configuration |

---

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Environment Setup
1. Set `NEXT_PUBLIC_MEDUSA_BACKEND_URL` to production backend
2. Configure Stripe production keys
3. Set proper `NEXT_PUBLIC_BASE_URL`

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Backend CORS allows production domain
- [ ] Test campaign subscription flow
- [ ] Test checkout with Stripe
- [ ] Test Econt shipping form
- [ ] Verify wishlist works (guest and authenticated)

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari
- Chrome Android
