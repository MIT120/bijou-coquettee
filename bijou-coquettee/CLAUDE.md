# CLAUDE.md - Bijou Coquettee Backend

## Project Overview

Bijou Coquettee Backend is a **jewelry e-commerce platform** built on Medusa.js v2.11.1. It serves as the commerce engine handling products, orders, payments, and custom modules for jewelry-specific features.

**Goal**: Modern online jewelry store with marketplace capabilities, Bulgarian shipping (Econt), wishlists, reviews, size guides, and email marketing campaigns.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Medusa.js | v2.11.1 | Headless commerce framework |
| TypeScript | 5.6.2 | Type-safe development |
| PostgreSQL | 15 | Primary database |
| Redis | 7 | Cache & sessions |
| SWC | - | Fast TypeScript transpilation |
| Jest | - | Testing framework |

---

## Project Structure

```
src/
├── api/                        # REST API endpoints
│   ├── admin/                  # Protected admin APIs
│   │   ├── econt/              # Shipment management
│   │   │   ├── locations/route.ts
│   │   │   └── shipments/
│   │   │       ├── route.ts           # GET/POST shipments
│   │   │       └── [id]/
│   │   │           ├── route.ts       # GET/PATCH shipment
│   │   │           ├── register/route.ts  # POST register
│   │   │           └── sync/route.ts      # POST sync
│   │   └── email-campaigns/
│   │       ├── route.ts               # GET/POST campaigns
│   │       └── [id]/
│   │           ├── route.ts           # GET/PATCH/DELETE
│   │           └── subscriptions/route.ts
│   ├── store/                  # Public store APIs
│   │   ├── campaigns/
│   │   │   ├── active/route.ts        # GET active campaign
│   │   │   ├── subscribe/route.ts     # POST subscribe
│   │   │   └── check-email/route.ts   # POST check discount
│   │   ├── products/[product_id]/comments/route.ts
│   │   ├── wishlist/
│   │   │   ├── route.ts               # GET/DELETE
│   │   │   ├── items/route.ts         # POST add
│   │   │   ├── items/[id]/route.ts    # DELETE remove
│   │   │   ├── check/route.ts         # POST check
│   │   │   ├── share/route.ts         # POST generate token
│   │   │   └── shared/[token]/route.ts # GET shared
│   │   ├── size-guide/
│   │   │   ├── route.ts               # GET all categories
│   │   │   ├── [category]/route.ts    # GET category
│   │   │   └── find-size/route.ts     # POST find by measurement
│   │   └── econt/
│   │       ├── locations/route.ts     # GET search
│   │       └── preferences/route.ts   # GET/POST
│   └── middlewares.ts          # Auth & validation
│
├── modules/                    # Custom Medusa modules
│   ├── wishlist/
│   │   ├── index.ts            # Module export
│   │   ├── service.ts          # WishlistModuleService
│   │   ├── models/
│   │   │   ├── wishlist.ts
│   │   │   └── wishlist-item.ts
│   │   └── migrations/
│   │
│   ├── product-comments/
│   │   ├── index.ts
│   │   ├── service.ts          # ProductCommentsModuleService
│   │   ├── models/
│   │   │   └── product-comment.ts
│   │   └── migrations/
│   │
│   ├── size-guide/
│   │   ├── index.ts
│   │   ├── service.ts          # SizeGuideModuleService
│   │   ├── models/
│   │   │   ├── size-guide.ts
│   │   │   └── measurement-guide.ts
│   │   └── migrations/
│   │
│   ├── econt-shipping/
│   │   ├── index.ts
│   │   ├── service.ts          # EcontShippingModuleService
│   │   ├── constants.ts        # Status enums, defaults
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── clients/
│   │   │   └── econt-client.ts # Econt API wrapper
│   │   ├── models/
│   │   │   ├── econt-shipment.ts
│   │   │   └── econt-location.ts
│   │   └── migrations/
│   │
│   └── email-campaign/
│       ├── index.ts
│       ├── service.ts          # EmailCampaignModuleService
│       ├── models/
│       │   ├── email-campaign.ts
│       │   └── email-subscription.ts
│       └── migrations/
│
├── jobs/
│   └── sync-econt-shipments.ts # Every 30 min sync
│
├── subscribers/
│   └── econt-shipment.ts       # order.placed handler
│
├── admin/
│   ├── routes/
│   │   ├── econt-shipments/page.tsx
│   │   └── email-campaigns/page.tsx
│   └── widgets/
│       └── econt-shipping-widget.tsx
│
└── scripts/
    ├── seed.ts
    ├── create-admin.ts
    ├── seed-size-guide.ts
    ├── add-sofia-location.ts
    ├── ensure-bulgaria-in-stock.ts
    ├── check-inventory-setup.ts
    ├── fix-inventory-availability.ts
    └── sync-campaign-promotions.ts
```

