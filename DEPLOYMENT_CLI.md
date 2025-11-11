# 🚀 CLI-Only Deployment Guide

Complete deployment using only the command line. No web dashboards needed!

## 📋 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │────▶│   Medusa.js     │────▶│   PostgreSQL    │
│   Storefront    │     │   Backend       │     │   Database      │
│   (Vercel CLI)  │     │   (Railway CLI) │     │   (Supabase CLI)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Services:**
- **Storefront**: Vercel (CLI)
- **Backend**: Railway (CLI)
- **Database**: Supabase (CLI)

**Note**: Redis is optional for Medusa v2. We'll skip it for simplicity, but you can add it later if needed.

---

## 🛠️ Prerequisites

Install the required CLI tools:

```bash
# Install Supabase CLI
npm install -g supabase

# Install Railway CLI
npm install -g @railway/cli

# Install Vercel CLI
npm install -g vercel
```

**Or using Homebrew (Mac):**
```bash
brew install supabase/tap/supabase
brew install railway
brew install vercel
```

---

## 📝 Step 1: Set Up Supabase Database (CLI)

### 1.1 Login to Supabase
```bash
supabase login
```
This will open your browser for authentication.

### 1.2 Create a New Project
```bash
# Create project (interactive)
supabase projects create bijou-coquettee

# Or with flags
supabase projects create bijou-coquettee \
  --org-id your-org-id \
  --db-password your-secure-password \
  --region us-east-1
```

### 1.3 Get Database Connection String
```bash
# Link to your project
supabase link --project-ref your-project-ref

# Get connection string
supabase status
```

The connection string will be in the format:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Save this as `DATABASE_URL` for later.**

### 1.4 Alternative: Get from Dashboard
If you prefer, you can also get the connection string from:
```bash
# Open dashboard
supabase dashboard
```

Then go to: Settings → Database → Connection string

---

## 📝 Step 2: Deploy Backend to Railway (CLI)

### 2.1 Login to Railway
```bash
railway login
```
This will open your browser for authentication.

### 2.2 Initialize Railway Project
```bash
cd bijou-coquettee

# Initialize Railway project
railway init

# This will:
# - Create a new Railway project
# - Link it to your current directory
# - Create railway.json config
```

### 2.3 Set Environment Variables
```bash
# Set database URL
railway variables set DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Generate secrets (run these commands to generate)
JWT_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)

# Set secrets
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set COOKIE_SECRET="$COOKIE_SECRET"

# Set CORS (we'll update these after Vercel deployment)
railway variables set STORE_CORS="https://your-app.vercel.app"
railway variables set ADMIN_CORS="https://your-app.vercel.app"
railway variables set AUTH_CORS="https://your-app.vercel.app"

# Set Node environment
railway variables set NODE_ENV="production"
```

### 2.4 Configure Build Settings
Create or update `railway.json` in the backend directory:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2.5 Deploy Backend
```bash
# Deploy to Railway
railway up

# This will:
# - Build your application
# - Deploy to Railway
# - Show you the deployment URL
```

### 2.6 Get Backend URL
```bash
# Get the service URL
railway domain

# Or check status
railway status
```

**Save this URL as `BACKEND_URL` for later.**

### 2.7 Run Database Migrations
```bash
# Connect to Railway service
railway shell

# Inside the shell, run migrations
npx medusa db:migrate

# Optional: Seed database
npm run seed

# Exit shell
exit
```

---

## 📝 Step 3: Deploy Storefront to Vercel (CLI)

### 3.1 Login to Vercel
```bash
vercel login
```

### 3.2 Navigate to Storefront Directory
```bash
cd bijou-coquettee-storefront
```

### 3.3 Link Project to Vercel
```bash
# Link to existing project or create new
vercel link

# This will ask:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No (create new)
# - Project name? bijou-coquettee-storefront
# - Directory? ./
```

### 3.4 Set Environment Variables
```bash
# Set backend URL (from Railway)
vercel env add NEXT_PUBLIC_MEDUSA_BACKEND_URL production
# Enter: https://your-backend.railway.app

vercel env add MEDUSA_BACKEND_URL production
# Enter: https://your-backend.railway.app

# Set default region
vercel env add NEXT_PUBLIC_DEFAULT_REGION production
# Enter: us

# Publishable key (we'll add this after getting it from admin)
vercel env add NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY production
# Enter: (leave empty for now, we'll update later)
```

### 3.5 Deploy Storefront
```bash
# Deploy to production
vercel --prod

# This will:
# - Build your Next.js app
# - Deploy to Vercel
# - Show you the deployment URL
```

