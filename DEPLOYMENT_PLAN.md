# 🚀 Free Deployment Plan for Bijou Coquettee

This guide outlines a **completely free** deployment strategy for your Medusa.js e-commerce platform during development.

## 🎯 Quick Links

- **CLI-Only Deployment**: See `DEPLOYMENT_CLI.md` for command-line only setup
- **Quick Start**: See `DEPLOYMENT_QUICK_START.md` for condensed guide
- **Automated Script**: Run `./scripts/deploy.sh` for interactive deployment helper

## 📋 Architecture Overview

**Simplified 3-Service Setup:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │────▶│   Medusa.js     │────▶│   PostgreSQL    │
│   Storefront    │     │   Backend       │     │   Database      │
│   (Vercel)      │     │   (Railway)     │     │   (Supabase)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Note**: Redis is optional for Medusa v2. We've simplified to 3 services for easier deployment. You can add Redis (Upstash) later if needed for caching/job queues.

## 🎯 Recommended Free Services

### 1. **Storefront (Next.js)** → **Vercel** ⭐ Best Choice
- **Free Tier**: Unlimited personal projects
- **Features**: 
  - Automatic deployments from Git
  - Edge network (fast global CDN)
  - Built-in SSL certificates
  - Perfect Next.js integration
- **Limits**: 
  - 100GB bandwidth/month
  - 100 hours build time/month
  - More than enough for development

### 2. **Backend (Medusa.js)** → **Railway** ⭐ Recommended
- **Free Tier**: $5 credit/month (usually enough for dev)
- **Features**:
  - Easy deployment from GitHub
  - Automatic HTTPS
  - Environment variable management
  - Logs and monitoring
- **Alternative**: **Render** (free tier with sleep after inactivity)

### 3. **Database (PostgreSQL)** → **Supabase** ⭐ Best Choice
- **Free Tier**: 
  - 500MB database
  - 2GB bandwidth
  - Unlimited API requests
- **Features**:
  - Managed PostgreSQL
  - Connection pooling
  - Dashboard for data management
- **Alternative**: **Neon** (also excellent free tier)

### 4. **Redis** → **Optional** ⚠️
- **Status**: Optional for Medusa v2 basic functionality
- **When needed**: For advanced caching, job queues, or high traffic
- **Options**: 
  - **Upstash** (free tier: 10K commands/day)
  - **Railway Redis** (if using Railway for backend)
- **Recommendation**: Skip for initial deployment, add later if needed

---

## 📝 Step-by-Step Deployment Guide

### Phase 1: Database Setup (Supabase)

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up with GitHub
   - Create a new project

2. **Get Database Connection String**
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

3. **Save Connection Details**
   - You'll need: `DATABASE_URL` for Medusa backend

---

### Phase 2: Redis Setup (Upstash)

1. **Create Upstash Account**
   - Go to https://upstash.com
   - Sign up with GitHub
   - Create a new Redis database

2. **Get Redis Connection Details**
   - Copy the `UPSTASH_REDIS_REST_URL`
   - Copy the `UPSTASH_REDIS_REST_TOKEN`
   - Note: Medusa v2 uses Redis for caching and jobs

3. **Alternative: Standard Redis URL**
   - If Upstash provides a standard Redis URL, use that format:
     - `redis://default:[PASSWORD]@[HOST]:[PORT]`

---

### Phase 3: Backend Deployment (Railway)

1. **Prepare Your Backend**
   - Ensure your code is pushed to GitHub
   - Create a `.railway.toml` file (optional, for custom config)

2. **Deploy on Railway**
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `bijou-coquettee` repository
   - Railway will auto-detect it's a Node.js app

3. **Configure Environment Variables**
   Add these in Railway's environment variables:
   ```bash
   # Database
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   
   # Redis (Upstash)
   REDIS_URL=redis://default:[PASSWORD]@[HOST]:[PORT]
   # OR if using Upstash REST API:
   # UPSTASH_REDIS_REST_URL=https://...
   # UPSTASH_REDIS_REST_TOKEN=...
   
   # CORS (update with your Vercel URL after deployment)
   STORE_CORS=https://your-storefront.vercel.app
   ADMIN_CORS=https://your-storefront.vercel.app
   AUTH_CORS=https://your-storefront.vercel.app
   
   # Secrets (generate secure random strings)
   JWT_SECRET=your-super-secret-jwt-key-here
   COOKIE_SECRET=your-super-secret-cookie-key-here
   
   # Node Environment
   NODE_ENV=production
   ```

4. **Configure Build & Start Commands**
   Railway should auto-detect, but verify:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Root Directory**: `bijou-coquettee` (if monorepo)

5. **Run Database Migrations**
   - Railway provides a console/terminal
   - Run: `npx medusa db:migrate`
   - Optionally seed: `npm run seed`

6. **Get Your Backend URL**
   - Railway provides a URL like: `https://your-app.railway.app`
   - Save this for storefront configuration

---

### Phase 4: Storefront Deployment (Vercel)

1. **Prepare Your Storefront**
   - Ensure code is pushed to GitHub
   - Check `next.config.js` for any build issues

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Click "Add New Project"
   - Import your repository
   - Select the `bijou-coquettee-storefront` directory

3. **Configure Environment Variables**
   Add these in Vercel's environment settings:
   ```bash
   # Backend URL (from Railway)
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-app.railway.app
   
   # Publishable Key (get from Medusa admin after first deployment)
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
   
   # Default Region
   NEXT_PUBLIC_DEFAULT_REGION=us
   
   # Stripe (if using)
   NEXT_PUBLIC_STRIPE_KEY=pk_test_...
   ```

4. **Configure Build Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `bijou-coquettee-storefront`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://your-app.vercel.app`

---

### Phase 5: Post-Deployment Configuration

