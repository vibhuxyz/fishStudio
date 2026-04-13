# Weight-Based Pricing Implementation Guide

## 📊 Overview

This guide explains how to implement **weight-based auto-calculation pricing** for your FishStudio seafood e-commerce platform, based on the SKU list from your Excel file (`Fishstudio SKU LIST.xlsx`).

### Current System Architecture

Your system already has a **robust pricing infrastructure**:
- ✅ `sizePricing` - Price per weight/size variant (e.g., 500g, 1kg)
- ✅ `cuttingTypePricing` - Price modifiers for cutting preferences (Ring, Gada peti, Cleaned & Whole)
- ✅ `pieceSizePricing` - Price modifiers for piece sizes (Small, Medium, Large)

**The missing piece**: Auto-calculating prices based on weight ranges from your SKU list.

---

## 🎯 SKU Data Structure Analysis

From your Excel file, I found:
- **51 unique products** (Aar/Singhara, Boal/Malli, Bhetki/Seabass, etc.)
- **20 unique weight ranges** (1-2 kg, 6-10 PCS/KG, 500g, 1kg, etc.)
- **24 cut preferences** (Ring, Gada peti, Cleaned & Whole, etc.)
- **12 cut sizes** (Small 40-60gm, Medium 60-80gm, Large 80-100gm)

### Example Product Variant Structure:
```
Product: Aar/Singhara
Weight: 1-2 kg
Cut Preferences: Ring, Gada peti, (blank for Large)
Cut Sizes: Small (40-60gm), Medium (60-80gm), Large (80-100gm)
Category: freshwater
Sub-Category: FISH
```

---

## 🏗️ Implementation Strategy

### Phase 1: Define Base Price Per Weight Unit

**Concept**: Set a **base price per kg** for each product, then auto-calculate prices for different weights.

#### Formula:
```
Price = (Base Price per kg × Weight in kg) + Cutting Premium + Piece Size Premium

Where:
- Base Price per kg: Product-specific (e.g., ₹400/kg for Rohu)
- Weight in kg: Actual weight or average of range
- Cutting Premium: Additional cost for cutting type (e.g., +₹20 for Ring cut)
- Piece Size Premium: Additional cost for smaller pieces (e.g., +₹10 for Small)
```

#### Example Calculation:
```
Product: Rohu
Base Price: ₹400/kg
Weight: 1-2 kg (average: 1.5 kg)
Cut: Ring (+₹20)
Piece Size: Small (+₹10)

Final Price = (400 × 1.5) + 20 + 10 = ₹630
```

---

### Phase 2: Database Schema Enhancement

#### Option A: Add Base Price Fields to Product Model

**File**: `/packages/db-mongo/prisma/schema.prisma`

```prisma
model products {
  // ... existing fields ...
  
  // NEW: Base pricing configuration
  basePricePerKg      Float?                // Base price per kilogram
  basePricePerUnit    Float?                // For piece-based products (e.g., prawns per count)
  weightPricingRule   Json?                 // { type: "per_kg" | "per_piece" | "fixed", formula: {...} }
  
  // EXISTING (keep as-is)
  sizes               String[]
  sizePricing         Json?
  cuttingTypes        String[]
  cuttingTypePricing  Json?
  pieceSizes          String[]
  pieceSizePricing    Json?
  
  // ... rest of fields ...
}
```

#### Option B: Create Separate Weight Pricing Config Model

```prisma
model weight_pricing_config {
  id              String  @id @default(auto()) @map("_id") @db.ObjectId
  productId       String  @db.ObjectId
  product         products @relation(fields: [productId], references: [id])
  
  basePricePerKg  Float
  weightRanges    Json[]  // [{ min: 1, max: 2, pricePerKg: 400 }, ...]
  cutPremiums     Json[]  // [{ type: "Ring", premium: 20 }, ...]
  sizePremiums    Json[]  // [{ size: "Small", premium: 10 }, ...]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([productId])
}
```

**Recommendation**: Use **Option A** for simplicity - add fields to existing `products` model.

---

### Phase 3: Auto-Calculation Logic

#### Step 1: Weight Parsing Utility

**File**: `/apps/product-service/src/controllers/product/utils.ts`

