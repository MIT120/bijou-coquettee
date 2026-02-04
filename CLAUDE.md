# CLAUDE.md - Bijou Coquettee Monorepo

## Project Overview

**Bijou Coquettee** is a modern jewelry e-commerce platform and marketplace built with Medusa.js v2 backend and Next.js 15 storefront. The platform provides an elegant shopping experience for jewelry customers with jewelry-specific features.

### Business Goal
Create a premium online jewelry marketplace with:
- Beautiful product presentation for jewelry items
- Jewelry-specific features (size guides, measurements)
- Regional shipping integration (Econt for Bulgaria)
- Customer engagement (wishlists, reviews)
- Email marketing campaigns with discount codes
- Multi-currency and multi-region support

---

## Repository Structure

```
bijou-coquettee/
├── bijou-coquettee/              # Backend (Medusa.js v2.11.1)
│   ├── src/
│   │   ├── admin/                # Admin panel extensions (React components)
│   │   │   ├── routes/           # Custom admin pages
│   │   │   │   ├── econt-shipments/page.tsx
│   │   │   │   └── email-campaigns/page.tsx
│   │   │   └── widgets/          # Dashboard widgets
│   │   │       └── econt-shipping-widget.tsx
│   │   ├── api/                  # REST API endpoints
│   │   │   ├── admin/            # Protected admin APIs
│   │   │   │   ├── econt/        # Shipment management
│   │   │   │   └── email-campaigns/
│   │   │   ├── store/            # Public store APIs
│   │   │   │   ├── campaigns/    # Email campaigns
│   │   │   │   ├── products/[id]/comments/
│   │   │   │   ├── wishlist/     # Wishlist operations
│   │   │   │   ├── size-guide/   # Jewelry sizes
│   │   │   │   └── econt/        # Shipping locations
│   │   │   └── middlewares.ts    # Auth & CORS middleware
│   │   ├── modules/              # Custom Medusa modules (5 total)
│   │   │   ├── wishlist/         # Customer wishlists
│   │   │   ├── product-comments/ # Product reviews
│   │   │   ├── size-guide/       # Jewelry sizing
│   │   │   ├── econt-shipping/   # Bulgarian courier
│   │   │   └── email-campaign/   # Marketing automation
│   │   ├── workflows/            # Business workflows
│   │   ├── subscribers/          # Event handlers
│   │   │   └── econt-shipment.ts # Order.placed → create shipment
│   │   ├── jobs/                 # Scheduled tasks
│   │   │   └── sync-econt-shipments.ts  # Every 30 min
│   │   └── scripts/              # Utility scripts
│   ├── static/                   # Uploaded assets
│   └── CLAUDE.md                 # Backend-specific docs
│
├── bijou-coquettee-storefront/   # Frontend (Next.js 15.3.1)
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   └── [countryCode]/    # Country-based routing
│   │   │       ├── (main)/       # Main layout (nav, footer)
│   │   │       │   ├── account/  # User dashboard (parallel routes)
│   │   │       │   │   ├── @dashboard/
│   │   │       │   │   └── @login/
│   │   │       │   ├── products/[handle]/
│   │   │       │   ├── collections/[handle]/
│   │   │       │   ├── categories/[...category]/
│   │   │       │   ├── cart/
│   │   │       │   ├── wishlist/
│   │   │       │   └── search/
│   │   │       └── (checkout)/   # Checkout layout (isolated)
│   │   ├── modules/              # Feature modules
│   │   │   ├── campaigns/        # Banner & popup components
│   │   │   ├── products/         # Product display, reviews, size guide
│   │   │   ├── checkout/         # Multi-step checkout, Econt form
│   │   │   ├── cart/             # Shopping cart UI
│   │   │   ├── account/          # User account management
│   │   │   ├── layout/           # Nav, footer, search
│   │   │   ├── home/             # Homepage sections
│   │   │   └── common/           # Shared components, icons
│   │   └── lib/                  # Utilities & data
│   │       ├── data/             # Server-side data fetching
│   │       ├── hooks/            # Custom React hooks
│   │       ├── context/          # Context providers
│   │       ├── util/             # Utility functions
│   │       └── config.ts         # Medusa SDK setup
│   └── CLAUDE.md                 # Frontend-specific docs
│
├── init-scripts/                 # Database init scripts
├── scripts/                      # Deployment scripts
├── docker-compose.yml            # Local development
└── env.example                   # Environment template
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Backend** | Medusa.js | v2.11.1 |
| **Backend Language** | TypeScript | 5.6.2 |
| **Frontend** | Next.js | 15.3.1 |
| **Frontend React** | React | 19.0.0-rc |
| **Database** | PostgreSQL | 15 |
| **Cache** | Redis | 7 |
| **Styling** | Tailwind CSS | 3.0.23 |
| **UI Components** | Radix UI, @medusajs/ui | - |
| **Payments** | Stripe | - |
| **Shipping** | Econt (Bulgaria) | - |
| **i18n** | next-intl | 4.5.3 |

---

## Custom Modules (Backend)

### 1. Wishlist Module (`src/modules/wishlist/`)
**Purpose**: Customer wishlist management for saving products

**Service**: `WishlistModuleService`
```typescript
// Key methods
getOrCreateWishlist(customerId)    // Lazy create wishlist
addItemToWishlist(wishlistId, productId, variantId)
removeItemFromWishlist(itemId)
isProductInWishlist(wishlistId, productId)
generateShareToken(wishlistId)     // Make wishlist shareable
getSharedWishlist(token)           // View public wishlist
```

**Models**: `Wishlist`, `WishlistItem`
- Supports guest and authenticated wishlists
- Shareable via unique tokens

### 2. Product Comments Module (`src/modules/product-comments/`)
**Purpose**: Customer product reviews with moderation

**Service**: `ProductCommentsModuleService`
```typescript
createComment(productId, data)     // Create review (auto-approved)
listVisibleComments(productId)     // Get approved comments
```

**Model**: `ProductComment`
- Fields: content, rating, status (pending/approved/rejected)
- Supports guest reviews with email capture
- **Note**: Currently auto-approves all comments

### 3. Size Guide Module (`src/modules/size-guide/`)
**Purpose**: Jewelry size charts and measurement conversion

**Service**: `SizeGuideModuleService`
```typescript
getSizeChart(category)             // Get sizes for category
getMeasurementGuide(category)      // Get measurement instructions
findSizeByMeasurement(input)       // Find closest size match
```

**Models**: `SizeGuide`, `MeasurementGuide`
- Categories: rings, necklaces, bracelets, chains
- Standards: US, UK, EU, Asia

### 4. Econt Shipping Module (`src/modules/econt-shipping/`)
**Purpose**: Bulgarian Econt courier integration

**Service**: `EcontShippingModuleService`
```typescript
searchLocations(type, query)       // Search offices/cities/streets
saveCartPreference(input)          // Store delivery preference
createShipmentFromOrder(orderId)   // Create draft shipment
registerShipment(shipmentId)       // Register with Econt API
syncShipmentStatus(shipmentId)     // Update tracking info
syncMultipleShipments(ids)         // Batch sync
calculateShipment(cartId)          // Get shipping cost
cancelShipment(shipmentId)         // Cancel shipment
```

**Models**: `EcontShipment`, `EcontLocation`
- Delivery types: Office pickup, Address delivery
- COD (Cash on Delivery) support
- Saturday delivery option
- Status flow: draft → ready → registered → in_transit → delivered/cancelled

**Client**: `EcontApiClient`
- Handles Econt REST API authentication
- Automatic status mapping

### 5. Email Campaign Module (`src/modules/email-campaign/`)
**Purpose**: Marketing campaigns with discount code distribution

**Service**: `EmailCampaignModuleService`
```typescript
getActiveCampaign()                // Get current campaign
createSubscription(campaignId, email, prefix)
getSubscriptionByEmail(campaignId, email)
markCodeUsed(subscriptionId)
getCampaignStats(campaignId)       // Total/used/conversion
generateUniqueCode(prefix)         // 6-char alphanumeric
```

**Models**: `EmailCampaign`, `EmailSubscription`
- Unique code format: `{PREFIX}-{RANDOM6CHARS}` (e.g., `SUMMER24-ABC123`)
- Integrates with Medusa promotions system
- Banner/popup display settings

---

## API Endpoints

### Store API (Public)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/store/wishlist` | GET | Get customer wishlist |
| `/store/wishlist` | DELETE | Clear wishlist |
| `/store/wishlist/items` | POST | Add item |
| `/store/wishlist/items/[id]` | DELETE | Remove item |
| `/store/wishlist/check` | POST | Check if product in wishlist |
| `/store/wishlist/share` | POST | Generate share token |
| `/store/wishlist/shared/[token]` | GET | View shared wishlist |
| `/store/products/[id]/comments` | GET | Get product comments |
| `/store/products/[id]/comments` | POST | Add comment |
| `/store/size-guide` | GET | List all categories |
| `/store/size-guide/[category]` | GET | Get size chart |
| `/store/size-guide/find-size` | POST | Find size by measurement |
| `/store/econt/locations` | GET | Search offices/cities |
| `/store/econt/preferences` | POST | Save delivery preference |
| `/store/econt/preferences?cart_id=` | GET | Get preference |
| `/store/campaigns/active` | GET | Get active campaign |
| `/store/campaigns/subscribe` | POST | Subscribe to campaign |
| `/store/campaigns/check-email` | POST | Check email discount |

