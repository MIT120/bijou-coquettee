# 🚀 Quick Setup: Size Guide Feature

## Step 1: Run Database Migrations

```bash
cd bijou-coquettee
npx medusa db:migrate
```

This will create the necessary database tables for size guides.

## Step 2: Seed Size Data

```bash
cd bijou-coquettee
npx medusa exec ./src/scripts/seed-size-guide.ts
```

This populates your database with:
- 21 ring sizes (US, UK, EU, Asia conversions)
- 6 necklace length guides
- 5 bracelet length guides
- Comprehensive measurement instructions

## Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
cd bijou-coquettee
npm run dev
```

**Terminal 2 - Storefront:**
```bash
cd bijou-coquettee-storefront
npm run dev
```

## Step 4: Test It

1. Open `http://localhost:3000` in your browser
2. Navigate to any product page
3. For products with "ring", "necklace", "bracelet", or "chain" in the title/tags/categories:
   - You'll see a "📏 Size Guide" button
   - Click it to open the size guide modal
   - Try all three tabs: Size Chart, How to Measure, Size Finder

## 🎯 How to Make Products Show Size Guide

Add one of these to your products:
- **Tag**: "ring", "necklace", "bracelet", or "chain"
- **Category**: "Rings", "Necklaces", "Bracelets", or "Chains"
- **Title**: Include the word "ring", "necklace", "bracelet", or "chain"

Example product titles that will show size guide:
- "Diamond Ring 14K Gold" → Shows Ring Size Guide ✅
- "Pearl Necklace" → Shows Necklace Length Guide ✅
- "Silver Bracelet" → Shows Bracelet Length Guide ✅

## 🔧 Troubleshooting

### Size guide not showing?
- Check product has appropriate tags/categories
- Check browser console for errors
- Verify backend is running on port 9000

### No size data?
- Make sure seed script ran successfully
- Check database has tables: `size_guide`, `measurement_guide`

### Need help?
Check the full documentation: `SIZE_GUIDE_FEATURE.md`

---

✅ **That's it!** Your size guide feature is ready to use! 💎

