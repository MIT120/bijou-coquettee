# CLAUDE.md - Bijou Coquettee Backend

## Project Overview

Bijou Coquettee is a **jewelry e-commerce platform and marketplace** built on Medusa.js v2.11.1. The backend serves as the commerce engine handling products, orders, payments, and custom modules for jewelry-specific features.

**Goal**: Create a modern, elegant online jewelry store with marketplace capabilities, supporting multiple vendors, Bulgarian shipping (Econt), and jewelry-specific features like size guides.

## Tech Stack

- **Framework**: Medusa.js v2.11.1 (headless commerce)
- **Language**: TypeScript 5.6.2
- **Database**: PostgreSQL 15 (Supabase for production)
- **Cache**: Redis 7
- **Build**: SWC transpiler
- **Testing**: Jest

## Project Structure

```
src/
├── api/                    # REST API endpoints
│   ├── admin/             # Protected admin endpoints
│   │   └── econt/         # Econt shipping management
│   └── store/             # Public store endpoints
│       ├── products/[id]/comments/  # Product reviews
│       ├── wishlist/                # Wishlist management
│       ├── size-guide/              # Jewelry sizing
│       └── econt/                   # Shipping locations
│
├── modules/               # Custom Medusa modules
│   ├── wishlist/          # Customer wishlists
│   ├── product-comments/  # Product reviews/comments
│   ├── size-guide/        # Ring/necklace/bracelet sizing
│   └── econt-shipping/    # Bulgarian courier integration
│
├── workflows/             # Medusa workflows
├── subscribers/           # Event handlers
├── jobs/                  # Scheduled tasks
├── scripts/               # Utility scripts
└── admin/                 # Admin UI customization
```

## Custom Modules

### 1. Wishlist Module (`src/modules/wishlist/`)
- Customer wishlist management
- Shareable wishlist links with tokens
- Public/private visibility settings

### 2. Product Comments Module (`src/modules/product-comments/`)
- Customer reviews and ratings
- Moderation system (pending/approved/rejected)
- Guest comments with email capture

### 3. Size Guide Module (`src/modules/size-guide/`)
- Jewelry size conversions (US, UK, EU, Asia)
- Categories: rings, necklaces, bracelets, chains
- Measurement-based size finder

### 4. Econt Shipping Module (`src/modules/econt-shipping/`)
- Bulgarian Econt courier integration
- Office pickup and address delivery
- Real-time location search
- Shipment tracking with waybill numbers

## API Endpoints

### Store (Public)
```
GET    /store/wishlist                    # Get customer wishlist
DELETE /store/wishlist                    # Clear wishlist
GET    /store/wishlist/items              # List items
POST   /store/wishlist/items              # Add item
POST   /store/wishlist/check              # Check if product in wishlist
POST   /store/wishlist/share              # Generate share link
GET    /store/wishlist/shared/[token]     # View shared wishlist

GET    /store/products/[id]/comments      # Get product comments
POST   /store/products/[id]/comments      # Add comment

GET    /store/size-guide                  # All size guides
GET    /store/size-guide/[category]       # Category sizes
POST   /store/size-guide/find-size        # Find by measurements

GET    /store/econt/locations             # Search offices/cities
POST   /store/econt/preferences           # Save delivery preference
```

### Admin (Protected)
```
GET    /admin/econt/shipments             # List shipments
POST   /admin/econt/shipments             # Create shipment
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Database operations
npm run seed                    # Seed database
npm run create-admin           # Create admin user

# Testing
npm run test:unit
npm run test:integration:http
npm run test:integration:modules
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret

# CORS
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000

# Econt Shipping
ECONT_USERNAME=demo-username
ECONT_PASSWORD=demo-password
ECONT_BASE_URL=https://demo.econt.com/ee/services
ECONT_CLIENT_NUMBER=your-client-number

# Stripe
STRIPE_API_KEY=sk_...
```

## Database Models

### Wishlist
```typescript
wishlist {
  id: string
  customer_id: string
  name: string
  is_public: boolean
  share_token: string
  created_at: Date
  updated_at: Date
}

wishlist_item {
  id: string
  wishlist_id: string
  product_id: string
  variant_id: string
  created_at: Date
}
```

### Product Comment
```typescript
product_comment {
  id: string
  product_id: string
  customer_id?: string
  guest_email?: string
  author_name: string
  content: string
  rating?: number
  status: 'pending' | 'approved' | 'rejected'
  is_public: boolean
  created_at: Date
}
```

### Econt Shipment
```typescript
econt_shipment {
  id: string
  order_id: string
  waybill_number: string
  delivery_type: 'office' | 'address'
  office_code?: string
  saturday_delivery: boolean
  status: string
  created_at: Date
}
```

## Deployment

### Local Development
```bash
# Start infrastructure
docker-compose up -d

# Services:
# - PostgreSQL: localhost:5432
# - pgAdmin: localhost:8080
# - Redis: localhost:6379
```

### Production
- Database: Supabase PostgreSQL
- Cache: Managed Redis
- Hosting: DigitalOcean / Railway / AWS

## Architecture Notes

- Uses Medusa.js module system for extensibility
- REST API with middleware for authentication
- Event-driven architecture with subscribers
- Background jobs for scheduled tasks
- Migrations per module for database changes

## Key Files

- `medusa-config.ts` - Main Medusa configuration
- `src/modules/*/index.ts` - Module entry points
- `src/api/middlewares.ts` - API middleware setup
- `src/scripts/seed.ts` - Database seeding
