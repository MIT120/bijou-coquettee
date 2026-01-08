# CLAUDE.md - Bijou Coquettee Monorepo

## Project Overview

**Bijou Coquettee** is a modern jewelry e-commerce platform and marketplace. The project consists of a Medusa.js v2 backend and a Next.js 15 storefront, designed to provide an elegant shopping experience for jewelry customers.

### Business Goal
Create a premium online jewelry marketplace with:
- Beautiful product presentation for jewelry items
- Jewelry-specific features (size guides, measurements)
- Regional shipping integration (Econt for Bulgaria)
- Customer engagement (wishlists, reviews)
- Multi-currency and multi-region support

## Repository Structure

```
bijou-coquettee/
├── bijou-coquettee/              # Backend (Medusa.js v2.11.1)
│   ├── src/
│   │   ├── api/                  # REST API endpoints
│   │   ├── modules/              # Custom modules
│   │   ├── workflows/            # Business workflows
│   │   ├── subscribers/          # Event handlers
│   │   └── jobs/                 # Scheduled tasks
│   └── CLAUDE.md                 # Backend documentation
│
├── bijou-coquettee-storefront/   # Frontend (Next.js 15)
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   ├── modules/              # Feature modules
│   │   └── lib/                  # Utilities & data
│   └── CLAUDE.md                 # Frontend documentation
│
├── init-scripts/                 # Database init scripts
├── scripts/                      # Deployment scripts
├── docker-compose.yml            # Local development
└── env.example                   # Environment template
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Medusa.js v2.11.1, TypeScript 5.6 |
| **Frontend** | Next.js 15.3, React 19, TypeScript |
| **Database** | PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Styling** | Tailwind CSS 3.0 |
| **Payments** | Stripe |
| **Shipping** | Econt (Bulgaria) |

## Custom Features

### 1. Wishlist System
- Save products for later purchase
- Shareable wishlists with unique tokens
- Guest and authenticated wishlists

### 2. Product Comments/Reviews
- Customer reviews with ratings
- Moderation workflow (pending/approved/rejected)
- Guest reviews with email capture

### 3. Jewelry Size Guides
- Ring sizes (US, UK, EU, Asia standards)
- Necklace and chain lengths
- Bracelet sizing
- Measurement-based size finder

### 4. Econt Shipping Integration
- Bulgarian courier service
- Office pickup selection
- Address delivery
- Saturday delivery option
- Real-time shipment tracking

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### 1. Start Infrastructure
```bash
# Start PostgreSQL, Redis, pgAdmin
docker-compose up -d
```

### 2. Setup Backend
```bash
cd bijou-coquettee
npm install
cp .env.example .env  # Configure environment
npm run build
npm run seed          # Seed database
npm run dev           # Start on port 9000
```

### 3. Setup Frontend
```bash
cd bijou-coquettee-storefront
npm install
cp .env.example .env.local  # Configure environment
npm run dev           # Start on port 8000
```

### Access Points
- **Storefront**: http://localhost:8000
- **Backend API**: http://localhost:9000
- **Admin Panel**: http://localhost:9000/app
- **pgAdmin**: http://localhost:8080

## Environment Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medusa
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
COOKIE_SECRET=your-secret
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000

# Econt
ECONT_USERNAME=demo
ECONT_PASSWORD=demo
ECONT_BASE_URL=https://demo.econt.com/ee/services

# Stripe
STRIPE_API_KEY=sk_test_...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:8000
```

## Docker Services

```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  pgadmin:
    image: dpage/pgadmin4
    ports: ["8080:80"]
```

## API Architecture

### Store API (Public)
```
/store/products          # Product catalog
/store/collections       # Collections
/store/carts             # Shopping carts
/store/customers         # Customer accounts
/store/orders            # Order management
/store/wishlist          # Wishlists (custom)
/store/products/*/comments  # Reviews (custom)
/store/size-guide        # Size guides (custom)
/store/econt/locations   # Shipping (custom)
```

### Admin API (Protected)
```
/admin/products          # Product management
/admin/orders            # Order management
/admin/customers         # Customer management
/admin/econt/shipments   # Shipping (custom)
```

## Development Workflow

### Adding a New Module (Backend)
1. Create module in `src/modules/[name]/`
2. Define models in `models/`
3. Implement service in `service.ts`
4. Create migrations in `migrations/`
5. Register in `medusa-config.ts`

### Adding a New Feature (Frontend)
1. Create module in `src/modules/[name]/`
2. Add components in `components/`
3. Create data fetching in `lib/data/`
4. Add routes in `app/[countryCode]/`

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
- [ ] Configure production database (Supabase)
- [ ] Setup Redis for sessions/cache
- [ ] Configure Stripe production keys
- [ ] Setup Econt production credentials
- [ ] Configure CORS for production domains
- [ ] Set secure JWT/Cookie secrets
- [ ] Enable SSL/HTTPS

## Key Scripts

```bash
# Backend
npm run dev              # Development server
npm run build            # Production build
npm run seed             # Seed database
npm run create-admin     # Create admin user

# Frontend
npm run dev              # Development server
npm run build            # Production build
npm run analyze          # Bundle analysis
```

## Project Conventions

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Functional components (React)
- Server Components by default (Next.js)

### Naming
- Files: `kebab-case.ts`
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Git Branches
- `main` - Production
- `feat/*` - Features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps
docker-compose logs postgres
```

### Backend Won't Start
```bash
# Rebuild and check logs
npm run build
npm run dev 2>&1 | head -50
```

### Frontend API Errors
- Verify `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is correct
- Check backend CORS configuration
- Ensure backend is running

## Resources

- [Medusa.js Documentation](https://docs.medusajs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Econt API](https://www.econt.com/developers)
