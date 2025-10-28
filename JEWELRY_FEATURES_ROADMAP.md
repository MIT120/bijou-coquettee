# 💎 Bijou Coquettee - Jewelry E-commerce Features Roadmap

## Overview
This document provides a comprehensive guide for implementing luxury jewelry e-commerce features into the Bijou Coquettee platform. Each feature includes complexity ratings, implementation steps, and time estimates.

---

## 📊 Complexity & Time Overview

### Complexity Scale
- 🟢 **Easy** (1-3 days) - Basic features, minimal dependencies
- 🟡 **Moderate** (4-7 days) - Requires custom modules or integrations
- 🟠 **Complex** (1-2 weeks) - Multiple modules, workflows, external services
- 🔴 **Advanced** (2-4 weeks) - Complex integrations, AI/ML, real-time features

### Total Estimated Timeline
- **Phase 1 (Foundation)**: 3-4 weeks
- **Phase 2 (Trust & Conversion)**: 3-4 weeks  
- **Phase 3 (Premium Experience)**: 4-5 weeks
- **Phase 4 (Content)**: 2-3 weeks
- **Phase 5 (Technical)**: 2-3 weeks

**Total Project Time**: 14-19 weeks (3.5-4.5 months)

---

## Phase 1: Foundation Features (3-4 weeks)

### 1. Enhanced Product Images (Zoom, 360° View, Multiple Images)
**Complexity**: 🟡 Moderate (5-7 days)

#### What It Does
- High-resolution image zoom on hover/click
- 360° product rotation view
- Support for 6-10 images per product
- Gallery navigation with thumbnails
- Mobile-optimized touch gestures

#### Why It's Important
Jewelry customers need to see fine details, gemstone clarity, and craftsmanship. This feature builds trust and reduces returns.

#### Implementation Steps

**Backend (Medusa)**
```typescript
// 1. Update Product Model to support multiple images
// No changes needed - Medusa already supports multiple images per product

// 2. Create image optimization service
// src/modules/media/services/image-optimizer.ts
class ImageOptimizerService {
  async optimizeProductImage(imageUrl: string, sizes: string[]) {
    // Generate multiple sizes: thumbnail, medium, large, zoom
    // Use Sharp or Cloudinary
  }
}
```

**Storefront (Next.js)**
```typescript
// 3. Install dependencies
npm install react-medium-image-zoom react-image-gallery

// 4. Create ImageGallery component
// src/modules/products/components/image-gallery/index.tsx
"use client"
import ImageGallery from 'react-image-gallery'

export default function ProductImageGallery({ images }) {
  return (
    <ImageGallery
      items={images}
      showPlayButton={false}
      showFullscreenButton={true}
      showNav={true}
      thumbnailPosition="left"
    />
  )
}

// 5. Add 360 viewer
npm install @3dweb/360javascriptviewer
// Integrate in product page
```

#### Technical Requirements
- **Dependencies**: `react-medium-image-zoom`, `react-image-gallery`, `@3dweb/360javascriptviewer`
- **Storage**: CDN for images (Cloudinary, AWS S3 + CloudFront)
- **Image sizes**: Thumbnail (150px), Medium (600px), Large (1200px), Zoom (2400px)

#### Time Estimate: 5-7 days
- Backend setup: 1 day
- Frontend component: 2 days
- 360° integration: 2 days
- Mobile optimization: 1 day
- Testing: 1 day

---

### 2. Size Guide & Finder
**Complexity**: 🟢 Easy (2-3 days)

#### What It Does
- Interactive ring size chart
- Printable ring sizer PDF
- Necklace/bracelet length guide with visuals
- Size conversion (US, UK, EU, Asia)
- Measurement instructions

#### Why It's Important
Reduces returns due to sizing issues, builds confidence in online purchases.

#### Implementation Steps

**Backend**
```typescript
// 1. Create size guide data model
// src/modules/size-guide/models/size-guide.ts
export const SizeGuide = model.define("size_guide", {
  id: model.id().primaryKey(),
  category: model.enum(["ring", "necklace", "bracelet", "earring"]),
  size_us: model.text(),
  size_uk: model.text(),
  size_eu: model.text(),
  size_asia: model.text(),
  circumference_mm: model.number(),
  diameter_mm: model.number(),
})

// 2. Create API route
// src/api/store/size-guide/route.ts
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sizeGuideService = req.scope.resolve("sizeGuideService")
  const guides = await sizeGuideService.list()
  res.json({ guides })
}
```

**Storefront**
```typescript
// 3. Create SizeGuide component
// src/modules/products/components/size-guide/index.tsx
"use client"

export default function SizeGuide({ category }) {
  return (
    <div className="size-guide-modal">
      <h2>Find Your Size</h2>
      <SizeChart category={category} />
      <MeasurementInstructions />
      <DownloadablePDF />
    </div>
  )
}

// 4. Add size selector to product page
// Integrate with existing product template
```

#### Technical Requirements
- **Dependencies**: `jspdf` (for PDF generation)
- **Assets**: Size chart SVGs, measurement instruction images
- **Data**: Size conversion tables

#### Time Estimate: 2-3 days
- Data model & API: 0.5 day
- Frontend component: 1 day
- PDF generation: 0.5 day
- Testing & polish: 1 day

---

### 3. Jewelry-Specific Filters & Search
**Complexity**: 🟡 Moderate (4-5 days)

#### What It Does
- Filter by metal type (gold, silver, platinum, rose gold)
- Filter by gemstone (diamond, sapphire, ruby, emerald, etc.)
- Filter by occasion (engagement, wedding, anniversary, everyday)
- Filter by style (vintage, modern, minimalist, statement)
- Filter by recipient (for her, for him, unisex)
- Price range with luxury tiers
- Advanced search with multiple criteria

#### Why It's Important
Helps customers find exactly what they're looking for, improving conversion rates and user experience.

#### Implementation Steps

**Backend**
```typescript
// 1. Add custom product attributes
// src/modules/jewelry/models/jewelry-attributes.ts
export const JewelryAttributes = model.define("jewelry_attributes", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  metal_type: model.enum([
    "14k-yellow-gold", 
    "18k-yellow-gold", 
    "14k-white-gold", 
    "18k-white-gold",
    "rose-gold",
    "sterling-silver",
    "platinum"
  ]),
  primary_gemstone: model.text().nullable(),
  secondary_gemstones: model.json().nullable(),
  occasion: model.json(), // Array of occasions
  style: model.json(), // Array of styles
  recipient: model.enum(["women", "men", "unisex"]),
  carat_weight: model.number().nullable(),
  clarity: model.text().nullable(),
  color_grade: model.text().nullable(),
})

// 2. Create search workflow
// src/workflows/jewelry-search.ts
export const jewelrySearchWorkflow = createWorkflow(
  "jewelry-search",
  function (input: SearchInput) {
    const filters = buildFilters(input)
    const results = searchProducts(filters)
    return new WorkflowResponse(results)
  }
)

// 3. Create API endpoint
// src/api/store/products/search/route.ts
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { filters } = req.body
  const { result } = await jewelrySearchWorkflow(req.scope)
    .run({ input: filters })
  
  res.json({ products: result })
}
```

