/**
 * Excel SKU Import Script
 * 
 * This script imports product data from the Fishstudio SKU LIST Excel file
 * and creates products in the database with auto-calculated pricing.
 * 
 * Usage:
 *   bun run scripts/import-sku-from-excel.ts
 * 
 * Environment variables required:
 *   MONGO_URL - MongoDB connection string
 *   BASE_PRICES_JSON - Optional JSON file with base prices per product
 */

import XLSX from 'xlsx';
import { prismaMongo as prisma } from '@repo/db-mongo';
import { 
  parseWeightRange, 
  generateSizePricingFromWeights,
  generateCuttingTypePricing,
  generatePieceSizePricing 
} from '../apps/product-service/src/controllers/product/weight-pricing.utils.js';

// Base prices per product (you need to fill this based on your pricing strategy)
const DEFAULT_BASE_PRICES: Record<string, number> = {
  // Freshwater Fish
  'Aar/Singhara': 500,
  'Boal/Malli/Buwari': 600,
  'Bhetki/Seabass': 700,
  'Bata': 450,
  'Bam': 400,
  'Bele': 350,
  'Katla': 400,
  'Rohu': 400,
  'Pangas/Indian Basa': 300,
  'Pabda': 550,
  'Koi': 500,
  'Mourala': 450,
  'Tengda': 350,
  'Tilapia': 300,
  'Roopchand': 600,
  'Ritha': 500,
  
  // Saltwater Fish
  'Bangda/Indian Mackerel': 350,
  'Pomfret': 900,
  'Surmai/King Fish/Seer': 800,
  'Tuna': 700,
  
  // Hilsa (premium)
  'Hilsa Bangladesh': 1500,
  
  // Salmon
  'Gurjali/Indian Salmon/Rawas': 800,
  
  // Prawns
  'Chapda/White Prawn': 700,
  'Tiger Prawn/Bagda': 800,
  'Scampi/Galda': 1200,
  
  // Crabs
  'Mud crab': 600,
  'Blue Crab': 500,
  
  // Others
  'Chitol': 650,
  'Eel/Kuchiya': 500,
  'Pomfret': 900,
  
  // Chicken
  'Chicken': 250,
  
  // Mutton
  'Mutton': 1200,
};

interface ParsedProduct {
  name: string;
  category: string;
  subCategory: string;
  description?: string;
  weights: string[];
  cutPreferences: string[];
  cutSizes: string[];
}

/**
 * Parse Excel file and return structured product data
 */
function parseExcelFile(filePath: string): ParsedProduct[] {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['Sheet1'];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

  const products: ParsedProduct[] = [];
  let currentProduct: ParsedProduct | null = null;

  for (const row of data as any[]) {
    // New product row
    if (row['Product Name']) {
      if (currentProduct) {
        products.push(currentProduct);
      }
      
      currentProduct = {
        name: row['Product Name'].trim(),
        category: row['category'] || 'freshwater',
        subCategory: row['SUB-Category'] || 'FISH',
        description: row['description '] || undefined,
        weights: [],
        cutPreferences: [],
        cutSizes: []
      };
    }

    // Add variants to current product
    if (currentProduct) {
      if (row['Weight'] && !currentProduct.weights.includes(row['Weight'])) {
        currentProduct.weights.push(row['Weight']);
      }
      if (row['Cut Preference'] && 
          row['Cut Preference'] !== 'NA' && 
          !currentProduct.cutPreferences.includes(row['Cut Preference'].trim())) {
        currentProduct.cutPreferences.push(row['Cut Preference'].trim());
      }
      if (row['Cut Size'] && 
          row['Cut Size'] !== 'N/A' && 
          row['Cut Size'] !== 'NA' &&
          !currentProduct.cutSizes.includes(row['Cut Size'])) {
        currentProduct.cutSizes.push(row['Cut Size']);
      }
    }
  }

  // Don't forget the last product
  if (currentProduct) {
    products.push(currentProduct);
  }

  return products;
}