```typescript
/**
 * Parses weight string to min/max grams
 * Examples:
 * - "1-2 kg" → { min: 1000, max: 2000, avg: 1500 }
 * - "500g" → { min: 500, max: 500, avg: 500 }
 * - "6-10 PCS/KG" → { min: 100, max: 166, avg: 133 } (1000/6 to 1000/10)
 */
export const parseWeightRange = (weightStr: string): { 
  min: number; 
  max: number; 
  avg: number; 
  unit: 'grams' | 'pieces_per_kg' 
} => {
  const normalized = weightStr.toLowerCase().trim();
  
  // Piece-based: "6-10 PCS/KG"
  const pieceMatch = normalized.match(/(\d+)\s*[-–]\s*(\d+)\s*(pcs|count)/);
  if (pieceMatch) {
    const minCount = Number(pieceMatch[1]);
    const maxCount = Number(pieceMatch[2]);
    return {
      min: Math.round(1000 / maxCount), // 1000/10 = 100g per piece
      max: Math.round(1000 / minCount), // 1000/6 = 166g per piece
      avg: Math.round((1000 / maxCount + 1000 / minCount) / 2),
      unit: 'pieces_per_kg'
    };
  }
  
  // Range: "1-2 kg" or "500-700 gm"
  const rangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(kg|g|gm)?/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    const unit = rangeMatch[3] || 'g';
    const multiplier = unit === 'kg' ? 1000 : 1;
    return {
      min: Math.round(min * multiplier),
      max: Math.round(max * multiplier),
      avg: Math.round((min + max) / 2 * multiplier),
      unit: 'grams'
    };
  }
  
  // Single value: "1 Kg" or "500g"
  const singleMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)?/);
  if (singleMatch) {
    const value = Number(singleMatch[1]);
    const unit = singleMatch[2] || 'g';
    const multiplier = unit === 'kg' ? 1000 : 1;
    const grams = Math.round(value * multiplier);
    return { min: grams, max: grams, avg: grams, unit: 'grams' };
  }
  
  return { min: 0, max: 0, avg: 0, unit: 'grams' };
};
```

#### Step 2: Auto-Price Calculator

**File**: `/apps/product-service/src/controllers/product/utils.ts`

```typescript
interface AutoPriceConfig {
  basePricePerKg: number;
  weightRange: { min: number; max: number; avg: number };
  cutType?: string;
  cutPremiums: Array<{ type: string; premium: number }>;
  pieceSize?: string;
  sizePremiums: Array<{ size: string; premium: number }>;
  margin?: number; // Profit margin percentage
}

/**
 * Auto-calculate price based on weight, cut type, and piece size
 */
export const calculateAutoPrice = (config: AutoPriceConfig): {
  salePrice: number;
  regularPrice: number;
  breakdown: string;
} => {
  const {
    basePricePerKg,
    weightRange,
    cutType,
    cutPremiums = [],
    pieceSize,
    sizePremiums = [],
    margin = 0
  } = config;
  
  // Base price for this weight
  const weightInKg = weightRange.avg / 1000;
  let basePrice = basePricePerKg * weightInKg;
  
  // Add cut type premium
  let cutPremium = 0;
  if (cutType) {
    const cutEntry = cutPremiums.find(c => c.type.toLowerCase() === cutType.toLowerCase());
    cutPremium = cutEntry?.premium || 0;
  }
  
  // Add piece size premium
  let sizePremium = 0;
  if (pieceSize) {
    const sizeEntry = sizePremiums.find(s => s.size.toLowerCase() === pieceSize.toLowerCase());
    sizePremium = sizeEntry?.premium || 0;
  }
  
  // Calculate final price
  let salePrice = basePrice + cutPremium + sizePremium;
  
  // Apply margin if specified
  if (margin > 0) {
    salePrice = salePrice * (1 + margin / 100);
  }
  
  // Regular price (MSRP) - typically 10-20% higher
  const regularPrice = Math.round(salePrice * 1.15);
  salePrice = Math.round(salePrice);
  
  return {
    salePrice,
    regularPrice,
    breakdown: `Base: ₹${basePrice.toFixed(0)} + Cut: ₹${cutPremium} + Size: ₹${sizePremium}`
  };
};
```

