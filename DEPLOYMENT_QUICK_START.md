# ⚡ Quick Start Deployment Guide

This is a condensed version of the full deployment plan. Use this for a quick reference during deployment.

**For CLI-only deployment, see `DEPLOYMENT_CLI.md`**

## 🎯 Services & URLs

| Component      | Service  | Free Tier         |
| -------------- | -------- | ----------------- |
| **Storefront** | Vercel   | ✅ Unlimited       |
| **Backend**    | Railway  | ✅ $5/month credit |
| **Database**   | Supabase | ✅ 500MB           |

**Note**: Redis is optional for Medusa v2. Skipped for simplicity.

---

## 📋 Deployment Checklist

### 1. Database (Supabase) - 5 min
- [ ] Sign up at https://supabase.com
- [ ] Create new project
- [ ] Copy `DATABASE_URL` from Settings → Database

### 2. Redis (Upstash) - 3 min
- [ ] Sign up at https://upstash.com
- [ ] Create Redis database
- [ ] Copy `REDIS_URL` (or REST URL/Token)

### 3. Backend (Railway) - 10 min
- [ ] Sign up at https://railway.app
- [ ] New Project → Deploy from GitHub
- [ ] Select `bijou-coquettee` repo
- [ ] Set root directory: `bijou-coquettee`
- [ ] Add environment variables (see below)
- [ ] Deploy
- [ ] Run migrations: `npx medusa db:migrate` (in Railway console)
- [ ] Copy backend URL

### 4. Storefront (Vercel) - 10 min
- [ ] Sign up at https://vercel.com
- [ ] Add New Project → Import GitHub repo
- [ ] Set root directory: `bijou-coquettee-storefront`
- [ ] Add environment variables (see below)
- [ ] Deploy
- [ ] Copy storefront URL

### 5. Final Configuration - 5 min
- [ ] Update backend CORS with storefront URL
- [ ] Get publishable key from Medusa admin
- [ ] Update storefront with publishable key
- [ ] Test deployment

---

## 🔑 Environment Variables

### Backend (Railway)
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
REDIS_URL=redis://default:[PASSWORD]@[HOST]:[PORT]
STORE_CORS=https://your-app.vercel.app
ADMIN_CORS=https://your-app.vercel.app
AUTH_CORS=https://your-app.vercel.app
JWT_SECRET=[generate-random-string]
COOKIE_SECRET=[generate-random-string]
NODE_ENV=production
```

**Generate secrets:**
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use online generator
# https://randomkeygen.com/
```

### Storefront (Vercel)
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_[get-from-admin]
NEXT_PUBLIC_DEFAULT_REGION=us
```

**Note:** `MEDUSA_BACKEND_URL` (without `NEXT_PUBLIC_`) is also needed for middleware.

---

## 🚀 Deployment Commands

### Railway (Backend)
```bash
# Build command (auto-detected)
npm install && npm run build

# Start command (auto-detected)
npm run start

# Run migrations (in Railway console)
npx medusa db:migrate

# Seed database (optional)
npm run seed
```

### Vercel (Storefront)
```bash
# Build command (auto-detected)
npm run build

# Start command (auto-detected)
npm run start
```

---

## 🔗 Important URLs

After deployment, you'll have:
- **Backend API**: `https://your-app.railway.app`
- **Admin Panel**: `https://your-app.railway.app/app`
- **Storefront**: `https://your-app.vercel.app`

---

## ⚠️ Common Issues

### Backend won't start
- ✅ Check all environment variables are set
- ✅ Verify DATABASE_URL format
- ✅ Check Railway logs for errors

### Storefront can't connect
- ✅ Verify CORS includes storefront URL
- ✅ Check `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is correct
- ✅ Ensure backend is running

### Database connection fails
- ✅ Verify Supabase project is active
- ✅ Check DATABASE_URL includes password
- ✅ Ensure database isn't paused

### Redis errors
- ✅ Verify REDIS_URL format
- ✅ Check Upstash dashboard for status
- ✅ Note: Redis might be optional for basic Medusa functionality

---

## 📝 Post-Deployment Steps

1. **Access Admin Panel**
   - Go to `https://your-backend.railway.app/app`
   - Create admin account (first time)

2. **Create Publishable Key**
   - Admin → Settings → API Key Management
   - Create new publishable key
   - Copy to Vercel environment variables

3. **Set Up Regions**
   - Admin → Settings → Regions
   - Create at least one region
   - Configure shipping and payment

4. **Test Storefront**
   - Visit your Vercel URL
   - Test product browsing
   - Test cart functionality

---

## 💡 Pro Tips

1. **Use Railway's GitHub integration** - Auto-deploys on push
2. **Use Vercel's preview deployments** - Test before merging
3. **Monitor free tier usage** - Check dashboards regularly
4. **Set up custom domains** - Free on Vercel, may cost on Railway
5. **Enable Vercel Analytics** - Free tier available

---

## 🆘 Need Help?

- Full guide: See `DEPLOYMENT_PLAN.md`
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- Medusa docs: https://docs.medusajs.com

---

**Estimated Total Time**: 30-45 minutes
**Cost**: $0/month (within free tiers)