/**
 * Generate slug from product name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Find base price for a product
 */
function findBasePrice(productName: string): number {
  // Try exact match
  if (DEFAULT_BASE_PRICES[productName]) {
    return DEFAULT_BASE_PRICES[productName];
  }

  // Try partial match
  for (const [key, price] of Object.entries(DEFAULT_BASE_PRICES)) {
    if (productName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(productName.toLowerCase().split('/')[0])) {
      return price;
    }
  }

  // Default fallback
  console.warn(`⚠️  No base price found for "${productName}", using default ₹400/kg`);
  return 400;
}

/**
 * Import products from Excel to database
 */
async function importProducts(filePath: string) {
  console.log('📦 Starting Excel SKU import...');
  console.log(`📄 Reading file: ${filePath}`);

  // Parse Excel
  const products = parseExcelFile(filePath);
  console.log(`✅ Parsed ${products.length} products from Excel`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    try {
      // Check if product already exists
      const existing = await prisma.products.findFirst({
        where: {
          title: {
            contains: product.name.split('/')[0].trim(),
            mode: 'insensitive'
          }
        }
      });

      if (existing) {
        console.log(`⏭️  Skipping "${product.name}" (already exists)`);
        skipped++;
        continue;
      }

      // Find base price
      const basePricePerKg = findBasePrice(product.name);

      // Clean up weights (remove duplicates and empty values)
      const uniqueWeights = [...new Set(product.weights.filter(w => w && w.trim()))];

      // Generate size pricing
      const sizePricing = generateSizePricingFromWeights(
        uniqueWeights,
        basePricePerKg,
        [],
        []
      );

      // Generate cutting type pricing
      const cuttingTypePricing = generateCuttingTypePricing(
        product.cutPreferences,
        [
          { type: 'Ring', premium: 20 },
          { type: 'Gada peti', premium: 15 },
          { type: 'Cleaned & Whole', premium: 0 },
          { type: 'Cut into piece', premium: 10 },
          { type: 'Curry Cut', premium: 15 },
        ]
      );

      // Generate piece size pricing
      const pieceSizePricing = generatePieceSizePricing(
        product.cutSizes,
        [
          { size: 'Small (40gm-60gm)', premium: 10 },
          { size: 'Small', premium: 10 },
          { size: 'Medium (60gm-80gm)', premium: 5 },
          { size: 'Medium', premium: 5 },
          { size: 'Large (80gm-100gm)', premium: 0 },
          { size: 'Large', premium: 0 },
        ]
      );

      // Create product
      const slug = generateSlug(product.name);
      const createdProduct = await prisma.products.create({
        data: {
          title: product.name,
          slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
          category: product.category,
          subCategory: product.subCategory,
          short_description: product.description || `${product.name} - Fresh ${product.category} ${product.subCategory.toLowerCase()}`,
          basePricePerKg,
          sizes: uniqueWeights,
          sizePricing,
          cuttingTypes: product.cutPreferences,
          cuttingTypePricing,
          pieceSizes: product.cutSizes,
          pieceSizePricing,
          stock: 100,
          sale_price: sizePricing[0]?.salePrice || basePricePerKg,
          regular_price: sizePricing[0]?.regularPrice || Math.round(basePricePerKg * 1.15),
          status: 'Active',
          isCatalog: true,
        }
      });

      console.log(`✅ Created "${product.name}" (Base: ₹${basePricePerKg}/kg, Variants: ${uniqueWeights.length})`);
      created++;

    } catch (error) {
      console.error(`❌ Error creating "${product.name}":`, error);
      errors++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📦 Total: ${products.length}`);
}

// Main execution
const excelFilePath = process.argv[2] || '/Users/macos/Downloads/Fishstudio SKU LIST.xlsx';

importProducts(excelFilePath)
  .then(() => {
    console.log('\n✨ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import failed:', error);
    process.exit(1);
  });
