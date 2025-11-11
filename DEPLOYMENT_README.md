# 🚀 Deployment Guides Overview

This directory contains comprehensive guides for deploying your Bijou Coquettee e-commerce platform.

## 📚 Available Guides

### 1. **DEPLOYMENT_CLI.md** ⭐ Recommended for CLI Users
**Complete CLI-only deployment guide**
- ✅ Everything done from command line
- ✅ No web dashboards needed
- ✅ Step-by-step CLI commands
- ✅ Perfect for automation

**Use this if:** You prefer command-line tools and want to automate deployment.

---

### 2. **DEPLOYMENT_QUICK_START.md** ⚡ Quick Reference
**Condensed deployment checklist**
- ✅ Quick reference format
- ✅ Essential steps only
- ✅ Fast setup guide

**Use this if:** You want a quick checklist or reminder of key steps.

---

### 3. **DEPLOYMENT_PLAN.md** 📖 Complete Guide
**Comprehensive deployment documentation**
- ✅ Detailed explanations
- ✅ All options and alternatives
- ✅ Troubleshooting guide
- ✅ Best practices

**Use this if:** You want detailed explanations and all available options.

---

### 4. **scripts/deploy.sh** 🤖 Automated Helper
**Interactive deployment script**
- ✅ Interactive menu
- ✅ Step-by-step automation
- ✅ Error checking
- ✅ Color-coded output

**Use this if:** You want guided, interactive deployment.

---

## 🎯 Recommended Approach

### For First-Time Deployment:
1. **Start with**: `DEPLOYMENT_CLI.md` (if you like CLI) or `DEPLOYMENT_PLAN.md` (if you prefer detailed guides)
2. **Use**: `scripts/deploy.sh` for interactive help
3. **Reference**: `DEPLOYMENT_QUICK_START.md` for quick reminders

### For Subsequent Deployments:
- Use CLI commands from `DEPLOYMENT_CLI.md`
- Or use the automated script: `./scripts/deploy.sh`

---

## 🏗️ Architecture

**Simplified 3-Service Setup:**
```
Storefront (Vercel) → Backend (Railway) → Database (Supabase)
```

**Services:**
- **Vercel**: Next.js storefront hosting (free tier)
- **Railway**: Medusa.js backend hosting ($5/month credit)
- **Supabase**: PostgreSQL database (500MB free)

**Note**: Redis is optional and skipped for simplicity. Add later if needed.

---

## ⚡ Quick Start

### Prerequisites
```bash
# Install CLI tools
npm install -g supabase @railway/cli vercel

# Or with Homebrew (Mac)
brew install supabase/tap/supabase railway vercel
```

### Deploy Everything
```bash
# Option 1: Use automated script
./scripts/deploy.sh

# Option 2: Follow CLI guide
# See DEPLOYMENT_CLI.md

# Option 3: Follow detailed guide
# See DEPLOYMENT_PLAN.md
```

---

## 📋 Deployment Checklist

- [ ] Install CLI tools (Supabase, Railway, Vercel)
- [ ] Create Supabase project and get DATABASE_URL
- [ ] Deploy backend to Railway
- [ ] Set backend environment variables
- [ ] Run database migrations
- [ ] Deploy storefront to Vercel
- [ ] Set storefront environment variables
- [ ] Update backend CORS with storefront URL
- [ ] Get publishable key from Medusa admin
- [ ] Update storefront with publishable key
- [ ] Test deployment

---

## 🔑 Environment Variables

### Backend (Railway)
- `DATABASE_URL` - Supabase connection string
- `STORE_CORS` - Storefront URL
- `ADMIN_CORS` - Storefront URL
- `AUTH_CORS` - Storefront URL
- `JWT_SECRET` - Random secret
- `COOKIE_SECRET` - Random secret
- `NODE_ENV=production`

### Storefront (Vercel)
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` - Railway backend URL
- `MEDUSA_BACKEND_URL` - Railway backend URL
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` - From Medusa admin
- `NEXT_PUBLIC_DEFAULT_REGION=us`

See `env.production.template` for complete list.

---

## 🆘 Need Help?

### Common Issues
- **Backend won't start**: Check Railway logs, verify environment variables
- **Storefront can't connect**: Verify CORS settings, check backend URL
- **Database errors**: Verify Supabase connection string, check project status

### Documentation
- **Supabase**: https://supabase.com/docs
- **Railway**: https://docs.railway.app
- **Vercel**: https://vercel.com/docs
- **Medusa**: https://docs.medusajs.com

---

## 💰 Cost

**Free Tier Limits:**
- **Vercel**: Unlimited personal projects, 100GB bandwidth/month
- **Railway**: $5 credit/month (~500 hours runtime)
- **Supabase**: 500MB database, 2GB bandwidth

**Estimated Monthly Cost**: $0 (within free tier limits)

---

## 🔄 Updates & Maintenance

### Update Backend
```bash
cd bijou-coquettee
git push  # Railway auto-deploys
# Or: railway up
```

### Update Storefront
```bash
cd bijou-coquettee-storefront
git push  # Vercel auto-deploys
# Or: vercel --prod
```

### View Logs
```bash
# Backend
cd bijou-coquettee && railway logs

# Storefront
cd bijou-coquettee-storefront && vercel logs
```

---

## 📝 Files Reference

- `DEPLOYMENT_CLI.md` - CLI-only deployment guide
- `DEPLOYMENT_QUICK_START.md` - Quick reference checklist
- `DEPLOYMENT_PLAN.md` - Complete detailed guide
- `env.production.template` - Environment variables template
- `scripts/deploy.sh` - Interactive deployment helper

---

**Last Updated**: 2025-01-27
**Estimated Setup Time**: 20-45 minutes
**Difficulty**: Beginner to Intermediate

