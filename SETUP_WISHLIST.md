# 🚀 Quick Setup: Wishlist Feature

## ⚡ 5-Minute Setup

### Step 1: Start Docker
```bash
# From project root
cd /Users/zidaromazach/Documents/bijou-coquettee
docker-compose up -d
```

Wait ~10 seconds for PostgreSQL to be ready.

---

### Step 2: Run Database Migration
```bash
cd bijou-coquettee

# Generate migration (if not done)
npx medusa db:generate wishlist

# Run migration
npx medusa db:migrate
```

**Expected output:**
```
✓ Migration completed successfully
✓ Tables created: wishlist, wishlist_item
```

---

### Step 3: Start Backend
```bash
# In bijou-coquettee/
npm run dev
```

**Server should start on:** `http://localhost:9000`

---

### Step 4: Start Frontend
```bash
# In new terminal
cd bijou-coquettee-storefront
npm run dev
```

**App should start on:** `http://localhost:3000`

---

### Step 5: Test It!

1. **Visit a product page:**
   ```
   http://localhost:3000/products/any-product
   ```

2. **Click the heart icon** ❤️ next to "Add to Cart"

3. **If not logged in:** You'll be redirected to login

4. **After logging in:** Heart fills in red, item saved!

5. **Check your wishlist:**
   ```
   http://localhost:3000/account/wishlist
   ```

6. **See counter in header:** Heart icon with item count

---

## ✅ Verification Checklist

- [ ] Docker containers running
- [ ] Database migration completed
- [ ] Backend running on port 9000
- [ ] Frontend running on port 3000
- [ ] Heart icon appears on product pages
- [ ] Can add/remove items from wishlist
- [ ] Wishlist page shows saved items
- [ ] Counter in header updates correctly

---

## 🐛 Quick Fixes

### Docker not running?
```bash
# Start Docker Desktop application
# Then:
docker-compose up -d
```

### Migration fails?
```bash
# Check if PostgreSQL is ready
docker ps

# Wait 10 more seconds and try again
sleep 10
npx medusa db:migrate
```

### Port already in use?
```bash
# Kill process on port 9000 (backend)
lsof -ti:9000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Full Documentation

See `WISHLIST_FEATURE_COMPLETE.md` for:
- Complete feature documentation
- API reference
- Usage examples
- Troubleshooting guide
- Future enhancements

---

**That's it!** Your wishlist feature is ready to use! 🎉