---

## Custom Modules Detail

### 1. Wishlist Module

**Service**: `WishlistModuleService`

```typescript
// Core methods
getOrCreateWishlist(customerId: string)
getWishlistWithItems(customerId: string)
addItemToWishlist(wishlistId: string, productId: string, variantId?: string)
removeItemFromWishlist(itemId: string)
isProductInWishlist(wishlistId: string, productId: string)
generateShareToken(wishlistId: string)   // Returns unique share URL
getSharedWishlist(token: string)         // Public access
clearWishlist(wishlistId: string)
```

**Models**:
```typescript
Wishlist {
  id: string
  customer_id: string
  name: string
  is_public: boolean
  share_token: string | null  // 32-char random token
  created_at: Date
  updated_at: Date
}

WishlistItem {
  id: string
  wishlist_id: string
  product_id: string
  variant_id: string | null
  added_at: Date
}
```

### 2. Product Comments Module

**Service**: `ProductCommentsModuleService`

```typescript
createComment(productId: string, data: {
  content: string
  author_name: string
  rating?: number
  customer_id?: string
  guest_email?: string
})

listVisibleComments(productId: string, options?: {
  limit?: number
  offset?: number
})
```

**Model**:
```typescript
ProductComment {
  id: string
  product_id: string
  customer_id: string | null
  guest_email: string | null
  author_name: string
  content: string
  rating: number | null       // 1-5
  status: 'pending' | 'approved' | 'rejected'
  is_public: boolean
  created_at: Date
}
```

**Note**: Currently auto-approves all comments. Consider changing to "pending" for moderation.

### 3. Size Guide Module

**Service**: `SizeGuideModuleService`

```typescript
getSizeChart(category: string)           // Get all sizes for category
getMeasurementGuide(category: string)    // Get measurement instructions
getCategoryData(category: string)        // Combined chart + guide

findSizeByMeasurement(input: {
  category: string
  circumference_mm?: number
  diameter_mm?: number
  length_cm?: number
})  // Returns closest matching size
```

**Models**:
```typescript
SizeGuide {
  id: string
  category: string           // 'rings', 'necklaces', 'bracelets'
  size_name: string          // 'US 6', 'UK M', 'EU 52'
  circumference_mm: number
  diameter_mm: number
  sort_order: number
}

MeasurementGuide {
  id: string
  category: string
  measurement_type: string   // 'circumference', 'length'
  instructions: string       // How to measure
  image_url: string | null
}
```

### 4. Econt Shipping Module

**Service**: `EcontShippingModuleService`

```typescript
// Location search
searchLocations(input: {
  type: 'office' | 'city' | 'street'
  query: string
  cityId?: string
})

// Cart preference management
saveCartPreference(input: UpsertCartPreferenceInput)
getCartPreference(cartId: string)

// Shipment lifecycle
createShipmentFromOrder(orderId: string, cartId?: string)
registerShipment(shipmentId: string)      // Calls Econt API
calculateShipment(cartId: string)         // Get shipping cost
cancelShipment(shipmentId: string)

// Status sync
syncShipmentStatus({ shipmentId, refreshTracking })
syncMultipleShipments(shipmentIds: string[])
```

**Status Flow**:
```
DRAFT → READY → REGISTERED → IN_TRANSIT → DELIVERED
                    ↓
               CANCELLED
```