**Storefront**
```typescript
// 4. Create FilterPanel component
// src/modules/store/components/filter-panel/index.tsx
"use client"

export default function FilterPanel({ onFilterChange }) {
  return (
    <aside className="filter-panel">
      <FilterGroup title="Metal Type" options={metalTypes} />
      <FilterGroup title="Gemstone" options={gemstones} />
      <FilterGroup title="Price Range" type="range" />
      <FilterGroup title="Occasion" options={occasions} />
      <FilterGroup title="Style" options={styles} />
      <FilterGroup title="Recipient" options={recipients} />
    </aside>
  )
}

// 5. Update store page with filters
// src/app/[countryCode]/(main)/store/page.tsx
```

#### Technical Requirements
- **Dependencies**: None (built-in Medusa features)
- **Database**: PostgreSQL indexes on filter fields
- **Search**: Consider Meilisearch or Algolia for better performance

#### Time Estimate: 4-5 days
- Data model & migrations: 1 day
- Backend API: 1 day
- Frontend components: 2 days
- Testing & refinement: 1 day

---

### 4. Wishlist Functionality
**Complexity**: 🟡 Moderate (3-4 days)

#### What It Does
- Save products to wishlist (heart icon)
- View all wishlist items
- Share wishlist publicly (for gift hints)
- Move items from wishlist to cart
- Price drop notifications
- Back-in-stock alerts

#### Why It's Important
Increases engagement, captures intent, enables gift-giving, and provides remarketing opportunities.

#### Implementation Steps

**Backend**
```typescript
// 1. Create Wishlist module
// src/modules/wishlist/models/wishlist.ts
export const Wishlist = model.define("wishlist", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  is_public: model.boolean().default(false),
  share_token: model.text().nullable(),
})

export const WishlistItem = model.define("wishlist_item", {
  id: model.id().primaryKey(),
  wishlist_id: model.text(),
  product_id: model.text(),
  variant_id: model.text().nullable(),
  added_at: model.dateTime(),
})

// 2. Create Wishlist service
// src/modules/wishlist/services/wishlist.ts
class WishlistService extends MedusaService({ Wishlist, WishlistItem }) {
  async addItem(customerId: string, productId: string) {
    // Add product to wishlist
  }
  
  async removeItem(customerId: string, productId: string) {
    // Remove from wishlist
  }
  
  async getWishlist(customerId: string) {
    // Get full wishlist with product details
  }
  
  async generateShareToken(wishlistId: string) {
    // Create public share link
  }
}

// 3. Create API routes
// src/api/store/wishlist/route.ts
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // Add to wishlist
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Get wishlist
}

// 4. Create subscriber for price drops
// src/subscribers/wishlist-price-drop.ts
export default async function wishlistPriceDropHandler({ event, container }) {
  // Check if any wishlist items have price drops
  // Send email notifications
}
```

**Storefront**
```typescript
// 5. Create Wishlist context
// src/lib/context/wishlist-context.tsx
"use client"

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([])
  
  const addToWishlist = async (productId) => {
    await fetch('/store/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId })
    })
  }
  
  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

// 6. Create WishlistButton component
// src/modules/products/components/wishlist-button/index.tsx
"use client"

export default function WishlistButton({ productId }) {
  const { addToWishlist, wishlist } = useWishlist()
  const isInWishlist = wishlist.includes(productId)
  
  return (
    <button onClick={() => addToWishlist(productId)}>
      {isInWishlist ? <HeartFilled /> : <HeartOutline />}
    </button>
  )
}

// 7. Create Wishlist page
// src/app/[countryCode]/(main)/account/wishlist/page.tsx
```

#### Technical Requirements
- **Dependencies**: None
- **Email**: Resend or SendGrid for notifications
- **Queue**: Redis for processing notifications

#### Time Estimate: 3-4 days
- Backend module: 1 day
- API routes: 0.5 day
- Frontend components: 1 day
- Wishlist page: 0.5 day
- Notifications: 1 day

---

### 5. Customer Reviews with Photos
**Complexity**: 🟡 Moderate (4-5 days)

#### What It Does
- Submit text reviews with ratings (1-5 stars)
- Upload photos/videos with reviews
- "Verified Purchase" badge
- Rating breakdown by category (quality, appearance, fit)
- Sort and filter reviews
- Mark reviews as helpful
- Admin moderation

#### Why It's Important
Social proof is critical for jewelry purchases. Photo reviews increase trust and conversion rates.

#### Implementation Steps

**Backend**
```typescript
// 1. Create Review module
// src/modules/reviews/models/review.ts
export const Review = model.define("review", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  customer_id: model.text(),
  order_id: model.text().nullable(), // For verified purchases
  rating: model.number(), // 1-5
  title: model.text(),
  content: model.text(),
  quality_rating: model.number().nullable(),
  appearance_rating: model.number().nullable(),
  fit_rating: model.number().nullable(),
  verified_purchase: model.boolean().default(false),
  is_approved: model.boolean().default(false),
  helpful_count: model.number().default(0),
  created_at: model.dateTime(),
})

export const ReviewMedia = model.define("review_media", {
  id: model.id().primaryKey(),
  review_id: model.text(),
  media_url: model.text(),
  media_type: model.enum(["image", "video"]),
  thumbnail_url: model.text().nullable(),
})

// 2. Create Review service
// src/modules/reviews/services/review.ts
class ReviewService extends MedusaService({ Review, ReviewMedia }) {
  async createReview(data: CreateReviewInput) {
    // Validate customer purchased product
    // Create review
    // Upload media
  }
  
  async getProductReviews(productId: string, filters: ReviewFilters) {
    // Get reviews with filters
  }
  
  async markHelpful(reviewId: string) {
    // Increment helpful count
  }
}

// 3. Create API routes
// src/api/store/reviews/route.ts
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // Submit review with media upload
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Get reviews for product
}

// 4. Create admin widget for moderation
// src/admin/widgets/review-moderation.tsx
```

**Storefront**
```typescript
// 5. Create ReviewForm component
// src/modules/products/components/review-form/index.tsx
"use client"

export default function ReviewForm({ productId }) {
  const [photos, setPhotos] = useState([])
  
  const handleSubmit = async (data) => {
    const formData = new FormData()
    formData.append('product_id', productId)
    formData.append('rating', data.rating)
    formData.append('content', data.content)
    photos.forEach(photo => formData.append('photos', photo))
    
    await fetch('/store/reviews', {
      method: 'POST',
      body: formData
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <StarRating />
      <TextArea placeholder="Share your experience..." />
      <PhotoUpload onChange={setPhotos} max={5} />
      <Button>Submit Review</Button>
    </form>
  )
}

// 6. Create ReviewList component
// src/modules/products/components/review-list/index.tsx

// 7. Add to product page
```

#### Technical Requirements
- **Dependencies**: `multer` (file upload), `sharp` (image processing)
- **Storage**: S3 or Cloudinary for media
- **Moderation**: Consider implementing AI moderation (AWS Rekognition)

#### Time Estimate: 4-5 days
- Backend module: 1.5 days
- File upload handling: 1 day
- Frontend components: 1.5 days
- Admin moderation: 1 day

---

## Phase 2: Trust & Conversion (3-4 weeks)

### 6. Product Customization (Engravings, Metal Selection)
**Complexity**: 🟠 Complex (7-10 days)

