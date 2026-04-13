# Weight-Based Pricing - Example Usage

## 📋 Table of Contents

1. [Backend Implementation](#backend-implementation)
2. [Frontend Integration](#frontend-integration)
3. [Excel Import](#excel-import)
4. [Product Creation Example](#product-creation-example)
5. [Price Calculation Examples](#price-calculation-examples)

---

## Backend Implementation

### 1. Update Product Controller

**File**: `/apps/product-service/src/controllers/product/product.controller.ts`

Add auto-price generation to your `createProduct` function:

```typescript
import { 
  generateSizePricingFromWeights,
  generateCuttingTypePricing,
  generatePieceSizePricing 
} from './weight-pricing.utils.js';

// Inside createProduct controller
export const createProduct = async (req: AuthRequest, res: Response) => {
  const {
    title,
    slug,
    category,
    subCategory,
    short_description,
    images,
    basePricePerKg,  // NEW
    weights,          // NEW: array of weight strings
    cuttingTypes,
    pieceSizes,
    stock,
    // ... other fields
  } = req.body;

  // Auto-generate size pricing from weights
  let sizePricing = req.body.sizePricing;
  if (weights && weights.length > 0 && basePricePerKg) {
    sizePricing = generateSizePricingFromWeights(
      weights,
      basePricePerKg,
      cuttingTypes?.map((type: string, i: number) => ({
        cuttingType: type,
        salePrice: Number(req.body.cuttingTypePricing?.[i]?.salePrice || 0),
        regularPrice: Number(req.body.cuttingTypePricing?.[i]?.regularPrice || 0),
      })) || [],
      pieceSizes?.map((size: string, i: number) => ({
        pieceSize: size,
        salePrice: Number(req.body.pieceSizePricing?.[i]?.salePrice || 0),
        regularPrice: Number(req.body.pieceSizePricing?.[i]?.regularPrice || 0),
      })) || []
    );
  }

  // Create product
  const product = await prisma.products.create({
    data: {
      title,
      slug,
      category,
      subCategory,
      short_description,
      images: { create: images },
      basePricePerKg,
      sizes: weights || [],
      sizePricing,
      cuttingTypes: cuttingTypes || [],
      cuttingTypePricing: req.body.cuttingTypePricing || [],
      pieceSizes: pieceSizes || [],
      pieceSizePricing: req.body.pieceSizePricing || [],
      stock,
      sale_price: sizePricing?.[0]?.salePrice || 0,
      regular_price: sizePricing?.[0]?.regularPrice || 0,
      status: 'Active',
      storeId: req.storeId,
    },
  });

  return res.status(201).json({
    success: true,
    product,
  });
};
```

### 2. Add New API Endpoint for Price Calculation

Add this endpoint to calculate price on-demand:

**File**: `/apps/product-service/src/routes/product.routes.ts`

```typescript
// Add this route
router.post('/api/calculate-price', 
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { productId, weight, cuttingType, pieceSize } = req.body;
    
    const product = await prisma.products.findUnique({
      where: { id: productId }
    });
    
    if (!product || !product.basePricePerKg) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or weight pricing not configured'
      });
    }
    
    const { calculateAutoPrice, parseWeightRange } = await import('./weight-pricing.utils.js');
    
    const weightRange = parseWeightRange(weight);
    const price = calculateAutoPrice({
      basePricePerKg: product.basePricePerKg,
      weightRange,
      cutType: cuttingType,
      cutPremiums: product.cuttingTypePricing || [],
      pieceSize,
      sizePremiums: product.pieceSizePricing || []
    });
    
    return res.json({
      success: true,
      price,
      weightRange
    });
  }
);
```

---

## Frontend Integration

### 1. Product Detail Page with Weight Selection

**File**: `/apps/user-ui/app/product/[slug]/product-detail-client.tsx`

```tsx
'use client';

import { useWeightBasedPrice, formatWeight } from '@/hooks/useWeightBasedPrice';
import type { Product } from '@repo/zod-schema';

export default function ProductDetailClient({ product }: { product: Product }) {
  const {
    selectedWeight,
    selectedCuttingType,
    selectedPieceSize,
    setSelectedWeight,
    setSelectedCuttingType,
    setSelectedPieceSize,
    price,
    weightOptions,
    cuttingTypeOptions,
    pieceSizeOptions,
    hasWeightPricing
  } = useWeightBasedPrice(product);

  return (
    <div className="product-detail">
      {/* Product Image */}
      <img src={product.image} alt={product.name} />

      {/* Product Info */}
      <h1>{product.name}</h1>
      <p className="description">{product.description}</p>

      {/* Dynamic Price Display */}
      <div className="price-container">
        <div className="price">
          <span className="sale-price">₹{price.salePrice}</span>
          {price.regularPrice > price.salePrice && (
            <span className="original-price">₹{price.regularPrice}</span>
          )}
          {price.discountPercent > 0 && (
            <span className="discount-badge">{price.discountPercent}% OFF</span>
          )}
        </div>
        {price.pricePerKg > 0 && (
          <p className="price-per-kg">₹{price.pricePerKg}/kg</p>
        )}
      </div>

      {/* Weight Selection */}
      {hasWeightPricing && weightOptions.length > 0 && (
        <div className="weight-selector">
          <h3>Select Weight</h3>
          <div className="weight-options">
            {weightOptions.map((option) => (
              <button
                key={option.label}
                className={`weight-btn ${selectedWeight === option.label ? 'active' : ''}`}
                onClick={() => setSelectedWeight(option.label)}
              >
                <span className="weight-label">{option.label}</span>
                <span className="weight-price">
                  ₹{Math.round(product.basePricePerKg! * option.avg / 1000)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cutting Type Selection */}
      {cuttingTypeOptions.length > 0 && (
        <div className="cutting-type-selector">
          <h3>Cutting Type</h3>
          <div className="cutting-options">
            {cuttingTypeOptions.map((cuttingType) => (
              <button
                key={cuttingType}
                className={`cutting-btn ${selectedCuttingType === cuttingType ? 'active' : ''}`}
                onClick={() => setSelectedCuttingType(cuttingType)}
              >
                {cuttingType}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Piece Size Selection */}
      {pieceSizeOptions.length > 0 && (
        <div className="piece-size-selector">
          <h3>Piece Size</h3>
          <div className="piece-size-options">
            {pieceSizeOptions.map((pieceSize) => (
              <button
                key={pieceSize}
                className={`size-btn ${selectedPieceSize === pieceSize ? 'active' : ''}`}
                onClick={() => setSelectedPieceSize(pieceSize)}
              >
                {pieceSize}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add to Cart */}
      <button
        className="add-to-cart-btn"
        onClick={() => {
          addToCart(product, 1, selectedCuttingType, selectedPieceSize, selectedWeight);
        }}
      >
        Add to Cart - ₹{price.salePrice}
      </button>

      {/* Price Breakdown */}
      {hasWeightPricing && (
        <div className="price-breakdown">
          <h4>Price Breakdown</h4>
          <p>{price.breakdown}</p>
        </div>
      )}
    </div>
  );
}
```

### 2. CSS for Weight Selector

**File**: `/apps/user-ui/app/product/[slug]/product-detail.css`

```css
.price-container {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.sale-price {
  font-size: 2rem;
  font-weight: bold;
  color: #2ecc71;
}

.original-price {
  font-size: 1.2rem;
  color: #95a5a6;
  text-decoration: line-through;
  margin-left: 10px;
}

.discount-badge {
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-left: 10px;
}

.price-per-kg {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 5px;
}

.weight-selector,
.cutting-type-selector,
.piece-size-selector {
  margin: 20px 0;
}

.weight-options,
.cutting-options,
.piece-size-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.weight-btn,
.cutting-btn,
.size-btn {
  padding: 10px 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.weight-btn:hover,
.cutting-btn:hover,
.size-btn:hover {
  border-color: #3498db;
}

.weight-btn.active,
.cutting-btn.active,
.size-btn.active {
  border-color: #3498db;
  background: #ebf5fb;
}

.weight-label {
  font-weight: 500;
  margin-bottom: 5px;
}

.weight-price {
  color: #2ecc71;
  font-weight: bold;
}

.add-to-cart-btn {
  width: 100%;
  padding: 15px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}

.add-to-cart-btn:hover {
  background: #27ae60;
}

.price-breakdown {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #7f8c8d;
}
```

### 3. Cart Integration

Update cart to show weight-based pricing:

**File**: `/apps/user-ui/components/cart/cart-item.tsx`

```tsx
import { useWeightBasedPrice } from '@/hooks/useWeightBasedPrice';

export function CartItem({ item }: { item: CartItem }) {
  const { price } = useWeightBasedPrice(item.product);
  
  return (
    <div className="cart-item">
      <img src={item.product.image} alt={item.product.name} />
      
      <div className="cart-item-details">
        <h4>{item.product.name}</h4>
        <div className="cart-item-options">
          <span>Weight: {item.size}</span>
          {item.cuttingType && <span>Cut: {item.cuttingType.name}</span>}
          {item.pieceSize && <span>Size: {item.pieceSize.name}</span>}
        </div>
        
        <div className="cart-item-price">
          <span className="unit-price">₹{price.salePrice} each</span>
          <span className="total-price">₹{price.salePrice * item.quantity}</span>
        </div>
      </div>
    </div>
  );
}
```

---

## Excel Import

### 1. Prepare Base Prices

Create a JSON file with base prices for all products:

**File**: `/scripts/base-prices.json`

```json
{
  "Aar/Singhara": 500,
  "Boal/Malli/Buwari": 600,
  "Bhetki/Seabass": 700,
  "Bata": 450,
  "Rohu": 400,
  "Katla": 400,
  "Pomfret": 900,
  "Surmai/King Fish/Seer": 800,
  "Hilsa Bangladesh": 1500,
  "Tiger Prawn/Bagda": 800,
  "Mud crab": 600,
  "Chicken": 250,
  "Mutton": 1200
}
```

### 2. Run Import Script

```bash
# From project root
bun run scripts/import-sku-from-excel.ts /Users/macos/Downloads/Fishstudio\ SKU\ LIST.xlsx
```

Expected output:
```
📦 Starting Excel SKU import...
📄 Reading file: /Users/macos/Downloads/Fishstudio SKU LIST.xlsx
✅ Parsed 51 products from Excel
✅ Created "Aar/Singhara" (Base: ₹500/kg, Variants: 1)
✅ Created "Boal/Malli/Buwari" (Base: ₹600/kg, Variants: 1)
...
📊 Import Summary:
   ✅ Created: 51
   ⏭️  Skipped: 0
   ❌ Errors: 0
   📦 Total: 51
✨ Import completed successfully!
```

---

## Product Creation Example

### Manual Product Creation via API

```typescript
// Create a product with weight-based pricing
const response = await fetch('/product/api/create-product', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Fresh Rohu Fish',
    slug: 'fresh-rohu-fish',
    category: 'freshwater',
    subCategory: 'FISH',
    short_description: 'Fresh Rohu fish, perfect for curry and fry',
    images: [{ url: 'https://example.com/rohu.jpg' }],
    
    // Weight-based pricing
    basePricePerKg: 400,
    weights: ['500g', '1kg', '1-2 kg', '2kg+'],
    
    // Optional: Custom pricing for specific weights
    // sizePricing: [
    //   { size: '500g', weightGrams: 500, salePrice: 200, regularPrice: 230 },
    //   { size: '1kg', weightGrams: 1000, salePrice: 400, regularPrice: 460 }
    // ],
    
    cuttingTypes: ['Whole', 'Ring', 'Curry Cut'],
    cuttingTypePricing: [
      { cuttingType: 'Whole', salePrice: 0, regularPrice: 0 },
      { cuttingType: 'Ring', salePrice: 20, regularPrice: 25 },
      { cuttingType: 'Curry Cut', salePrice: 15, regularPrice: 20 }
    ],
    
    pieceSizes: ['Small', 'Medium', 'Large'],
    pieceSizePricing: [
      { pieceSize: 'Small', salePrice: 10, regularPrice: 15 },
      { pieceSize: 'Medium', salePrice: 5, regularPrice: 10 },
      { pieceSize: 'Large', salePrice: 0, regularPrice: 0 }
    ],
    
    stock: 100,
    status: 'Active'
  })
});
```

### Seller UI Form Example

**File**: `/apps/seller-ui/src/app/(routes)/dashboard/create-product/page.tsx`

```tsx
'use client';

import { useState } from 'react';

export default function CreateProductPage() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subCategory: '',
    basePricePerKg: '',
    weights: [''],
    cuttingTypes: [''],
    pieceSizes: [''],
  });

  const handleAddWeight = () => {
    setFormData(prev => ({
      ...prev,
      weights: [...prev.weights, '']
    }));
  };

  const handleWeightChange = (index: number, value: string) => {
    const newWeights = [...formData.weights];
    newWeights[index] = value;
    setFormData(prev => ({ ...prev, weights: newWeights }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter empty weights
    const cleanedData = {
      ...formData,
      weights: formData.weights.filter(w => w.trim()),
      cuttingTypes: formData.cuttingTypes.filter(c => c.trim()),
      pieceSizes: formData.pieceSizes.filter(p => p.trim()),
    };
    
    const response = await fetch('/product/api/create-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedData)
    });
    
    if (response.ok) {
      // Redirect to product list
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create Product</h1>
      
      {/* Basic Info */}
      <input
        type="text"
        placeholder="Product Name"
        value={formData.title}
        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
        required
      />
      
      {/* Weight-Based Pricing */}
      <div className="pricing-section">
        <h3>Weight-Based Pricing</h3>
        
        <label>
          Base Price per Kg (₹)
          <input
            type="number"
            value={formData.basePricePerKg}
            onChange={e => setFormData(prev => ({ ...prev, basePricePerKg: e.target.value }))}
            placeholder="e.g., 400"
            required
          />
        </label>
        
        <label>
          Weight Ranges
          {formData.weights.map((weight, index) => (
            <div key={index} className="weight-input-group">
              <input
                type="text"
                value={weight}
                onChange={e => handleWeightChange(index, e.target.value)}
                placeholder="e.g., 1-2 kg, 500g, 6-10 PCS/KG"
              />
            </div>
          ))}
          <button type="button" onClick={handleAddWeight}>
            + Add Weight Range
          </button>
        </label>
        
        {/* Auto-calculated prices preview */}
        <div className="price-preview">
          <h4>Auto-Calculated Prices</h4>
          {formData.weights.filter(w => w).map((weight, i) => {
            const price = calculatePricePreview(formData.basePricePerKg, weight);
            return (
              <div key={i} className="price-row">
                <span>{weight}</span>
                <span>₹{price}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <button type="submit">Create Product</button>
    </form>
  );
}

function calculatePricePreview(basePricePerKg: string, weight: string): number {
  if (!basePricePerKg || !weight) return 0;
  
  const match = weight.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)?/);
  if (!match) return 0;
  
  const value = Number(match[1]);
  const unit = match[2] || 'g';
  const kg = unit === 'kg' ? value : value / 1000;
  
  return Math.round(Number(basePricePerKg) * kg);
}
```

---

## Price Calculation Examples

### Example 1: Simple Weight-Based Price

```typescript
// Product: Rohu Fish
// Base Price: ₹400/kg
// Weight: 1.5 kg (average of "1-2 kg")

const price = calculateAutoPrice({
  basePricePerKg: 400,
  weightRange: { min: 1000, max: 2000, avg: 1500 },
  cutPremiums: [],
  sizePremiums: []
});

// Result:
// salePrice: 600
// regularPrice: 690
// pricePerKg: 400
```

### Example 2: With Cutting Type Premium

```typescript
// Product: Rohu Fish
// Base Price: ₹400/kg
// Weight: 1 kg
// Cut: Ring (+₹20)

const price = calculateAutoPrice({
  basePricePerKg: 400,
  weightRange: { min: 1000, max: 1000, avg: 1000 },
  cutType: 'Ring',
  cutPremiums: [
    { cuttingType: 'Ring', salePrice: 20, regularPrice: 25 }
  ],
  sizePremiums: []
});

// Result:
// salePrice: 420  (400 + 20)
// regularPrice: 483
// breakdown: "Base: ₹400 + Cut: ₹20 + Size: ₹0"
```

### Example 3: Full Configuration

```typescript
// Product: Bhetki/Seabass
// Base Price: ₹700/kg
// Weight: 1.5 kg
// Cut: Ring (+₹20)
// Piece Size: Small (+₹10)

const price = calculateAutoPrice({
  basePricePerKg: 700,
  weightRange: { min: 1000, max: 2000, avg: 1500 },
  cutType: 'Ring',
  cutPremiums: [
    { cuttingType: 'Ring', salePrice: 20, regularPrice: 25 }
  ],
  pieceSize: 'Small',
  sizePremiums: [
    { pieceSize: 'Small', salePrice: 10, regularPrice: 15 }
  ]
});

// Calculation:
// Base: 700 × 1.5 = 1050
// Ring Cut: +20
// Small Pieces: +10
// ─────────────────
// Total: ₹1080

// Result:
// salePrice: 1080
// regularPrice: 1242
// pricePerKg: 720
```

### Example 4: Piece-Based Product (Prawns)

```typescript
// Product: Tiger Prawn 20-30 Count/KG
// Base Price: ₹800/kg
// Each piece: ~33g (1000/30 avg)
// Quantity: 10 pieces

const pricePerPiece = calculateAutoPrice({
  basePricePerKg: 800,
  weightRange: { min: 33, max: 50, avg: 40 }, // 1000/20 to 1000/30
  cutPremiums: [],
  sizePremiums: []
});

// Result per piece:
// salePrice: 32  (800 × 0.04)
// regularPrice: 37

// For 10 pieces: 32 × 10 = ₹320
```

---

## Testing

### Unit Tests for Weight Pricing

**File**: `/apps/product-service/src/controllers/product/weight-pricing.utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { parseWeightRange, calculateAutoPrice, generateSizePricingFromWeights } from './weight-pricing.utils';

describe('parseWeightRange', () => {
  it('should parse kg range', () => {
    const result = parseWeightRange('1-2 kg');
    expect(result).toEqual({
      min: 1000,
      max: 2000,
      avg: 1500,
      unit: 'grams'
    });
  });

  it('should parse grams', () => {
    const result = parseWeightRange('500g');
    expect(result).toEqual({
      min: 500,
      max: 500,
      avg: 500,
      unit: 'grams'
    });
  });

  it('should parse piece-based weight', () => {
    const result = parseWeightRange('6-10 PCS/KG');
    expect(result).toEqual({
      min: 100,
      max: 166,
      avg: 133,
      unit: 'pieces_per_kg'
    });
  });
});

describe('calculateAutoPrice', () => {
  it('should calculate base price', () => {
    const result = calculateAutoPrice({
      basePricePerKg: 400,
      weightRange: { min: 1000, max: 2000, avg: 1500 }
    });
    
    expect(result.salePrice).toBe(600);
    expect(result.regularPrice).toBe(690);
  });

  it('should add cutting premium', () => {
    const result = calculateAutoPrice({
      basePricePerKg: 400,
      weightRange: { min: 1000, max: 1000, avg: 1000 },
      cutType: 'Ring',
      cutPremiums: [
        { cuttingType: 'Ring', salePrice: 20, regularPrice: 25 }
      ]
    });
    
    expect(result.salePrice).toBe(420);
  });
});

describe('generateSizePricingFromWeights', () => {
  it('should generate pricing for all weights', () => {
    const result = generateSizePricingFromWeights(
      ['500g', '1kg', '1-2 kg'],
      400,
      [],
      []
    );
    
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      size: '500g',
      weightGrams: 500,
      salePrice: 200
    });
    expect(result[1]).toMatchObject({
      size: '1kg',
      weightGrams: 1000,
      salePrice: 400
    });
    expect(result[2]).toMatchObject({
      size: '1-2 kg',
      weightGrams: 1500,
      salePrice: 600
    });
  });
});
```

---

## Environment Variables

Add to your `.env` files:

```env
# Weight Pricing Configuration
DEFAULT_PROFIT_MARGIN=10
DEFAULT_REGULAR_PRICE_MARKUP=15
ENABLE_AUTO_PRICING=true

# Cutting Type Premiums (in ₹)
CUTTING_PREMIUM_RING=20
CUTTING_PREMIUM_GADA_PETI=15
CUTTING_PREMIUM_CURRY_CUT=15
CUTTING_PREMIUM_CLEANED_WHOLE=0

# Piece Size Premiums (in ₹)
PIECE_SIZE_PREMIUM_SMALL=10
PIECE_SIZE_PREMIUM_MEDIUM=5
PIECE_SIZE_PREMIUM_LARGE=0
```

---

## Troubleshooting

### Issue: Prices not calculating correctly

**Solution**: Check that:
1. `basePricePerKg` is set on the product
2. `sizes` array is not empty
3. `sizePricing` is generated or manually set

### Issue: Excel import fails

**Solution**:
1. Verify Excel file format is `.xlsx`
2. Check column names match exactly
3. Ensure all products have valid weight strings

### Issue: Frontend shows static price

**Solution**:
1. Verify product has `basePricePerKg` field
2. Check that `useWeightBasedPrice` hook is being used
3. Ensure product detail page is passing correct product object

---

## Next Steps

1. ✅ Run database migration: `npx prisma migrate dev`
2. ✅ Import products from Excel
3. ✅ Test price calculation on frontend
4. ✅ Add unit tests
5. ✅ Deploy to staging
6. ✅ Monitor pricing analytics

---

## Support Files Created

| File | Purpose |
|------|---------|
| `/WEIGHT_PRICING_GUIDE.md` | Main implementation guide |
| `/apps/product-service/src/controllers/product/weight-pricing.utils.ts` | Backend utilities |
| `/packages/zod-schema/src/schemas/weight-pricing.schema.ts` | Validation schemas |
| `/apps/user-ui/hooks/useWeightBasedPrice.ts` | Frontend hook |
| `/scripts/import-sku-from-excel.ts` | Excel import script |
| `/WEIGHT_PRICING_EXAMPLES.md` | This file |