#### Step 3: Auto-Generate Size Pricing Array

**File**: `/apps/product-service/src/controllers/product/utils.ts`

```typescript
/**
 * Auto-generate sizePricing array from weight ranges
 */
export const generateSizePricingFromWeights = (
  weights: string[],
  basePricePerKg: number,
  cutPremiums: Array<{ type: string; premium: number }>,
  sizePremiums: Array<{ size: string; premium: number }>
): Array<{
  size: string;
  weightGrams: number;
  salePrice: number;
  regularPrice: number;
}> => {
  return weights.map(weight => {
    const weightRange = parseWeightRange(weight);
    const pricing = calculateAutoPrice({
      basePricePerKg,
      weightRange,
      cutPremiums,
      sizePremiums
    });
    
    return {
      size: weight,
      weightGrams: weightRange.avg,
      salePrice: pricing.salePrice,
      regularPrice: pricing.regularPrice
    };
  });
};
```

---

### Phase 4: Product Creation/Update Flow

#### Modified Product Controller

**File**: `/apps/product-service/src/controllers/product/product.controller.ts`

Add this logic to the `createProduct` function:

```typescript
// Inside createProduct controller, after validation

const { 
  title, 
  basePricePerKg,  // NEW
  weights,          // NEW: from Excel SKU list
  cuttingTypes, 
  pieceSizes,
  // ... other fields
} = req.body;

// Auto-generate size pricing if weights provided
let sizePricing = req.body.sizePricing;
if (weights && weights.length > 0 && basePricePerKg) {
  sizePricing = generateSizePricingFromWeights(
    weights,
    basePricePerKg,
    cuttingTypePricing || [],
    pieceSizePricing || []
  );
}

// Create product
const product = await prisma.products.create({
  data: {
    // ... existing fields
    basePricePerKg,  // NEW
    sizes: weights,   // Use weights as sizes
    sizePricing,      // Auto-calculated
    // ... rest
  }
});
```

---

### Phase 5: Frontend Integration

#### Step 1: Update Product Adapter

**File**: `/apps/user-ui/lib/storefront.ts`

```typescript
// Add to transformProduct function
export const transformProduct = (bp: BackendProduct): Product => {
  // ... existing code ...
  
  return {
    // ... existing fields
    basePricePerKg: bp.basePricePerKg,  // NEW
    weightRanges: bp.sizes?.map(s => ({
      label: s,
      ...parseWeightRange(s)
    })) || [],  // NEW
    // ... rest
  };
};
```

#### Step 2: Dynamic Price Display on Product Page

**File**: `/apps/user-ui/app/product/[slug]/product-detail-client.tsx`

```typescript
// When user selects weight/size, auto-calculate price
const selectedWeight = "1-2 kg";
const selectedCut = "Ring";
const selectedPieceSize = "Small";

// Auto-calculate on selection change
const calculatedPrice = useMemo(() => {
  if (!product.basePricePerKg || !selectedWeight) return product.price;
  
  const weightRange = parseWeightRange(selectedWeight);
  return calculateAutoPrice({
    basePricePerKg: product.basePricePerKg,
    weightRange,
    cutType: selectedCut,
    cutPremiums: product.cuttingTypePricing || [],
    pieceSize: selectedPieceSize,
    sizePremiums: product.pieceSizePricing || []
  });
}, [product, selectedWeight, selectedCut, selectedPieceSize]);

// Display in UI
<div className="price">
  ₹{calculatedPrice.salePrice}
  {calculatedPrice.regularPrice > calculatedPrice.salePrice && (
    <span className="original-price">₹{calculatedPrice.regularPrice}</span>
  )}
</div>
```

---

### Phase 6: Bulk Import from Excel

#### Import Script

**File**: `/scripts/import-sku-from-excel.ts`