**Model**:
```typescript
EcontShipment {
  id: string
  cart_id: string | null
  order_id: string | null
  
  // Delivery type
  delivery_type: 'office' | 'address'
  
  // Office pickup
  office_code: string | null
  office_name: string | null
  
  // Address delivery
  address_city: string | null
  address_postal_code: string | null
  address_line1: string | null
  address_line2: string | null
  entrance: string | null
  floor: string | null
  apartment: string | null
  neighborhood: string | null
  allow_saturday: boolean
  
  // Recipient
  recipient_first_name: string
  recipient_last_name: string
  recipient_phone: string
  recipient_email: string | null
  
  // Payment
  cod_amount: number | null
  
  // Econt API data
  status: string
  waybill_number: string | null
  tracking_number: string | null
  label_url: string | null
  
  // Tracking details
  short_status: string | null
  short_status_en: string | null
  tracking_events: Record<string, unknown> | null
  delivery_attempts: number
  expected_delivery_date: string | null
  send_time: Date | null
  delivery_time: Date | null
  cod_collected_time: Date | null
  cod_paid_time: Date | null
  
  // Sync metadata
  last_synced_at: Date | null
  raw_response: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
}
```

**Environment Variables**:
```env
ECONT_API_USERNAME=your-username      # REQUIRED
ECONT_API_PASSWORD=your-password      # REQUIRED
ECONT_API_BASE_URL=https://ee.econt.com/services
ECONT_SENDER_CLIENT_NUMBER=your-number
ECONT_IS_DEMO=false

# COD Payout
ECONT_CD_AGREEMENT_NUM=your-agreement
ECONT_PAYOUT_METHOD=bank              # bank|office|door
ECONT_PAYOUT_IBAN=your-iban
ECONT_PAYOUT_BIC=your-bic
```

### 5. Email Campaign Module

**Service**: `EmailCampaignModuleService`

```typescript
// Campaign management
getActiveCampaign()                       // Get current active campaign

// Subscription management
createSubscription(campaignId: string, email: string, prefix: string)
getSubscriptionByEmail(campaignId: string, email: string)
getSubscriptionByCode(campaignId: string, code: string)
markCodeUsed(subscriptionId: string)
listCampaignSubscriptions(campaignId: string, options?: { limit, offset })

// Analytics
getCampaignStats(campaignId: string)      // { total, used, conversion_rate }

// Code generation
generateUniqueCode(prefix: string)        // Returns: PREFIX-XXXXXX
```

**Models**:
```typescript
EmailCampaign {
  id: string
  name: string
  description: string | null
  code_prefix: string              // e.g., 'SUMMER24'
  discount_percent: number         // 1-100
  is_active: boolean
  start_date: Date
  end_date: Date
  
  // Display settings
  banner_enabled: boolean
  banner_text: string | null
  banner_cta_text: string | null
  banner_cta_link: string | null
  background_color: string | null  // Hex color
  popup_enabled: boolean
  popup_title: string | null
  popup_description: string | null
  
  created_at: Date
  updated_at: Date
}

EmailSubscription {
  id: string
  campaign_id: string
  email: string
  discount_code: string            // Unique: PREFIX-XXXXXX
  promotion_id: string | null      // Medusa promotion ID
  code_used: boolean
  code_used_at: Date | null
  subscribed_at: Date
}
```

**Code Generation**: Uses 6-char alphanumeric, excludes ambiguous chars (0, O, I, l, 1).

---

## Background Jobs

### Sync Econt Shipments
**File**: `src/jobs/sync-econt-shipments.ts`
**Schedule**: `*/30 * * * *` (every 30 minutes)

```typescript
// Logic:
// 1. Query shipments with status IN (REGISTERED, IN_TRANSIT, READY)
// 2. Filter to only those with waybill_number
// 3. Batch sync in groups of 20
// 4. 1-second delay between batches
// 5. Update tracking info, delivery attempts, expected dates
// 6. Continue on individual batch errors (logs error, doesn't stop)
```

---

## Event Subscribers