#### What It Does
- Add custom engraving text
- Choose engraving font style
- Select metal type (14k, 18k gold, silver, platinum)
- Choose gemstone type and quality
- Select chain length
- Preview customizations
- Price adjustments for upgrades
- Add customization to order details

#### Why It's Important
Personalization increases emotional value, reduces returns, and allows premium pricing. Critical for engagement rings and gifts.

#### Implementation Steps

**Backend**
```typescript
// 1. Create Customization module
// src/modules/customization/models/customization.ts
export const ProductCustomizationOption = model.define(
  "product_customization_option",
  {
    id: model.id().primaryKey(),
    product_id: model.text(),
    option_type: model.enum([
      "engraving",
      "metal_type",
      "gemstone",
      "chain_length",
    ]),
    option_name: model.text(),
    price_adjustment: model.number().default(0),
    is_available: model.boolean().default(true),
  }
)

export const CartItemCustomization = model.define(
  "cart_item_customization",
  {
    id: model.id().primaryKey(),
    cart_line_item_id: model.text(),
    engraving_text: model.text().nullable(),
    engraving_font: model.text().nullable(),
    metal_type: model.text().nullable(),
    gemstone_type: model.text().nullable(),
    chain_length: model.text().nullable(),
    total_price_adjustment: model.number().default(0),
    customization_data: model.json(), // Store all custom data
  }
)

// 2. Create Customization service
// src/modules/customization/services/customization.ts
class CustomizationService extends MedusaService({
  ProductCustomizationOption,
  CartItemCustomization,
}) {
  async getProductOptions(productId: string) {
    // Get available customization options
  }
  
  async calculatePriceAdjustment(customizations: any) {
    // Calculate total price adjustment
  }
  
  async applyCustomization(lineItemId: string, customizations: any) {
    // Apply customizations to cart item
  }
}

// 3. Create workflow for adding custom item to cart
// src/workflows/add-custom-item-to-cart.ts
export const addCustomItemToCartWorkflow = createWorkflow(
  "add-custom-item-to-cart",
  function (input: {
    cartId: string
    productId: string
    variantId: string
    customizations: any
  }) {
    // 1. Validate customization options
    const validated = validateCustomizations(input.customizations)
    
    // 2. Calculate price adjustment
    const priceAdjustment = calculatePriceAdjustment(validated)
    
    // 3. Add item to cart
    const lineItem = addToCart({
      cartId: input.cartId,
      variantId: input.variantId,
      quantity: 1,
    })
    
    // 4. Store customization data
    const customization = saveCustomization({
      lineItemId: lineItem.id,
      customizations: validated,
      priceAdjustment,
    })
    
    // 5. Update line item price
    const updated = updateLineItemPrice({
      lineItemId: lineItem.id,
      adjustment: priceAdjustment,
    })
    
    return new WorkflowResponse({
      lineItem: updated,
      customization,
    })
  }
)

// 4. Create API routes
// src/api/store/products/[id]/customization-options/route.ts
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const service = req.scope.resolve("customizationService")
  const options = await service.getProductOptions(id)
  res.json({ options })
}

// src/api/store/cart/custom-item/route.ts
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { cartId, productId, variantId, customizations } = req.body
  
  const { result } = await addCustomItemToCartWorkflow(req.scope).run({
    input: { cartId, productId, variantId, customizations },
  })
  
  res.json({ success: true, data: result })
}

// 5. Link customization to order items
// src/links/customization-order-link.ts
import { defineLink } from "@medusajs/framework/utils"
import CustomizationModule from "../modules/customization"
import OrderModule from "@medusajs/framework/order"

export default defineLink(
  CustomizationModule.linkable.cartItemCustomization,
  OrderModule.linkable.lineItem
)
```

**Storefront**
```typescript
// 6. Create CustomizationBuilder component
// src/modules/products/components/customization-builder/index.tsx
"use client"

export default function CustomizationBuilder({ 
  product, 
  onCustomizationChange 
}) {
  const [customization, setCustomization] = useState({
    engravingText: '',
    engravingFont: 'script',
    metalType: '14k-yellow-gold',
    gemstone: null,
    chainLength: null,
  })
  
  const [priceAdjustment, setPriceAdjustment] = useState(0)
  
  useEffect(() => {
    // Calculate price adjustment when customization changes
    calculatePrice()
  }, [customization])
  
  return (
    <div className="customization-builder">
      <EngravingInput 
        value={customization.engravingText}
        onChange={(text) => setCustomization({...customization, engravingText: text})}
      />
      
      <FontSelector 
        value={customization.engravingFont}
        options={['script', 'block', 'cursive']}
        onChange={(font) => setCustomization({...customization, engravingFont: font})}
      />
      
      <MetalTypeSelector
        value={customization.metalType}
        options={metalOptions}
        onChange={(metal) => setCustomization({...customization, metalType: metal})}
      />
      
      <GemstoneSelector 
        value={customization.gemstone}
        options={gemstoneOptions}
        onChange={(gem) => setCustomization({...customization, gemstone: gem})}
      />
      
      <CustomizationPreview customization={customization} />
      
      <PriceAdjustment amount={priceAdjustment} />
    </div>
  )
}

// 7. Create CustomizationPreview component
// src/modules/products/components/customization-preview/index.tsx
"use client"

export default function CustomizationPreview({ customization, productImage }) {
  return (
    <div className="preview-container">
      <img src={productImage} alt="Product" />
      {customization.engravingText && (
        <div 
          className={`engraving-overlay font-${customization.engravingFont}`}
        >
          {customization.engravingText}
        </div>
      )}
    </div>
  )
}

// 8. Update AddToCart to handle customizations
// src/modules/cart/components/add-to-cart-button/index.tsx

// 9. Display customizations in cart
// src/modules/cart/components/cart-item-customization/index.tsx

// 10. Show customizations in order confirmation
// src/modules/order/components/order-item-customization/index.tsx
```

#### Technical Requirements
- **Dependencies**: `canvas` or `fabric.js` (for preview rendering)
- **Storage**: Store customization data in JSON field
- **Pricing**: Dynamic price calculation engine
- **Validation**: Character limits, allowed characters for engraving

#### Time Estimate: 7-10 days
- Backend data model: 1 day
- Workflow implementation: 2 days
- API routes: 1 day
- Frontend builder UI: 3 days
- Preview rendering: 1 day
- Cart/order integration: 1-2 days
- Testing: 1 day

---

### 7. Certificates & Authentication Display
**Complexity**: 🟢 Easy (2-3 days)

#### What It Does
- Upload and display GIA/IGI certificates
- Show metal purity certificates
- Display authenticity guarantee
- Provide care instructions
- Show warranty information
- Ethical sourcing details

#### Why It's Important
Builds trust, especially for high-value items like diamond jewelry. Customers want proof of quality.

#### Implementation Steps

**Backend**
```typescript
// 1. Create Certificate model
// src/modules/certificates/models/certificate.ts
export const Certificate = model.define("certificate", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  certificate_type: model.enum([
    "gia_diamond",
    "igi_diamond",
    "metal_purity",
    "authenticity",
    "ethical_sourcing"
  ]),
  certificate_number: model.text(),
  issuing_authority: model.text(),
  issue_date: model.dateTime(),
  document_url: model.text(),
  thumbnail_url: model.text().nullable(),
  details: model.json(), // Additional certificate details
})

// 2. Create API route
// src/api/store/products/[id]/certificates/route.ts
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const certificateService = req.scope.resolve("certificateService")
  const certificates = await certificateService.listByProduct(id)
  res.json({ certificates })
}

// 3. Create admin widget to upload certificates
// src/admin/widgets/product-certificates.tsx
```