### Admin API (Protected)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/econt/shipments` | GET | List shipments |
| `/admin/econt/shipments` | POST | Create shipment |
| `/admin/econt/shipments/[id]` | GET | Get shipment details |
| `/admin/econt/shipments/[id]` | PATCH | Update shipment |
| `/admin/econt/shipments/[id]/register` | POST | Register with Econt |
| `/admin/econt/shipments/[id]/sync` | POST | Sync tracking |
| `/admin/econt/locations` | GET | Search locations |
| `/admin/email-campaigns` | GET | List campaigns |
| `/admin/email-campaigns` | POST | Create campaign |
| `/admin/email-campaigns/[id]` | GET | Get campaign |
| `/admin/email-campaigns/[id]` | PATCH | Update campaign |
| `/admin/email-campaigns/[id]` | DELETE | Delete campaign |
| `/admin/email-campaigns/[id]/subscriptions` | GET | List subscribers |

---

## Background Jobs & Subscribers

### Job: Sync Econt Shipments
**File**: `src/jobs/sync-econt-shipments.ts`
**Schedule**: Every 30 minutes (`*/30 * * * *`)
```typescript
// Logic:
// 1. Fetch shipments with status: REGISTERED, IN_TRANSIT, READY
// 2. Filter to only those with waybill_number
// 3. Batch sync in groups of 20 (with 1s delay between batches)
// 4. Update tracking info, delivery attempts, expected dates
```