### Order Placed → Create Shipment
**File**: `src/subscribers/econt-shipment.ts`
**Event**: `order.placed`

```typescript
// Logic:
// 1. Get cart_id from order
// 2. Look up saved Econt preference for cart
// 3. Create shipment with status "ready"
// 4. Admin reviews and manually registers with Econt API
```

---

## API Middleware

**File**: `src/api/middlewares.ts`

- Wishlist routes require customer authentication (session or bearer token)
- Comments support optional authentication (guest or authenticated)
- Email campaigns are public (no auth required)
- Admin routes use Medusa admin authentication

---

## Development Commands

```bash
# Install dependencies
npm install

# Development
npm run dev                    # Start dev server (port 9000)

# Build
npm run build                  # Production build

# Database
npm run seed                   # Seed database
npm run create-admin           # Create admin user

# Testing
npm run test:unit
npm run test:integration:http
npm run test:integration:modules
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secure-jwt-secret
COOKIE_SECRET=your-secure-cookie-secret

# CORS
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000

# Econt Shipping
ECONT_API_USERNAME=your-username
ECONT_API_PASSWORD=your-password
ECONT_API_BASE_URL=https://ee.econt.com/services
ECONT_SENDER_CLIENT_NUMBER=your-number
ECONT_IS_DEMO=false
ECONT_CD_AGREEMENT_NUM=your-agreement
ECONT_PAYOUT_METHOD=bank
ECONT_PAYOUT_IBAN=your-iban
ECONT_PAYOUT_BIC=your-bic

# Stripe
STRIPE_API_KEY=sk_...
```

---

## Known Issues

### 1. Demo Credentials Fallback (Critical)
**File**: `src/modules/econt-shipping/service.ts:24-33`

The service falls back to demo credentials if env vars are missing. In production, this could route shipments to demo Econt.

**Current**:
```typescript
const username = process.env.ECONT_API_USERNAME || "iasp-dev"
```

**Recommended Fix**:
```typescript
if (!process.env.ECONT_API_USERNAME || !process.env.ECONT_API_PASSWORD) {
  throw new Error("[EcontShipping] Missing ECONT_API_USERNAME or ECONT_API_PASSWORD")
}
```

### 2. Promotion Creation Error Swallowed (Critical)
**File**: `src/api/store/campaigns/subscribe/route.ts:97-113`

Subscription is created even if Medusa promotion creation fails. User gets a discount code that won't work at checkout.

**Recommended Fix**: Return warning to user or rollback subscription.

### 3. Auto-Approved Comments (Moderate)
**File**: `src/modules/product-comments/service.ts:32`

All comments are auto-approved on creation, which could allow spam.

**Recommended Fix**: Default to `status: 'pending'`.

### 4. No Rate Limiting (Moderate)
Comment creation and campaign subscription have no rate limiting.

**Recommended Fix**: Add rate limiting middleware.

### 5. Type-Unsafe Auth Context (Minor)
Multiple routes use `(req as any).auth_context?.actor_id`.

**Recommended Fix**: Create typed helper function.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `medusa-config.ts` | Main Medusa configuration, module registration |
| `src/modules/*/index.ts` | Module entry points |
| `src/api/middlewares.ts` | API middleware setup |
| `src/scripts/seed.ts` | Database seeding |
| `src/jobs/sync-econt-shipments.ts` | Background shipment sync |
| `src/subscribers/econt-shipment.ts` | Order event handler |

---

## Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration:http
npm run test:integration:modules

# All tests
npm test
```

---

## Deployment

### Local Development
```bash
docker-compose up -d
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Production
- Database: Supabase PostgreSQL
- Cache: Upstash Redis
- Hosting: DigitalOcean / Railway / AWS

### Pre-deployment Checklist
- [ ] Set real ECONT_API_USERNAME and ECONT_API_PASSWORD
- [ ] Set ECONT_IS_DEMO=false
- [ ] Generate secure JWT_SECRET and COOKIE_SECRET
- [ ] Configure production DATABASE_URL
- [ ] Configure production REDIS_URL
- [ ] Set proper CORS domains
- [ ] Test shipment flow end-to-end