```typescript
import XLSX from 'xlsx';
import { prismaMongo as prisma } from '@repo/db-mongo';

// Read Excel file
const workbook = XLSX.readFile('Fishstudio SKU LIST.xlsx');
const sheet = workbook.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(sheet);

// Process products
const products = [];
let currentProduct: any = null;

data.forEach((row: any) => {
  if (row['Product Name']) {
    currentProduct = {
      name: row['Product Name'].trim(),
      weights: [],
      cutPreferences: [],
      cutSizes: [],
      category: row['category'],
      subCategory: row['SUB-Category']
    };
    products.push(currentProduct);
  }
  
  if (currentProduct) {
    if (row['Weight'] && !currentProduct.weights.includes(row['Weight'])) {
      currentProduct.weights.push(row['Weight']);
    }
    if (row['Cut Preference'] && !currentProduct.cutPreferences.includes(row['Cut Preference'])) {
      currentProduct.cutPreferences.push(row['Cut Preference']);
    }
    if (row['Cut Size'] && row['Cut Size'] !== 'N/A' && !currentProduct.cutSizes.includes(row['Cut Size'])) {
      currentProduct.cutSizes.push(row['Cut Size']);
    }
  }
});

// Create products in database
for (const product of products) {
  // You need to define base prices per product (manual step or from another data source)
  const basePricePerKg = getProductBasePrice(product.name); // Define this function
  
  await prisma.products.create({
    data: {
      title: product.name,
      slug: generateSlug(product.name),
      category: product.category,
      subCategory: product.subCategory,
      basePricePerKg,
      sizes: product.weights,
      cuttingTypes: product.cutPreferences,
      pieceSizes: product.cutSizes,
      // Auto-generate pricing
      sizePricing: generateSizePricingFromWeights(
        product.weights,
        basePricePerKg,
        [],
        []
      ),
      stock: 100, // Default stock
      status: 'Active'
    }
  });
}

console.log(`Imported ${products.length} products`);
```

---

## 💰 Pricing Formula Examples

### Example 1: Freshwater Fish (Rohu)

```json
{
  "product": "Rohu",
  "basePricePerKg": 400,
  "sizes": ["500g", "1kg", "1-2 kg"],
  "sizePricing": [
    { "size": "500g", "weightGrams": 500, "salePrice": 200, "regularPrice": 230 },
    { "size": "1kg", "weightGrams": 1000, "salePrice": 400, "regularPrice": 460 },
    { "size": "1-2 kg", "weightGrams": 1500, "salePrice": 600, "regularPrice": 690 }
  ],
  "cuttingTypes": ["Whole", "Ring", "Curry Cut"],
  "cuttingTypePricing": [
    { "cuttingType": "Whole", "salePrice": 0, "regularPrice": 0 },
    { "cuttingType": "Ring", "salePrice": 20, "regularPrice": 25 },
    { "cuttingType": "Curry Cut", "salePrice": 15, "regularPrice": 20 }
  ],
  "pieceSizes": ["Small", "Medium", "Large"],
  "pieceSizePricing": [
    { "pieceSize": "Small", "salePrice": 10, "regularPrice": 15 },
    { "pieceSize": "Medium", "salePrice": 5, "regularPrice": 10 },
    { "pieceSize": "Large", "salePrice": 0, "regularPrice": 0 }
  ]
}
```

**Price Calculation for 1.5kg Rohu, Ring Cut, Small Pieces**:
```
Base: ₹400/kg × 1.5kg = ₹600
Ring Cut Premium: +₹20
Small Piece Premium: +₹10
────────────────────────────
Final Price: ₹630
```

---

### Example 2: Prawn (Piece-Based Pricing)

```json
{
  "product": "Tiger Prawn/Bagda Medium",
  "basePricePerKg": 800,
  "sizes": ["30-50 Count/KG", "20-30 Count/KG"],
  "sizePricing": [
    { "size": "30-50 Count/KG", "weightGrams": 25, "salePrice": 20, "regularPrice": 25 },
    { "size": "20-30 Count/KG", "weightGrams": 40, "salePrice": 32, "regularPrice": 38 }
  ]
}
```

**Price Calculation for 20-30 Count/KG Prawn (40g per piece)**:
```
Base: ₹800/kg × 0.04kg = ₹32
Final Price: ₹32 per piece
```

---

## 📝 Implementation Checklist

- [ ] **1. Database Schema Update**
  - [ ] Add `basePricePerKg` field to `products` model
  - [ ] Run Prisma migration: `npx prisma migrate dev`