### Subscriber: Order Placed
**File**: `src/subscribers/econt-shipment.ts`
**Event**: `order.placed`
```typescript
// Action: Creates "ready" shipment from cart preference
// Workflow: Order placed → shipment created → admin reviews → admin registers
```

---

## Frontend Architecture

### Routing Structure
```
/[countryCode]/                    # Homepage
/[countryCode]/products/[handle]   # Product detail
/[countryCode]/collections/[handle] # Collection
/[countryCode]/categories/[...cat] # Category (multi-level)
/[countryCode]/cart                # Shopping cart
/[countryCode]/checkout            # Checkout flow
/[countryCode]/account             # User account
/[countryCode]/account/@dashboard  # Dashboard (parallel route)
/[countryCode]/account/@login      # Login (parallel route)
/[countryCode]/wishlist            # Wishlists
/[countryCode]/search              # Search results
```

### Data Fetching
- **Server Components**: Default for all pages
- **SDK**: `@medusajs/js-sdk` via `src/lib/config.ts`
- **Caching**: Next.js cache tags (`revalidateTag`)
- **Auth**: Server-side via `getAuthHeaders()`, `setAuthToken()`

### Key Modules (Frontend)

| Module | Purpose |
|--------|---------|
| `campaigns/` | DiscountBanner (24h dismiss), EmailSubscriptionPopup (7d dismiss) |
| `products/` | ImageGallery, SizeGuide, Comments, RelatedProducts, WishlistButton |
| `checkout/` | AddressForm, EcontShippingForm, PaymentWrapper (Stripe) |
| `cart/` | CartItem, CartSummary, CartPreview (mini-cart) |
| `account/` | ProfileEditor, OrderHistory, AddressBook, WishlistView |
| `layout/` | Nav, Footer, CartButton, CountrySelect, SearchBar |

### Context Providers
- `WishlistProvider` - Manages wishlist state (auth + guest/localStorage)
- `ModalContext` - Modal dialog state
- `AnalyticsContext` - Analytics tracking

---

## Known Issues & Recommendations

### Critical Issues