**Storefront**
```typescript
// 4. Create CertificateDisplay component
// src/modules/products/components/certificate-display/index.tsx
export default function CertificateDisplay({ certificates }) {
  return (
    <div className="certificates-section">
      <h3>Authenticity & Certificates</h3>
      {certificates.map(cert => (
        <CertificateCard 
          key={cert.id}
          type={cert.certificate_type}
          number={cert.certificate_number}
          issuer={cert.issuing_authority}
          documentUrl={cert.document_url}
        />
      ))}
    </div>
  )
}

// 5. Add to product page
```

#### Technical Requirements
- **Dependencies**: `pdf.js` (for PDF preview)
- **Storage**: S3 for certificate PDFs
- **Security**: Secure URLs for certificate documents

#### Time Estimate: 2-3 days
- Backend module: 0.5 day
- Admin upload interface: 1 day
- Frontend display: 0.5 day
- Testing: 0.5 day

---

### 8. Gift Options at Checkout
**Complexity**: 🟡 Moderate (3-4 days)

#### What It Does
- Add gift message/card
- Select premium gift packaging
- Send to different shipping address
- Hide prices (gift receipt)
- Schedule delivery date
- Gift wrapping options

#### Why It's Important
Jewelry is often purchased as gifts. Gift options increase convenience and average order value.

#### Implementation Steps

**Backend**
```typescript
// 1. Extend Cart/Order models
// src/modules/gift/models/gift-options.ts
export const GiftOptions = model.define("gift_options", {
  id: model.id().primaryKey(),
  cart_id: model.text(),
  is_gift: model.boolean().default(false),
  gift_message: model.text().nullable(),
  gift_from: model.text().nullable(),
  gift_to: model.text().nullable(),
  gift_packaging_type: model.enum(["standard", "premium", "luxury"]).nullable(),
  gift_packaging_price: model.number().default(0),
  hide_prices: model.boolean().default(false),
  scheduled_delivery: model.dateTime().nullable(),
})

// 2. Create workflow
// src/workflows/apply-gift-options.ts
export const applyGiftOptionsWorkflow = createWorkflow(
  "apply-gift-options",
  function (input: { cartId: string; giftOptions: any }) {
    const validated = validateGiftOptions(input.giftOptions)
    const pricing = calculateGiftPricing(validated)
    const applied = applyToCart({
      cartId: input.cartId,
      options: validated,
      price: pricing,
    })
    return new WorkflowResponse(applied)
  }
)

// 3. API routes
// src/api/store/cart/gift-options/route.ts
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { cartId, giftOptions } = req.body
  const { result } = await applyGiftOptionsWorkflow(req.scope).run({
    input: { cartId, giftOptions }
  })
  res.json({ success: true, data: result })
}
```

**Storefront**
```typescript
// 4. Create GiftOptions component
// src/modules/checkout/components/gift-options/index.tsx
"use client"

export default function GiftOptions({ cartId }) {
  const [isGift, setIsGift] = useState(false)
  
  return (
    <div className="gift-options">
      <Checkbox 
        label="This is a gift"
        checked={isGift}
        onChange={setIsGift}
      />
      
      {isGift && (
        <>
          <GiftMessageInput />
          <GiftPackagingSelector />
          <GiftRecipientInfo />
          <ScheduleDelivery />
          <Checkbox label="Hide prices on packing slip" />
        </>
      )}
    </div>
  )
}

// 5. Add to checkout flow
// src/modules/checkout/templates/checkout-form/index.tsx
```

#### Technical Requirements
- **Dependencies**: Date picker library
- **Pricing**: Gift packaging tiers with pricing
- **Fulfillment**: Integration with packaging instructions

#### Time Estimate: 3-4 days
- Backend module: 1 day
- Workflow: 0.5 day
- Frontend components: 1.5 days
- Testing: 1 day

---

### 9. Insurance & Warranty Options
**Complexity**: 🟡 Moderate (4-5 days)

#### What It Does
- Offer extended warranty (1yr, 2yr, lifetime)
- Jewelry insurance options
- Free resizing service
- Lifetime cleaning service
- Add warranty to cart as line item
- Store warranty details with order

#### Why It's Important
Adds revenue, builds trust, reduces customer service inquiries, and protects high-value purchases.

#### Implementation Steps

**Backend**
```typescript
// 1. Create Warranty module
// src/modules/warranty/models/warranty.ts
export const WarrantyProduct = model.define("warranty_product", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text(),
  duration_years: model.number(),
  price: model.number(),
  coverage_details: model.json(),
  is_active: model.boolean().default(true),
})

export const WarrantyPurchase = model.define("warranty_purchase", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  line_item_id: model.text(), // Item being protected
  warranty_product_id: model.text(),
  start_date: model.dateTime(),
  end_date: model.dateTime(),
  is_active: model.boolean().default(true),
})

// 2. Create workflow to add warranty
// src/workflows/add-warranty-to-cart.ts
export const addWarrantyToCartWorkflow = createWorkflow(
  "add-warranty-to-cart",
  function (input: { 
    cartId: string
    lineItemId: string
    warrantyProductId: string 
  }) {
    const warranty = getWarrantyProduct(input.warrantyProductId)
    const lineItem = addWarrantyItem({
      cartId: input.cartId,
      warranty,
      protectedItemId: input.lineItemId,
    })
    return new WorkflowResponse(lineItem)
  }
)

// 3. API routes
// src/api/store/warranty/products/route.ts
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve("warrantyService")
  const warranties = await service.listWarrantyProducts()
  res.json({ warranties })
}

// src/api/store/cart/add-warranty/route.ts
```

**Storefront**
```typescript
// 4. Create WarrantySelector component
// src/modules/products/components/warranty-selector/index.tsx
"use client"

export default function WarrantySelector({ product, onSelect }) {
  const [warranties, setWarranties] = useState([])
  
  useEffect(() => {
    fetchWarranties()
  }, [])
  
  return (
    <div className="warranty-options">
      <h4>Protect Your Purchase</h4>
      {warranties.map(warranty => (
        <WarrantyOption 
          key={warranty.id}
          warranty={warranty}
          productPrice={product.price}
          onSelect={() => onSelect(warranty)}
        />
      ))}
    </div>
  )
}

// 5. Add to product page after "Add to Cart"
// 6. Display in cart
// 7. Show in order confirmation
```

#### Technical Requirements
- **Dependencies**: None
- **Pricing**: Calculate warranty price based on product value
- **Integration**: Connect with warranty provider if using third-party

#### Time Estimate: 4-5 days
- Backend module: 1.5 days
- Workflow: 1 day
- Frontend components: 1.5 days
- Testing: 1 day

---

### 10. Virtual Try-On (AR)
**Complexity**: 🔴 Advanced (10-14 days)

#### What It Does
- Use device camera to try on rings, earrings, necklaces
- AR overlay of jewelry on user's body
- Real-time rendering
- Save try-on photos
- Share try-ons on social media
- Works on mobile and desktop (with webcam)