- [ ] **2. Backend Utilities**
  - [ ] Add `parseWeightRange()` to utils.ts
  - [ ] Add `calculateAutoPrice()` to utils.ts
  - [ ] Add `generateSizePricingFromWeights()` to utils.ts

- [ ] **3. Product Controller Updates**
  - [ ] Update `createProduct` to accept `basePricePerKg` and `weights`
  - [ ] Update `updateProduct` to recalculate prices on weight changes
  - [ ] Add validation for base price fields

- [ ] **4. Excel Import Script**
  - [ ] Create `/scripts/import-sku-from-excel.ts`
  - [ ] Define base prices for all 51 products
  - [ ] Run import script

- [ ] **5. Frontend Updates**
  - [ ] Update product adapter to include `basePricePerKg`
  - [ ] Add dynamic price calculation on product detail page
  - [ ] Display weight range selector with prices
  - [ ] Update cart to show price breakdown

- [ ] **6. Seller/Admin UI**
  - [ ] Add base price input field in product creation form
  - [ ] Show auto-calculated prices preview
  - [ ] Add bulk price update tool

- [ ] **7. Testing**
  - [ ] Test price calculation for all product types
  - [ ] Test cart with weight-based pricing
  - [ ] Test checkout with price validation

---

## 🚀 Quick Start Implementation

### Step 1: Add Base Price Field

**File**: `/packages/db-mongo/prisma/schema.prisma`

```prisma
model products {
  // ... existing fields ...
  basePricePerKg Float? @default(0)
  // ... rest ...
}
```

Run migration:
```bash
cd packages/db-mongo
npx prisma migrate dev --name add-base-price-per-kg
```

### Step 2: Add Auto-Calculation Utilities

Create `/apps/product-service/src/controllers/product/weight-pricing.utils.ts`:

```typescript
export { parseWeightRange, calculateAutoPrice, generateSizePricingFromWeights } from './utils.js';
```

### Step 3: Update Product Creation

In the product controller, add auto-price generation when creating products with weights.

### Step 4: Frontend Price Display

Update product detail page to show dynamic pricing based on selected weight.

---

## 🔧 Advanced Features (Future Enhancements)

1. **Dynamic Pricing by Demand**: Adjust prices based on inventory levels and demand
2. **Seasonal Pricing**: Automatic price changes for seasonal products (Hilsa, Pomfret)
3. **Location-Based Pricing**: Different prices for different cities/pincodes
4. **Bulk Discounts**: Lower per-kg price for larger quantities
5. **Weight Tolerance**: Allow ±5% weight variation in final billing

---

## 📚 Reference Files

- Excel SKU List: `/Users/macos/Downloads/Fishstudio SKU LIST.xlsx`
- Product Schema: `/packages/db-mongo/prisma/schema.prisma`
- Product Controller: `/apps/product-service/src/controllers/product/product.controller.ts`
- Pricing Utils: `/apps/product-service/src/controllers/product/utils.ts`
- Frontend Adapter: `/apps/user-ui/lib/storefront.ts`
- Cart Store: `/apps/user-ui/lib/cart-store.ts`
- Zod Schemas: `/packages/zod-schema/src/schemas/product.schema.ts`

---

## ❓ FAQ

**Q: How do I set the base price per kg for each product?**  
A: You can either:
1. Manually enter prices when creating products in Seller/Admin UI
2. Import from a separate price list CSV
3. Use a market price API to auto-fetch current market rates

**Q: What if weight is not a range but a fixed value?**  
A: The `parseWeightRange()` function handles both ranges ("1-2 kg") and fixed values ("500g"). It returns min=max=avg for fixed values.

**Q: How do I handle piece-based products (e.g., 6-10 PCS/KG)?**  
A: The formula converts piece count to weight per piece: `1000g / count`. For "6-10 PCS/KG", each piece weighs 100-166g (avg: 133g).

**Q: Can I have different prices for different sellers?**  
A: Yes! Each seller adds the catalog product to their store with custom `sizePricing`. The base price is just for auto-calculation.

---

## 📞 Support

For questions or issues during implementation, refer to:
- Project README: `/README.md`
- Bug documentation: `/BUG.MD`
- Docker setup: `/docker-compose.yml`
