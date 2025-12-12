# CLAUDE.md - Bijou Coquettee Storefront

## Project Overview

Bijou Coquettee Storefront is a **Next.js 15 e-commerce frontend** for a jewelry marketplace. It provides customers with a beautiful, fast shopping experience for browsing and purchasing jewelry products.

**Goal**: Create an elegant, modern jewelry shopping experience with features tailored for jewelry retail - size guides, wishlists, product reviews, and integrated Bulgarian shipping.

## Tech Stack

- **Framework**: Next.js 15.3.1 (App Router)
- **React**: 19.0.0-rc
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.0.23
- **UI Components**: Radix UI, Headless UI, @medusajs/ui
- **API Client**: @medusajs/js-sdk
- **Payments**: Stripe (@stripe/react-stripe-js)
- **i18n**: next-intl 4.5.3
- **Icons**: lucide-react

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── [countryCode]/         # Country-specific routes
│   │   ├── (main)/            # Main layout routes
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── products/      # Product pages
│   │   │   ├── collections/   # Collection pages
│   │   │   ├── categories/    # Category pages
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── checkout/      # Checkout flow
│   │   │   ├── account/       # User account
│   │   │   ├── wishlist/      # Wishlists
│   │   │   ├── order/         # Order history
│   │   │   └── search/        # Search results
│   │   └── (checkout)/        # Checkout layout
│   └── api/                   # API routes
│
├── modules/                   # Feature modules
│   ├── products/              # Product components
│   │   ├── components/
│   │   │   ├── product-actions/
│   │   │   ├── product-comments/
│   │   │   ├── product-preview/
│   │   │   ├── image-gallery/
│   │   │   └── related-products/
│   │   └── templates/
│   │
│   ├── cart/                  # Cart components
│   ├── checkout/              # Checkout flow
│   ├── account/               # User account
│   ├── shipping/              # Econt shipping UI
│   ├── categories/            # Category browsing
│   ├── collections/           # Collections
│   ├── search/                # Search functionality
│   ├── layout/                # Header, footer, nav
│   ├── common/                # Shared components
│   ├── skeletons/             # Loading states
│   └── store/                 # Store utilities
│
├── lib/
│   ├── data/                  # Server-side data fetching
│   │   ├── products.ts        # Product queries
│   │   ├── comments.ts        # Product comments
│   │   ├── wishlist.ts        # Wishlist operations
│   │   ├── customer.ts        # Customer data
│   │   ├── collections.ts     # Collections
│   │   ├── payment.ts         # Payment handling
│   │   ├── fulfillment.ts     # Order fulfillment
│   │   └── regions.ts         # Region handling
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── context/               # Context providers
│   ├── util/                  # Utility functions
│   │   ├── prices.ts          # Price calculations
│   │   ├── money.ts           # Currency formatting
│   │   └── sort-products.ts   # Product sorting
│   └── config.ts              # SDK configuration
│
├── i18n/                      # Internationalization
├── types/                     # TypeScript definitions
└── styles/                    # Global styles
```

## Key Features

### 1. Product Catalog
- Grid and list views
- Filtering by category, collection, price
- Sorting options
- Image galleries with zoom
- Variant selection

### 2. Jewelry Size Guides
- Ring sizing (US, UK, EU, Asia)
- Necklace and chain lengths
- Bracelet sizing
- Measurement conversion tools

### 3. Wishlist System
- Save products for later
- Shareable wishlists
- Quick add to cart from wishlist

### 4. Product Reviews
- Customer comments and ratings
- Moderated reviews
- Guest and authenticated reviews

### 5. Econt Shipping (Bulgaria)
- Office pickup selection
- Address delivery
- Real-time location search
- Saturday delivery option

### 6. Shopping Cart & Checkout
- Real-time cart updates
- Stripe payment integration
- Guest checkout
- Order confirmation

### 7. User Accounts
- Registration and login
- Order history
- Address management
- Profile settings

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Bundle analysis
npm run analyze
```

## Environment Variables

```env
# Backend API
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_BACKEND_URL=http://localhost:9000

# Stripe
NEXT_PUBLIC_STRIPE_KEY=pk_test_...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Revalidation
REVALIDATE_WINDOW=60
```

## Routing Structure

The app uses country-code based routing for multi-region support:

```
/[countryCode]/                    # Homepage
/[countryCode]/products            # All products
/[countryCode]/products/[handle]   # Product detail
/[countryCode]/collections/[handle] # Collection
/[countryCode]/categories/[handle]  # Category
/[countryCode]/cart                 # Shopping cart
/[countryCode]/checkout             # Checkout
/[countryCode]/account              # User account
/[countryCode]/account/orders       # Order history
/[countryCode]/wishlist             # Wishlists
/[countryCode]/search               # Search results
```

## Data Fetching Patterns

### Server Components
```typescript
// lib/data/products.ts
export const getProductByHandle = cache(async (handle: string) => {
  return sdk.store.product.list({ handle })
})
```

### Client Components
```typescript
// Use React hooks with SDK
import { useRegion } from "@lib/hooks/use-region"
```

## Component Architecture

### Module Structure
Each module follows this pattern:
```
modules/[feature]/
├── components/      # UI components
├── templates/       # Page templates
└── actions.ts       # Server actions
```

### Common Components
- `Button`, `Input`, `Modal` - Base UI
- `LocalizedLink` - Country-aware links
- `Thumbnail` - Product images
- `Price` - Formatted prices

## Styling Guidelines

- Use Tailwind CSS classes
- Follow mobile-first approach
- Use `@medusajs/ui` for consistency
- Custom colors defined in `tailwind.config.js`

## Key Files

- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind setup
- `src/lib/config.ts` - Medusa SDK config
- `src/middleware.ts` - Route middleware
- `src/i18n/request.ts` - i18n setup

## Performance Optimizations

- Server Components by default
- Image optimization with `next/image`
- Route-based code splitting
- Caching with `unstable_cache`
- Turbopack for development

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

### Environment Setup
1. Set `NEXT_PUBLIC_MEDUSA_BACKEND_URL` to production backend
2. Configure Stripe production keys
3. Set proper `NEXT_PUBLIC_BASE_URL`

## Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)