#### 1. Econt Demo Credentials Fallback
**Location**: `bijou-coquettee/src/modules/econt-shipping/service.ts:24-33`
```typescript
// ISSUE: Falls back to demo credentials if env vars missing
const username = process.env.ECONT_API_USERNAME || "iasp-dev"
const password = process.env.ECONT_API_PASSWORD || "1Asp-dev"
```
**Risk**: Production shipments could route to demo Econt
**Fix**: Fail fast instead of silent fallback
```typescript
if (!process.env.ECONT_API_USERNAME || !process.env.ECONT_API_PASSWORD) {
  throw new Error("[EcontShipping] Missing ECONT_API_USERNAME or ECONT_API_PASSWORD")
}
```

#### 2. Promotion Creation Error Swallowed
**Location**: `bijou-coquettee/src/api/store/campaigns/subscribe/route.ts:97-113`
```typescript
// ISSUE: Subscription created but promotion might fail silently
} catch (promoError) {
    console.error("Failed to create Medusa promotion:", promoError)
    // Continue anyway - the subscription was created
}
```
**Risk**: User gets discount code that doesn't work at checkout
**Fix**: Either rollback subscription or return warning to user

#### 3. Type-Unsafe Auth Context
**Location**: Multiple store routes
```typescript
// ISSUE: No type safety
(req as any).auth_context?.actor_id
```
**Fix**: Create typed auth helper function

### Moderate Issues

#### 4. Product Comments Auto-Approval
**Location**: `bijou-coquettee/src/modules/product-comments/service.ts:32`
**Issue**: All comments auto-approved on creation
**Risk**: Spam/inappropriate content published immediately
**Fix**: Default to "pending" status

#### 5. Wishlist Share Token Not Unique Constrained
**Location**: `bijou-coquettee/src/modules/wishlist/service.ts:190-198`
**Issue**: No database unique constraint on share_token
**Fix**: Add unique constraint in migration

#### 6. No Rate Limiting
**Locations**: Comment creation, campaign subscription
**Risk**: Spam attack vectors
**Fix**: Add rate limiting middleware

#### 7. Inconsistent Email Normalization
**Issue**: Some places normalize email (`toLowerCase().trim()`), others don't
**Fix**: Create shared `normalizeEmail()` utility

### Frontend Issues

#### 8. Wishlist Server Fetch Disabled
**Location**: `bijou-coquettee-storefront/src/app/[countryCode]/(main)/layout.tsx`
```typescript
// DISABLED: Wishlist fetch temporarily disabled
```
**Status**: Client-side wishlist still works

#### 9. Newsletter Not Implemented
**Location**: `bijou-coquettee-storefront/src/modules/home/components/newsletter/index.tsx`
```typescript
// TODO: Implement newsletter subscription
```

#### 10. Duplicate Cookie Utilities
**Issue**: `getCookie`/`setCookie` duplicated in banner and popup components
**Fix**: Extract to `lib/util/cookies.ts`

#### 11. Environment URL Inconsistency
**Issue**: Different fallback patterns for backend URL
```typescript
// campaigns.ts
process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
// discount-banner/index.tsx
process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
```
**Fix**: Standardize in single config file

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### 1. Start Infrastructure
```bash
docker-compose up -d
# PostgreSQL: localhost:5432
# Redis: localhost:6379
# pgAdmin: localhost:8080
```

### 2. Setup Backend
```bash
cd bijou-coquettee
npm install
cp .env.example .env  # Configure environment
npm run build
npm run seed
npm run dev           # Start on port 9000
```

### 3. Setup Frontend
```bash
cd bijou-coquettee-storefront
npm install
cp .env.example .env.local
npm run dev           # Start on port 8000
```

### Access Points
| Service | URL |
|---------|-----|
| Storefront | http://localhost:8000 |
| Backend API | http://localhost:9000 |
| Admin Panel | http://localhost:9000/app |
| pgAdmin | http://localhost:8080 |

---

## Environment Configuration

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medusa

# Redis
REDIS_URL=redis://localhost:6379

# Security (REQUIRED - generate secure values)
JWT_SECRET=your-secure-jwt-secret
COOKIE_SECRET=your-secure-cookie-secret

# CORS
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000

# Econt Shipping (REQUIRED for production)
ECONT_API_USERNAME=your-username
ECONT_API_PASSWORD=your-password
ECONT_API_BASE_URL=https://ee.econt.com/services
ECONT_SENDER_CLIENT_NUMBER=your-client-number
ECONT_IS_DEMO=false