#### Why It's Important
Reduces purchase anxiety, increases engagement, and provides a unique competitive advantage. Can significantly boost conversion rates.

#### Implementation Steps

**Technology Options:**
1. **WebXR / AR.js** (Free, open-source)
2. **Zappar** (Commercial, better quality)
3. **8th Wall** (Premium, best quality)
4. **Jeeliz** (Specialized for jewelry)

**Recommended: Jeeliz (jewelry-specific)**

```typescript
// 1. Install Jeeliz
npm install jeelizfacefilter

// 2. Create AR module
// src/modules/ar/components/virtual-try-on/index.tsx
"use client"

import { useEffect, useRef } from 'react'
import JEELIZFACEFILTER from 'jeelizfacefilter'

export default function VirtualTryOn({ product, jewelryType }) {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  
  useEffect(() => {
    initializeAR()
  }, [])
  
  const initializeAR = async () => {
    try {
      await JEELIZFACEFILTER.init({
        canvasId: 'ar-canvas',
        NNCPath: '/models/jeeliz/',
        callbackReady: onARReady,
        callbackTrack: onARTrack,
      })
    } catch (error) {
      console.error('AR initialization failed', error)
    }
  }
  
  const onARReady = (errCode) => {
    if (errCode) {
      console.error('AR not ready:', errCode)
      return
    }
    
    // Load jewelry 3D model
    loadJewelryModel(product.arModelUrl)
  }
  
  const onARTrack = (detectState) => {
    // Update jewelry position based on face tracking
    if (jewelryType === 'ring') {
      trackHand(detectState)
    } else if (jewelryType === 'earring') {
      trackEars(detectState)
    } else if (jewelryType === 'necklace') {
      trackNeck(detectState)
    }
  }
  
  const capturePhoto = () => {
    const canvas = canvasRef.current
    return canvas.toDataURL('image/png')
  }
  
  return (
    <div className="virtual-try-on">
      <video ref={videoRef} className="ar-video" />
      <canvas ref={canvasRef} id="ar-canvas" />
      
      <div className="ar-controls">
        <button onClick={capturePhoto}>📸 Capture</button>
        <button>Share</button>
      </div>
    </div>
  )
}

// 3. Create ARButton to launch modal
// src/modules/products/components/ar-button/index.tsx
"use client"

export default function ARButton({ product }) {
  const [showAR, setShowAR] = useState(false)
  
  // Check if device supports AR
  const isARSupported = useARSupport()
  
  if (!isARSupported || !product.arModelUrl) {
    return null
  }
  
  return (
    <>
      <button 
        onClick={() => setShowAR(true)}
        className="btn-try-on"
      >
        📱 Try On with AR
      </button>
      
      {showAR && (
        <Modal onClose={() => setShowAR(false)}>
          <VirtualTryOn product={product} />
        </Modal>
      )}
    </>
  )
}

// 4. Add AR model URLs to products
// Backend: Add ar_model_url field to product attributes
```

**Backend**
```typescript
// 5. Create 3D model storage
// src/modules/ar/models/ar-asset.ts
export const ARAsset = model.define("ar_asset", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  model_url: model.text(), // GLB/GLTF file
  thumbnail_url: model.text(),
  jewelry_type: model.enum(["ring", "earring", "necklace", "bracelet"]),
  file_size: model.number(),
})

// 6. Admin widget to upload 3D models
// src/admin/widgets/ar-model-upload.tsx
```

#### Technical Requirements
- **Dependencies**: 
  - `jeelizfacefilter` or `@zappar/zappar-cv` or `ar.js`
  - `three.js` (for 3D rendering)
  - `@mediapipe/hands` (for hand tracking)
- **3D Models**: Need GLB/GLTF files for each product (can outsource to 3D artists)
- **Storage**: CDN for 3D model files
- **Camera Permissions**: Handle browser permissions
- **Performance**: Optimize for mobile devices

#### Time Estimate: 10-14 days
- Technology evaluation: 1 day
- 3D model preparation: 2-3 days
- AR integration: 3-4 days
- Hand/face tracking: 2-3 days
- UI/UX refinement: 2 days
- Testing across devices: 2 days

**Note**: This is the most complex feature. Consider starting with a simpler "View in Room" AR first, then add try-on later.

---

## Phase 3: Premium Experience (4-5 weeks)

### 11. Virtual Consultation Booking
**Complexity**: 🟡 Moderate (4-5 days)

#### What It Does
- Book video calls with jewelry experts
- Select consultation type (engagement ring, custom design, styling)
- Calendar integration
- Email confirmations and reminders
- Video call link (Zoom, Google Meet, Whereby)
- Consultation notes and follow-up

#### Why It's Important
Provides white-glove service, builds relationships, increases average order value, and helps with complex decisions.

#### Implementation Steps

**Option 1: Use Calendly (Easiest)**
**Option 2: Build Custom Booking System (More Control)**

**Using Calendly:**

```typescript
// 1. Create Consultation module
// src/modules/consultation/models/consultation.ts
export const Consultation = model.define("consultation", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  consultation_type: model.enum([
    "engagement_ring",
    "custom_design",
    "styling",
    "repair",
    "general"
  ]),
  calendly_event_id: model.text(),
  scheduled_at: model.dateTime(),
  duration_minutes: model.number(),
  status: model.enum(["scheduled", "completed", "cancelled", "no_show"]),
  meeting_url: model.text(),
  notes: model.text().nullable(),
})

// 2. API route to track bookings
// src/api/store/consultations/route.ts
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { customerId, calendlyEventId, scheduledAt } = req.body
  const service = req.scope.resolve("consultationService")
  
  const consultation = await service.create({
    customer_id: customerId,
    calendly_event_id: calendlyEventId,
    scheduled_at: scheduledAt,
    status: "scheduled"
  })
  
  res.json({ consultation })
}

// 3. Webhook to sync with Calendly
// src/api/webhooks/calendly/route.ts
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { event, payload } = req.body
  
  if (event === 'invitee.created') {
    // Create consultation record
  } else if (event === 'invitee.canceled') {
    // Update status to cancelled
  }
  
  res.json({ received: true })
}
```

**Storefront**
```typescript
// 4. Create BookConsultation component
// src/modules/consultation/components/book-consultation/index.tsx
"use client"

export default function BookConsultation() {
  return (
    <div className="consultation-booking">
      <h2>Book a Consultation</h2>
      <p>Speak with our jewelry experts</p>
      
      <div className="consultation-types">
        <ConsultationType 
          type="engagement_ring"
          title="Engagement Ring Consultation"
          description="Get expert guidance on selecting the perfect engagement ring"
          calendlyUrl="https://calendly.com/bijou-coquettee/engagement"
        />
        <ConsultationType 
          type="custom_design"
          title="Custom Design"
          description="Design your dream jewelry piece"
          calendlyUrl="https://calendly.com/bijou-coquettee/custom"
        />
        <ConsultationType 
          type="styling"
          title="Styling Session"
          description="Learn how to style and layer jewelry"
          calendlyUrl="https://calendly.com/bijou-coquettee/styling"
        />
      </div>
    </div>
  )
}

// 5. Embed Calendly widget
// src/modules/consultation/components/calendly-embed/index.tsx
"use client"

import { InlineWidget } from 'react-calendly'

export default function CalendlyEmbed({ url }) {
  return (
    <InlineWidget 
      url={url}
      styles={{ height: '700px' }}
    />
  )
}

// 6. Create consultation page
// src/app/[countryCode]/(main)/consultation/page.tsx
```