**Save this URL as `STOREFRONT_URL` for later.**

---

## 📝 Step 4: Final Configuration

### 4.1 Update Backend CORS
```bash
cd bijou-coquettee

# Update CORS with your Vercel URL
railway variables set STORE_CORS="https://your-storefront.vercel.app"
railway variables set ADMIN_CORS="https://your-storefront.vercel.app"
railway variables set AUTH_CORS="https://your-storefront.vercel.app"

# Redeploy to apply changes
railway up
```

### 4.2 Get Publishable Key from Medusa Admin

```bash
# Get your backend URL
railway domain

# Open admin panel in browser
open https://your-backend.railway.app/app
```

1. Create admin account (first time)
2. Go to Settings → API Key Management
3. Create a new publishable key
4. Copy the key

### 4.3 Update Storefront with Publishable Key
```bash
cd bijou-coquettee-storefront

# Update publishable key
vercel env rm NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY production
vercel env add NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY production
# Enter: pk_your_key_here

# Redeploy storefront
vercel --prod
```

---

## 🔄 Updating Deployments

### Update Backend
```bash
cd bijou-coquettee

# Make your changes, then:
git add .
git commit -m "Your changes"
git push

# Railway auto-deploys on push, or manually:
railway up
```

### Update Storefront
```bash
cd bijou-coquettee-storefront

# Make your changes, then:
git add .
git commit -m "Your changes"
git push

# Vercel auto-deploys on push, or manually:
vercel --prod
```

---

## 📊 Viewing Logs

### Backend Logs (Railway)
```bash
cd bijou-coquettee
railway logs
```

### Storefront Logs (Vercel)
```bash
cd bijou-coquettee-storefront
vercel logs
```

---

## 🔍 Checking Status

### Railway Status
```bash
cd bijou-coquettee
railway status
```

### Vercel Status
```bash
cd bijou-coquettee-storefront
vercel inspect
```

### Supabase Status
```bash
supabase status
```

---

## 🗑️ Cleanup Commands

### Remove Railway Deployment
```bash
cd bijou-coquettee
railway delete
```

### Remove Vercel Deployment
```bash
cd bijou-coquettee-storefront
vercel remove --yes
```

### Remove Supabase Project
```bash
supabase projects delete bijou-coquettee
```

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check logs
railway logs

# Check environment variables
railway variables

# Verify database connection
railway shell
# Then test: node -e "console.log(process.env.DATABASE_URL)"
```

### Storefront build fails
```bash
# Check build logs
vercel logs

# Test build locally
npm run build

# Check environment variables
vercel env ls
```

### Database connection issues
```bash
# Test Supabase connection
supabase db ping

# Check connection string format
supabase status
```

---

## 📚 Quick Reference

### All-in-One Setup Script
Create `deploy.sh` in project root:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# 1. Supabase
echo "📦 Setting up Supabase..."
supabase projects create bijou-coquettee
supabase link --project-ref $(supabase projects list | grep bijou-coquettee | awk '{print $1}')

# 2. Railway Backend
echo "🚂 Deploying backend to Railway..."
cd bijou-coquettee
railway init
railway variables set DATABASE_URL="$(supabase status | grep 'DB URL' | awk '{print $3}')"
railway up

# 3. Vercel Storefront
echo "▲ Deploying storefront to Vercel..."
cd ../bijou-coquettee-storefront
vercel link
vercel env add NEXT_PUBLIC_MEDUSA_BACKEND_URL production
vercel --prod

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 💡 Pro Tips

1. **Use Railway's GitHub integration** - Auto-deploys on push
2. **Use Vercel's preview deployments** - Test before production
3. **Keep secrets in CLI** - Don't commit `.env` files
4. **Monitor usage** - Check free tier limits regularly
5. **Use aliases** - Create shell aliases for common commands

Example aliases (add to `~/.zshrc` or `~/.bashrc`):
```bash
alias rw-up='cd bijou-coquettee && railway up'
alias vc-deploy='cd bijou-coquettee-storefront && vercel --prod'
alias rw-logs='cd bijou-coquettee && railway logs'
alias vc-logs='cd bijou-coquettee-storefront && vercel logs'
```

---

## 📖 CLI Documentation

- **Supabase CLI**: https://supabase.com/docs/reference/cli
- **Railway CLI**: https://docs.railway.app/develop/cli
- **Vercel CLI**: https://vercel.com/docs/cli

---

**Estimated Setup Time**: 20-30 minutes
**Cost**: $0/month (within free tiers)