1. **Update CORS in Backend**
   - Go back to Railway environment variables
   - Update CORS URLs with your Vercel storefront URL:
     ```bash
     STORE_CORS=https://your-app.vercel.app
     ADMIN_CORS=https://your-app.vercel.app
     AUTH_CORS=https://your-app.vercel.app
     ```
   - Redeploy backend (Railway auto-redeploys on env changes)

2. **Get Publishable Key**
   - Access your Medusa admin: `https://your-backend.railway.app/app`
   - Create an admin user (first time)
   - Go to Settings → API Key Management
   - Create a publishable key
   - Copy it to Vercel environment variables

3. **Update Next.js Image Domains**
   - If using custom image domains, update `next.config.js`
   - Add your backend domain to `remotePatterns`

---

## 🔧 Alternative Deployment Options

### Backend Alternatives

#### Option A: Render (Free Tier)
- **Pros**: True free tier (sleeps after inactivity)
- **Cons**: Cold starts can be slow
- **Setup**: Similar to Railway, uses Dockerfile or buildpacks

#### Option B: Fly.io (Free Tier)
- **Pros**: Generous free tier, global edge
- **Cons**: More complex setup
- **Setup**: Requires `fly.toml` configuration

### Database Alternatives

#### Option A: Neon
- **Pros**: Serverless PostgreSQL, great free tier
- **Cons**: Slightly different connection pooling
- **Setup**: Similar to Supabase

#### Option B: Railway PostgreSQL
- **Pros**: Integrated with Railway backend
- **Cons**: Uses Railway credits
- **Setup**: Add PostgreSQL service in Railway

---

## 📦 Required Files for Deployment

### 1. Railway Configuration (Optional)
Create `bijou-coquettee/.railway.toml`:
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### 2. Vercel Configuration (Optional)
Create `bijou-coquettee-storefront/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### 3. Environment Variable Template
Create `.env.production.example` in both directories:
```bash
# Backend .env.production.example
DATABASE_URL=
REDIS_URL=
STORE_CORS=
ADMIN_CORS=
AUTH_CORS=
JWT_SECRET=
COOKIE_SECRET=
NODE_ENV=production

# Storefront .env.production.example
NEXT_PUBLIC_MEDUSA_BACKEND_URL=
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
NEXT_PUBLIC_DEFAULT_REGION=us
```

---

## 🚨 Important Considerations

### 1. **Free Tier Limits**
- **Vercel**: 100GB bandwidth/month (usually enough)
- **Railway**: $5 credit/month (~500 hours of runtime)
- **Supabase**: 500MB database (upgrade if needed)
- **Upstash**: 10K commands/day (usually enough for dev)

### 2. **Cold Starts**
- Railway: Minimal cold starts
- Render: Can sleep after inactivity (15 min free tier)
- Vercel: No cold starts (serverless)

### 3. **Database Migrations**
- Run migrations after each deployment
- Use Railway console or connect via CLI
- Consider adding migration step to deployment

### 4. **Environment Variables**
- Never commit `.env` files
- Use platform-specific secret management
- Update CORS after getting final URLs

### 5. **Custom Domains**
- Vercel: Free custom domains
- Railway: Custom domains available (may require upgrade)
- Update CORS when using custom domains

---

## 🔄 Continuous Deployment Setup

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Trigger Railway Deploy
        # Railway auto-deploys on push, but you can add custom steps
        run: echo "Railway will auto-deploy"
```

Railway and Vercel both auto-deploy on Git push by default.

---

## 📊 Monitoring & Debugging

### 1. **Backend Logs**
- Railway: View logs in dashboard
- Use `console.log` for debugging
- Check for database connection issues

### 2. **Storefront Logs**
- Vercel: View logs in dashboard
- Check build logs for errors
- Monitor function execution

### 3. **Database Monitoring**
- Supabase: Dashboard shows queries, connections
- Monitor database size
- Check connection pool usage

### 4. **Redis Monitoring**
- Upstash: Dashboard shows command usage
- Monitor daily command limit
- Check connection status

---

## 🎯 Quick Start Checklist

- [ ] Create Supabase account and database
- [ ] Create Upstash account and Redis instance
- [ ] Deploy backend to Railway
- [ ] Configure backend environment variables
- [ ] Run database migrations
- [ ] Deploy storefront to Vercel
- [ ] Configure storefront environment variables
- [ ] Update CORS in backend
- [ ] Get publishable key from Medusa admin
- [ ] Update storefront with publishable key
- [ ] Test full deployment
- [ ] Set up custom domains (optional)

---

## 💡 Cost Optimization Tips

1. **Use Railway's free tier wisely**
   - Monitor usage in dashboard
   - Consider Render if hitting limits

2. **Optimize database queries**
   - Use indexes properly
   - Monitor Supabase dashboard

3. **Cache aggressively**
   - Use Redis for frequently accessed data
   - Monitor Upstash command usage

4. **Optimize Next.js builds**
   - Use ISR (Incremental Static Regeneration)
   - Minimize bundle size

---

## 🆘 Troubleshooting

### Backend won't start
- Check environment variables
- Verify database connection
- Check Railway logs

### Storefront can't connect to backend
- Verify CORS settings
- Check backend URL in env vars
- Ensure backend is running

### Database connection errors
- Verify DATABASE_URL format
- Check Supabase connection settings
- Ensure database is not paused

### Redis connection errors
- Verify REDIS_URL format
- Check Upstash dashboard
- Ensure Redis instance is active

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Documentation](https://docs.upstash.com)
- [Medusa Deployment Guide](https://docs.medusajs.com/deployments)

---

**Last Updated**: 2025-01-27
**Estimated Setup Time**: 30-60 minutes
**Monthly Cost**: $0 (within free tier limits)