**Custom Booking System (Alternative):**

```typescript
// If you want full control, integrate with:
// - Stripe for payment (deposit for consultation)
// - Whereby API for video rooms
// - SendGrid for email notifications
// - Full Calendar for scheduling UI

// This adds 3-5 more days but gives complete control
```

#### Technical Requirements
- **Option 1 (Calendly)**: 
  - `react-calendly` package
  - Calendly account
  - Webhook endpoint
- **Option 2 (Custom)**:
  - Video API (Whereby, Zoom, Daily.co)
  - Calendar library
  - Email service
  - Payment for deposits

#### Time Estimate: 4-5 days (Calendly) or 7-10 days (Custom)
- Backend model: 0.5 day
- Calendly integration: 1 day
- Webhook setup: 1 day
- Frontend components: 1.5 days
- Testing: 1 day

---

### 12. Education Hub & Blog
**Complexity**: 🟢 Easy (3-4 days)

#### What It Does
- Jewelry care guides
- Gemstone education articles
- Metal comparison guides
- Buying guides (engagement rings, etc.)
- Style tips and trends
- Video tutorials
- SEO-optimized content

#### Why It's Important
Builds authority, improves SEO, educates customers, and increases organic traffic.

#### Implementation Steps

**Option 1: Use Medusa Blog Module (if available)**
**Option 2: Use external CMS (Contentful, Sanity)**
**Option 3: Build simple blog in Next.js**

**Using Next.js (Recommended for Control):**

```typescript
// 1. Create content structure
// content/blog/
//   - how-to-choose-engagement-ring.mdx
//   - jewelry-care-guide.mdx
//   - gemstone-guide.mdx

// 2. Install MDX support
npm install @next/mdx @mdx-js/loader @mdx-js/react

// 3. Configure next.config.js
// Add MDX support

// 4. Create blog data structure
// src/lib/blog.ts
export interface BlogPost {
  slug: string
  title: string
  description: string
  author: string
  publishedAt: string
  category: string
  tags: string[]
  featuredImage: string
  content: string
}

export async function getAllPosts(): Promise<BlogPost[]> {
  // Read MDX files from content directory
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  // Get single post
}

// 5. Create blog pages
// src/app/[countryCode]/(main)/learn/page.tsx
export default async function LearnPage() {
  const posts = await getAllPosts()
  
  return (
    <div className="learn-hub">
      <h1>Jewelry Education Hub</h1>
      <BlogGrid posts={posts} />
    </div>
  )
}

// src/app/[countryCode]/(main)/learn/[slug]/page.tsx
export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug)
  
  return (
    <article className="blog-post">
      <BlogPostHeader post={post} />
      <MDXContent content={post.content} />
      <RelatedPosts category={post.category} />
    </article>
  )
}

// 6. Create blog components
// src/modules/blog/components/blog-card/index.tsx
// src/modules/blog/components/blog-grid/index.tsx
// src/modules/blog/components/blog-post-header/index.tsx
```

**Content Categories:**
- Guides (How-to articles)
- Education (Gemstone guides, metal info)
- Style Tips (Trends, layering)
- Care (Cleaning, maintenance)
- Buying Guides (Engagement rings, gifts)

#### Technical Requirements
- **Dependencies**: 
  - `@next/mdx` (for Markdown content)
  - `gray-matter` (for frontmatter parsing)
  - `reading-time` (for reading time estimates)
- **Content**: Need to write or hire writers for articles
- **SEO**: Implement schema markup for articles

#### Time Estimate: 3-4 days (technical), 2+ weeks (content creation)
- MDX setup: 1 day
- Blog pages & components: 2 days
- Testing & SEO: 1 day
- Content writing: Ongoing

---

### 13. Collection Storytelling
**Complexity**: 🟢 Easy (2-3 days)

#### What It Does
- Rich collection pages with stories
- Designer background and inspiration
- Behind-the-scenes content
- Craftsmanship videos
- Material sourcing stories
- Lookbook/editorial photography

#### Why It's Important
Creates emotional connection, justifies premium pricing, and differentiates from competitors.

#### Implementation Steps

```typescript
// 1. Extend Collection model
// src/modules/collections/models/collection-story.ts
export const CollectionStory = model.define("collection_story", {
  id: model.id().primaryKey(),
  collection_id: model.text(),
  story_title: model.text(),
  story_content: model.text(), // Rich text/markdown
  designer_name: model.text().nullable(),
  designer_bio: model.text().nullable(),
  inspiration: model.text().nullable(),
  video_url: model.text().nullable(),
  lookbook_images: model.json(), // Array of image URLs
  craftsmanship_details: model.text().nullable(),
})

// 2. API route
// src/api/store/collections/[id]/story/route.ts
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const service = req.scope.resolve("collectionStoryService")
  const story = await service.getByCollection(id)
  res.json({ story })
}

// 3. Update collection page
// src/app/[countryCode]/(main)/collections/[handle]/page.tsx
export default async function CollectionPage({ params }) {
  const collection = await getCollectionByHandle(params.handle)
  const story = await getCollectionStory(collection.id)
  
  return (
    <>
      <CollectionHero collection={collection} story={story} />
      <CollectionStory story={story} />
      <ProductGrid products={collection.products} />
    </>
  )
}

// 4. Create story components
// src/modules/collections/components/collection-story/index.tsx
export default function CollectionStory({ story }) {
  return (
    <section className="collection-story">
      <div className="story-content">
        <h2>{story.story_title}</h2>
        <p>{story.story_content}</p>
      </div>
      
      {story.designer_name && (
        <DesignerBio 
          name={story.designer_name}
          bio={story.designer_bio}
        />
      )}
      
      {story.video_url && (
        <VideoPlayer url={story.video_url} />
      )}
      
      {story.lookbook_images && (
        <Lookbook images={story.lookbook_images} />
      )}
    </section>
  )
}
```

#### Technical Requirements
- **Dependencies**: Video player library
- **Content**: Photography, videography, copywriting
- **Storage**: CDN for media assets

#### Time Estimate: 2-3 days (technical), ongoing (content)
- Backend model: 0.5 day
- Frontend components: 1.5 days
- Testing: 0.5 day
- Content creation: Ongoing

---

### 14. Instagram Integration & Social Proof
**Complexity**: 🟡 Moderate (3-4 days)