# Econt COD Payout
ECONT_CD_AGREEMENT_NUM=your-agreement
ECONT_PAYOUT_METHOD=bank           # bank|office|door
ECONT_PAYOUT_IBAN=your-iban
ECONT_PAYOUT_BIC=your-bic

# Stripe
STRIPE_API_KEY=sk_live_...
```

### Frontend (.env.local)
```env
# Backend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_BACKEND_URL=http://localhost:9000

# Stripe
NEXT_PUBLIC_STRIPE_KEY=pk_live_...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Cache
REVALIDATE_WINDOW=60
```

---

## Development Workflow

### Adding a New Module (Backend)
1. Create module in `src/modules/[name]/`
2. Define models in `models/`
3. Implement service extending `MedusaService`
4. Create migrations in `migrations/`
5. Export in `index.ts`
6. Register in `medusa-config.ts`

### Adding a Feature (Frontend)
1. Create module in `src/modules/[name]/`
2. Add components in `components/`
3. Create data fetching in `lib/data/`
4. Add routes in `app/[countryCode]/(main)/`

### Adding a Scheduled Job
1. Create job in `src/jobs/[name].ts`
2. Export config with cron schedule
3. Job auto-registers on startup

---

## Utility Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| `seed.ts` | Seed database with sample data | `npm run seed` |
| `create-admin.ts` | Create admin user | `npm run create-admin` |
| `sync-campaign-promotions.ts` | Sync subscriptions with promotions | `npx ts-node src/scripts/sync-campaign-promotions.ts` |
| `add-sofia-location.ts` | Create Sofia warehouse location | `npx ts-node src/scripts/add-sofia-location.ts` |
| `ensure-bulgaria-in-stock.ts` | Manage Bulgaria inventory | `npx ts-node src/scripts/ensure-bulgaria-in-stock.ts` |
| `check-inventory-setup.ts` | Validate inventory configuration | `npx ts-node src/scripts/check-inventory-setup.ts` |
| `fix-inventory-availability.ts` | Fix inventory issues | `npx ts-node src/scripts/fix-inventory-availability.ts` |

---

## Deployment

### Production Architecture
```
┌─────────────┐     ┌─────────────┐
│  Vercel     │────▶│  Medusa     │
│  (Frontend) │     │  (Backend)  │
└─────────────┘     └──────┬──────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         ┌────────┐  ┌────────┐  ┌────────┐
         │Supabase│  │ Redis  │  │ Stripe │
         │(Postgres)│ │(Cache) │  │(Payments)│
         └────────┘  └────────┘  └────────┘
```

### Deployment Checklist
- [ ] Configure production database (Supabase recommended)
- [ ] Setup Redis for sessions/cache (Upstash recommended)
- [ ] Set Stripe production keys
- [ ] Set Econt production credentials
- [ ] Configure CORS for production domains
- [ ] Generate secure JWT_SECRET and COOKIE_SECRET
- [ ] Enable SSL/HTTPS
- [ ] Test Econt shipment flow end-to-end
- [ ] Test campaign subscription and checkout discount

---

## Project Conventions

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier
- Functional React components
- Server Components by default (Next.js)

### Naming
- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database columns: `snake_case`

### Git Branches
- `main` - Production
- `feat/*` - New features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance

---

## Troubleshooting

### Database Connection Issues
```bash
docker-compose ps
docker-compose logs postgres
```

### Backend Won't Start
```bash
npm run build
npm run dev 2>&1 | head -50
```

### Frontend API Errors
1. Verify `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is correct
2. Check backend CORS configuration (`STORE_CORS`)
3. Ensure backend is running and accessible

### Campaign Not Displaying
1. Verify campaign dates (must be within start_date and end_date)
2. Check `banner_enabled` or `popup_enabled` in admin
3. Clear browser cookies (banner dismisses for 24h, popup for 7 days)
4. Check browser console for errors

### Econt Shipment Issues
1. Verify Econt credentials are not demo credentials
2. Check shipment status (must be "draft" or "ready" to register)
3. Ensure waybill_number exists before syncing
4. Check Econt API response in `raw_response` field

### Wishlist Not Syncing
1. Check if customer is authenticated
2. Client-side wishlist uses localStorage for guests
3. Server-side fetch may be disabled (check layout.tsx)

---

## Resources

- [Medusa.js v2 Documentation](https://docs.medusajs.com)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Econt API Documentation](https://www.econt.com/developers)
- [Radix UI](https://www.radix-ui.com/docs)