#### What It Does
- Display customer photos from Instagram (#bijoucucoquettee)
- Shop products from Instagram posts
- Show Instagram feed on homepage
- Embed Instagram stories
- Social sharing buttons
- Influencer collaboration features

#### Why It's Important
Provides social proof, encourages UGC, builds community, and drives traffic.

#### Implementation Steps

```typescript
// 1. Instagram API integration
// src/lib/instagram.ts
export async function getInstagramFeed() {
  const response = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
  )
  return response.json()
}

export async function getHashtagPosts(hashtag: string) {
  // Get posts with specific hashtag
}

// 2. Create Instagram module
// src/modules/instagram/models/instagram-post.ts
export const InstagramPost = model.define("instagram_post", {
  id: model.id().primaryKey(),
  instagram_id: model.text(),
  media_url: model.text(),
  permalink: model.text(),
  caption: model.text().nullable(),
  tagged_products: model.json(), // Array of product IDs
  is_featured: model.boolean().default(false),
  posted_at: model.dateTime(),
})

// 3. Sync Instagram posts (scheduled job)
// src/jobs/sync-instagram.ts
export default async function syncInstagramJob(container: MedusaContainer) {
  const posts = await getInstagramFeed()
  const instagramService = container.resolve("instagramService")
  
  for (const post of posts) {
    await instagramService.upsert({
      instagram_id: post.id,
      media_url: post.media_url,
      permalink: post.permalink,
      caption: post.caption,
      posted_at: post.timestamp,
    })
  }
}

export const config = {
  name: "sync-instagram",
  schedule: "0 */6 * * *", // Every 6 hours
}

// 4. API routes
// src/api/store/instagram/feed/route.ts
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve("instagramService")
  const posts = await service.list({ 
    is_featured: true,
    limit: 12 
  })
  res.json({ posts })
}
```

**Storefront**
```typescript
// 5. Create InstagramFeed component
// src/modules/home/components/instagram-feed/index.tsx
"use client"

export default function InstagramFeed() {
  const [posts, setPosts] = useState([])
  
  useEffect(() => {
    fetchPosts()
  }, [])
  
  return (
    <section className="instagram-feed">
      <h2>Shop Our Instagram</h2>
      <p>Tag #bijoucucoquettee to be featured</p>
      
      <div className="instagram-grid">
        {posts.map(post => (
          <InstagramPost 
            key={post.id}
            post={post}
            onClick={() => openInstagramModal(post)}
          />
        ))}
      </div>
      
      <a href="https://instagram.com/bijoucucoquettee">
        Follow @bijoucucoquettee
      </a>
    </section>
  )
}

// 6. Create InstagramModal (shop the look)
// src/modules/instagram/components/instagram-modal/index.tsx
export default function InstagramModal({ post, products }) {
  return (
    <Modal>
      <div className="instagram-modal">
        <img src={post.media_url} alt="Instagram post" />
        
        <div className="tagged-products">
          <h3>Shop This Look</h3>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Modal>
  )
}

// 7. Add to homepage
// src/app/[countryCode]/(main)/page.tsx
```

#### Technical Requirements
- **Dependencies**: Instagram Graph API
- **Authentication**: Instagram Business Account, Facebook App
- **Rate Limits**: Be mindful of API rate limits
- **Caching**: Cache Instagram data to reduce API calls

#### Time Estimate: 3-4 days
- Instagram API setup: 1 day
- Backend sync job: 1 day
- Frontend components: 1.5 days
- Testing: 0.5 day

---

## Phase 4: Content & Engagement (2-3 weeks)

### 15. Email Marketing Integration
**Complexity**: 🟡 Moderate (3-4 days)

#### What It Does
- Welcome series for new subscribers
- Abandoned cart emails
- Price drop notifications
- Back-in-stock alerts
- Order confirmations and shipping updates
- Re-engagement campaigns
- Newsletter

#### Why It's Important
Email generates highest ROI for e-commerce. Critical for recovering abandoned carts and building customer relationships.

#### Implementation Steps

**Using Medusa Notification Module + Resend/SendGrid:**

```typescript
// 1. Install dependencies
npm install @medusajs/notification resend

// 2. Configure notification module
// medusa-config.ts
modules: [
  {
    resolve: "@medusajs/notification",
    options: {
      providers: [
        {
          resolve: "./src/modules/email",
          id: "email",
          options: {
            channels: ["email"],
          },
        },
      ],
    },
  },
]

// 3. Create email templates
// src/modules/email/templates/
//   - welcome.tsx (React Email)
//   - abandoned-cart.tsx
//   - price-drop.tsx
//   - back-in-stock.tsx
//   - order-confirmation.tsx

// Example: Abandoned Cart Template
// src/modules/email/templates/abandoned-cart.tsx
import { 
  Body, 
  Container, 
  Head, 
  Html, 
  Img, 
  Preview, 
  Section, 
  Text 
} from '@react-email/components'

export default function AbandonedCartEmail({ cart, customer }) {
  return (
    <Html>
      <Head />
      <Preview>You left something beautiful behind...</Preview>
      <Body>
        <Container>
          <Text>Hi {customer.first_name},</Text>
          <Text>
            We noticed you left some stunning pieces in your cart. 
            They're still available!
          </Text>
          
          <Section>
            {cart.items.map(item => (
              <ProductCard item={item} />
            ))}
          </Section>
          
          <Button href={`/cart`}>
            Complete Your Purchase
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

// 4. Create email service
// src/modules/email/services/email.ts
import { Resend } from 'resend'

class EmailService {
  private resend: Resend
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY)
  }
  
  async sendAbandonedCartEmail(cart: Cart, customer: Customer) {
    await this.resend.emails.send({
      from: 'Bijou Coquettee <hello@bijoucucoquettee.com>',
      to: customer.email,
      subject: 'You left something beautiful behind',
      react: AbandonedCartEmail({ cart, customer }),
    })
  }
  
  async sendPriceDropEmail(product: Product, customer: Customer) {
    // Send price drop notification
  }
  
  async sendBackInStockEmail(product: Product, customer: Customer) {
    // Send back-in-stock alert
  }
}

// 5. Create subscribers for automated emails
// src/subscribers/abandoned-cart.ts
export default async function abandonedCartHandler({ event, container }) {
  const cartId = event.data.id
  const cartService = container.resolve("cartService")
  const emailService = container.resolve("emailService")
  
  // Wait 1 hour, then check if cart is still abandoned
  setTimeout(async () => {
    const cart = await cartService.retrieve(cartId)
    if (!cart.completed_at && cart.items.length > 0) {
      await emailService.sendAbandonedCartEmail(cart, cart.customer)
    }
  }, 60 * 60 * 1000) // 1 hour
}

export const config: SubscriberConfig = {
  event: "cart.customer_updated",
}

// 6. Wishlist price drop subscriber
// src/subscribers/wishlist-price-drop.ts
export default async function wishlistPriceDropHandler({ event, container }) {
  const productId = event.data.id
  const newPrice = event.data.price
  
  // Find all customers with this product in wishlist
  // Send price drop emails
}

export const config: SubscriberConfig = {
  event: "product.updated",
}
```

**Newsletter Signup**
```typescript
// 7. Newsletter signup component
// src/modules/layout/components/newsletter-signup/index.tsx
"use client"

export default function NewsletterSignup() {
  const handleSubmit = async (email: string) => {
    await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Enter your email" />
      <button>Subscribe</button>
    </form>
  )
}

// 8. API route for newsletter
// src/api/store/newsletter/subscribe/route.ts
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { email } = req.body
  
  // Add to email list (Resend, Mailchimp, etc.)
  // Send welcome email
  
  res.json({ success: true })
}
```

#### Technical Requirements
- **Dependencies**: 
  - `@react-email/components` (email templates)
  - `resend` or `@sendgrid/mail` (sending)
  - `@medusajs/notification` (Medusa integration)
- **Email Provider**: Resend, SendGrid, or AWS SES
- **Queue**: Redis for scheduling delayed emails

#### Time Estimate: 3-4 days
- Email templates: 1 day
- Email service: 0.5 day
- Subscribers: 1 day
- Newsletter signup: 0.5 day
- Testing: 1 day

---

## Phase 5: Technical Enhancements (2-3 weeks)

### 16. Performance Optimization
**Complexity**: 🟡 Moderate (5-7 days)

#### What It Does
- Image optimization (WebP, lazy loading)
- CDN for global content delivery
- Code splitting
- Progressive image loading
- Caching strategies
- Database query optimization

#### Implementation Steps

```typescript
// 1. Image Optimization
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['cdn.bijoucucoquettee.com'],
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
  },
}

// 2. Custom Image Loader (Cloudinary/Imgix)
// src/lib/image-loader.ts
export default function imageLoader({ src, width, quality }) {
  const params = [`w_${width}`, `q_${quality || 75}`, 'f_auto']
  return `https://cdn.bijoucucoquettee.com/${params.join(',')}/${src}`
}

// 3. Lazy Loading Component
// src/components/lazy-image.tsx
"use client"

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function LazyImage({ src, alt, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  return (
    <div className={`image-container ${isLoaded ? 'loaded' : 'loading'}`}>
      <Image
        src={src}
        alt={alt}
        onLoadingComplete={() => setIsLoaded(true)}
        loading="lazy"
        placeholder="blur"
        blurDataURL={getBlurDataURL(src)}
        {...props}
      />
    </div>
  )
}

// 4. Database Indexes
// Add migrations for frequently queried fields
// src/modules/[module]/migrations/[timestamp]-add-indexes.ts

// 5. Caching Strategy
// Use Next.js revalidation
export async function getProduct(id: string) {
  const res = await fetch(`${BACKEND_URL}/store/products/${id}`, {
    next: { 
      revalidate: 3600, // Cache for 1 hour
      tags: [`product:${id}`] 
    }
  })
  return res.json()
}

// 6. Code Splitting
// Use dynamic imports for heavy components
const VirtualTryOn = dynamic(
  () => import('@/modules/ar/components/virtual-try-on'),
  { ssr: false, loading: () => <Skeleton /> }
)

// 7. Optimize fonts
// src/app/layout.tsx
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

#### Time Estimate: 5-7 days
- Image optimization setup: 2 days
- Database optimization: 1 day
- Caching implementation: 1 day
- Code splitting: 1 day
- Testing & measurement: 1-2 days

---

### 17. SEO Optimization
**Complexity**: 🟡 Moderate (4-5 days)

#### Implementation Steps

```typescript
// 1. Schema Markup
// src/lib/schema.ts
export function getProductSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.thumbnail,
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "Bijou Coquettee"
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.avg_rating,
      reviewCount: product.review_count,
    }
  }
}

// 2. Add to product page
// src/app/[countryCode]/(main)/products/[id]/page.tsx
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id)
  const schema = getProductSchema(product)
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ProductTemplate product={product} />
    </>
  )
}

// 3. Sitemap
// src/app/sitemap.ts
export default async function sitemap() {
  const products = await getAllProducts()
  const collections = await getAllCollections()
  
  return [
    {
      url: 'https://bijoucucoquettee.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...products.map(product => ({
      url: `https://bijoucucoquettee.com/products/${product.id}`,
      lastModified: product.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...collections.map(collection => ({
      url: `https://bijoucucoquettee.com/collections/${collection.handle}`,
      lastModified: collection.updated_at,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ]
}

// 4. Robots.txt
// src/app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/'],
    },
    sitemap: 'https://bijoucucoquettee.com/sitemap.xml',
  }
}

// 5. Meta tags
// src/app/[countryCode]/(main)/products/[id]/page.tsx
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id)
  
  return {
    title: `${product.title} | Bijou Coquettee`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [product.thumbnail],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [product.thumbnail],
    },
  }
}
```

#### Time Estimate: 4-5 days
- Schema markup: 1 day
- Sitemap & robots: 1 day
- Meta tags: 1 day
- Testing & validation: 1-2 days

---

### 18. Analytics & Tracking
**Complexity**: 🟡 Moderate (3-4 days)

```typescript
// 1. Google Analytics 4
// src/lib/analytics/google-analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// Track e-commerce events
export const trackAddToCart = (product: Product, quantity: number) => {
  event({
    action: 'add_to_cart',
    category: 'ecommerce',
    label: product.title,
    value: product.price * quantity,
  })
}

// 2. Facebook Pixel
// 3. TikTok Pixel
// 4. Custom event tracking
```

#### Time Estimate: 3-4 days

---

## 🎯 Quick Start: What to Implement First

### Week 1-2: MVP Features (Highest Impact)
1. ✅ Enhanced product images with zoom
2. ✅ Size guide
3. ✅ Wishlist
4. ✅ Gift options

### Week 3-4: Trust Builders
5. ✅ Reviews with photos
6. ✅ Certificates display
7. ✅ Warranty options

### Week 5-8: Differentiation
8. ✅ Product customization
9. ✅ Virtual consultation
10. ✅ Instagram integration

---

## 💰 Budget Considerations

### Development Costs
- **In-house development**: 14-19 weeks × $X/hour
- **Outsourced development**: $50-150/hour depending on region
- **Total estimate**: $40,000-$80,000 for all features

### Ongoing Costs
- **CDN**: $20-200/month (Cloudinary, AWS)
- **Email service**: $10-200/month (Resend, SendGrid)
- **Video calls**: $50-200/month (Whereby, Zoom)
- **AR platform**: $0-500/month (Jeeliz, Zappar)
- **3D models**: $50-500 per product (one-time)

---

## 📈 Expected Results

### Conversion Rate Improvements
- Enhanced images: +15-25%
- Wishlist: +10-15%
- Reviews with photos: +18-35%
- Virtual try-on: +25-40%
- Product customization: +20-30%
- Gift options: +8-12%

### Average Order Value
- Customization: +15-25%
- Warranty/insurance: +8-12%
- Styling recommendations: +12-18%

### Return Rate Reduction
- Size guide: -15-25%
- Virtual try-on: -20-30%
- Enhanced imagery: -10-15%

---

## 🚀 Recommended Implementation Order

### Phase 1 (Foundation) - Start Here
1. Enhanced product images
2. Size guide
3. Jewelry-specific filters
4. Wishlist
5. Reviews with photos

**Why**: These provide immediate value and improve core shopping experience.

### Phase 2 (Conversion) - Next Priority
6. Product customization
7. Certificates
8. Gift options
9. Warranty options

**Why**: These build trust and enable premium pricing.

### Phase 3 (Differentiation) - Competitive Advantage
10. Virtual try-on (AR)
11. Virtual consultation
12. Instagram integration

**Why**: These set you apart from competitors.

### Phase 4 (Growth) - Scale
13. Education hub
14. Email marketing
15. Performance optimization
16. SEO

**Why**: These drive organic growth and retention.

---

## 🆘 Need Help?

If you want me to implement any of these features:

1. **Say which feature**: "Let's implement the wishlist feature"
2. **I'll create all the code**: Backend + Frontend + Database
3. **Test it together**: Make sure it works perfectly
4. **Move to next feature**: Repeat

We can work through these systematically, one by one, or tackle multiple features in parallel.

**Ready to start? Which feature should we build first?** 💎✨

