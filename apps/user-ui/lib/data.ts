import type { Product, SiteConfig, CategoryKey, SubCategoryDef } from "./types";

/**
 * Data hierarchy:
 *   Category (e.g. "Fresh Water")
 *     -> SubCategory (e.g. "Rui/Rohu")
 *       -> Product variants (e.g. "Bengali Rui", "Large Rui", "Premium Rui")
 */
export const siteConfig: SiteConfig = {
  categories: [
    "Fresh Water",
    "Sea Fish",
    "Premium Sea Food",
    "Meat & Poultry",
    "Fry Ready",
    "Moms Magic",
    "Rice & Spice",
    "Pet Serve",
  ],
  subCategories: {
    freshWater: [
      {
        name: "Rui/Rohu",
        products: ["Bengali Rui", "Large Rui", "Premium Rui", "Small Rui"],
      },
      {
        name: "Katla/Catla",
        products: ["Bengali Katla", "Jumbo Katla", "Medium Katla"],
      },
      {
        name: "Hilsa",
        products: ["Padma Hilsa", "Ganga Hilsa", "Mini Hilsa"],
      },
      {
        name: "Aar/Singhara",
        products: ["Aar Fish", "Singhara Fish", "Premium Aar"],
      },
      {
        name: "Pabda",
        products: ["Desi Pabda", "Farm Pabda", "River Pabda"],
      },
      {
        name: "Tilapia",
        products: ["Regular Tilapia", "Red Tilapia", "Jumbo Tilapia"],
      },
    ],
    seaFish: [
      {
        name: "Pomfret",
        products: ["White Pomfret", "Black Pomfret", "Silver Pomfret"],
      },
      {
        name: "Mackerel",
        products: ["Indian Mackerel", "King Mackerel", "Spanish Mackerel"],
      },
      {
        name: "Sardine",
        products: ["Indian Oil Sardine", "White Sardine"],
      },
      {
        name: "Prawn",
        products: ["Tiger Prawn", "White Prawn", "Brown Prawn", "Jumbo Prawn"],
      },
      {
        name: "Crab",
        products: ["Mud Crab", "Blue Swimmer Crab", "Flower Crab"],
      },
      {
        name: "Squid",
        products: ["Indian Squid", "Loligo Squid", "Baby Squid"],
      },
      {
        name: "Anchovy",
        products: ["Dry Anchovy", "Fresh Anchovy"],
      },
    ],
    premiumSeaFood: [
      {
        name: "Premium Prawns",
        products: ["Jumbo Tiger Prawns", "Scampi Prawns", "Giant River Prawns"],
      },
      {
        name: "King Crab",
        products: ["Alaskan King Crab", "Red King Crab", "Blue King Crab"],
      },
      {
        name: "Lobster",
        products: ["Rock Lobster", "Tiger Lobster", "Spiny Lobster", "Slipper Lobster"],
      },
      {
        name: "Premium Fish Selection",
        products: ["Bhetki/Barramundi", "Sole Fish", "Sea Bass"],
      },
      {
        name: "Sea Urchin",
        products: ["Purple Sea Urchin", "Green Sea Urchin"],
      },
      {
        name: "Scallops",
        products: ["Bay Scallops", "Sea Scallops", "Queen Scallops"],
      },
    ],
    meatPoultry: [
      {
        name: "Chicken - Whole",
        products: ["Country Chicken", "Broiler Chicken", "Free Range Chicken"],
      },
      {
        name: "Chicken - Pieces",
        products: ["Chicken Breast", "Chicken Leg", "Chicken Wings", "Chicken Drumstick"],
      },
      {
        name: "Mutton",
        products: ["Goat Mutton", "Mutton Keema", "Mutton Chops", "Bone-in Mutton"],
      },
      {
        name: "Lamb",
        products: ["Lamb Chops", "Lamb Shank", "Boneless Lamb"],
      },
      {
        name: "Goat",
        products: ["Goat Leg", "Goat Ribs", "Goat Brain"],
      },
      {
        name: "Beef",
        products: ["Beef Steak Cut", "Beef Mince", "Beef Brisket"],
      },
      {
        name: "Pork",
        products: ["Pork Belly", "Pork Ribs", "Pork Sausage"],
      },
    ],
    fryReady: [
      {
        name: "Fish Fry Mix",
        products: ["Rohu Fry Ready", "Pomfret Fry Ready", "Tilapia Fry Ready"],
      },
      {
        name: "Prawn Fry Mix",
        products: ["Prawn Koliwada", "Prawn Rava Fry", "Butter Garlic Prawn"],
      },
      {
        name: "Chicken Fry Mix",
        products: ["Chicken 65 Mix", "Chicken Lollipop", "Chicken Popcorn"],
      },
      {
        name: "Fish Fingers",
        products: ["Classic Fish Fingers", "Spicy Fish Fingers", "Cheesy Fish Fingers"],
      },
      {
        name: "Shrimp Cutlets",
        products: ["Shrimp Patty", "Shrimp Croquette"],
      },
    ],
    momsMagic: [
      {
        name: "Fish Curry Mix",
        products: ["Bengali Fish Curry Kit", "Goan Fish Curry Kit", "Kerala Fish Curry Kit"],
      },
      {
        name: "Fish Tandoori Mix",
        products: ["Tandoori Fish Pack", "Tikka Fish Pack"],
      },
      {
        name: "Prawn Biryani Kit",
        products: ["Prawn Biryani Pack", "Prawn Pulao Pack"],
      },
      {
        name: "Fish Masala",
        products: ["Fish Masala Dry", "Fish Masala Wet", "Fish Pickle"],
      },
      {
        name: "Ready to Cook Fish",
        products: ["Marinated Rohu", "Marinated Pomfret", "Marinated Hilsa"],
      },
    ],
    riceSpice: [
      {
        name: "Basmati Rice",
        products: ["Premium Basmati 1 Kg", "Premium Basmati 5 Kg", "Aged Basmati"],
      },
      {
        name: "Biryani Rice",
        products: ["Biryani Special Rice", "Sella Rice"],
      },
      {
        name: "Fish Masala Powder",
        products: ["Fish Fry Masala", "Fish Curry Masala", "Tandoori Masala"],
      },
      {
        name: "Fry Masala",
        products: ["All Purpose Fry Mix", "Rava Fry Mix"],
      },
      {
        name: "Curry Powder",
        products: ["Turmeric Powder", "Red Chili Powder", "Coriander Powder"],
      },
      {
        name: "Spice Blends",
        products: ["Garam Masala", "Panch Phoron", "Chat Masala"],
      },
    ],
    petServe: [
      {
        name: "Fish for Pets",
        products: ["Cat Fish Pack", "Dog Fish Pack", "Mixed Pet Fish"],
      },
      {
        name: "Chicken Offal",
        products: ["Chicken Liver Pack", "Chicken Gizzard Pack"],
      },
      {
        name: "Nutritional Mix",
        products: ["Bone Meal Pack", "Fish Oil Supplement"],
      },
      {
        name: "Pet Fish Selection",
        products: ["Small Fish Pack", "Dry Fish Pack"],
      },
    ],
  },
  sizes: {
    "Rui/Rohu": ["< 500 gm", "500 gm - 1 Kg", "1 Kg - 2 Kg", "2 Kg - 3 Kg", "> 3 Kg"],
    "Katla/Catla": ["< 500 gm", "500 gm - 1 Kg", "1 Kg - 2 Kg", "2 Kg - 3 Kg", "> 3 Kg"],
    Hilsa: ["< 500 gm", "500 gm - 1 Kg", "1 Kg - 1.5 Kg", "> 1.5 Kg"],
    Tilapia: ["< 500 gm", "500 gm - 1 Kg"],
    "Aar/Singhara": ["< 500 gm", "500 gm - 1 Kg", "1 Kg - 2 Kg", "> 2 Kg"],
    Pabda: ["< 250 gm", "250 gm - 500 gm", "500 gm - 1 Kg"],
    Pomfret: ["< 500 gm", "500 gm - 1 Kg", "> 1 Kg"],
    default: ["< 500 gm", "500 gm - 1 Kg", "1 Kg - 2 Kg", "> 2 Kg"],
  },
  cuttingTypes: [
    { id: "whole", name: "Whole Fish", description: "Complete fish, cleaned and ready to cook", icon: "fish" },
    { id: "gutted", name: "Gutted (Whole-Cut in Pieces)", description: "Fish cut into pieces, cleaned and gutted", icon: "scissors" },
    { id: "fillet", name: "Fillet", description: "Boneless pieces from both sides of fish", icon: "knife" },
    { id: "steaks", name: "Steaks/Cross Cut", description: "Cross-sectional cuts of fish", icon: "beef" },
    { id: "minced", name: "Minced/Ground", description: "Fish ground into fine pieces", icon: "cog" },
    { id: "gadaPeti", name: "Gada Peti", description: "Central body portion (premium cut)", icon: "package" },
  ],
  pieceSizes: [
    { id: "extra_small", name: "Extra Small", range: "20-40 gm", description: "Very small pieces, ideal for frying or appetizers", useCase: "Fry, Appetizers" },
    { id: "small", name: "Small", range: "40-60 gm", description: "Small pieces, good for various cooking methods", useCase: "Fry, Curry, Grill" },
    { id: "medium", name: "Medium", range: "60-80 gm", description: "Medium-sized pieces, versatile for most dishes", useCase: "Curry, Tandoori, Grill, Fry" },
    { id: "large", name: "Large", range: "80-100 gm", description: "Large pieces, ideal for substantial portions", useCase: "Tandoori, Grill, Curry" },
    { id: "extra_large", name: "Extra Large", range: "> 100 gm", description: "Extra large pieces for premium presentation", useCase: "Special Occasions, Premium Dishes" },
  ],
  processingWeightLoss: {
    whole: 0,
    gutted: { min: 15, max: 25, description: "Weight loss from gutting, cleaning and removing head/tail" },
    fillet: { min: 35, max: 45, description: "Weight loss from removing bones, skin and waste" },
    steaks: { min: 10, max: 15, description: "Weight loss from cross-cutting and trimming" },
    minced: { min: 20, max: 30, description: "Weight loss from grinding and moisture release" },
    head: 0,
    default: { min: 5, max: 10, description: "Standard processing weight loss" },
  },
};

// Map category names to keys
export const categoryKeyMap: Record<string, CategoryKey> = {
  "Fresh Water": "freshWater",
  "Sea Fish": "seaFish",
  "Premium Sea Food": "premiumSeaFood",
  "Meat & Poultry": "meatPoultry",
  "Fry Ready": "fryReady",
  "Moms Magic": "momsMagic",
  "Rice & Spice": "riceSpice",
  "Pet Serve": "petServe",
};

// Reverse: key -> category name
export const categoryNameMap: Record<string, string> = {};
for (const [name, key] of Object.entries(categoryKeyMap)) {
  categoryNameMap[key] = name;
}

// Slug-to-category name map (for category pages)
export const categorySlugMap: Record<string, string> = {};
for (const cat of siteConfig.categories) {
  const slug = cat.toLowerCase().replace(/[\s&]+/g, "-");
  categorySlugMap[slug] = cat;
}

// Image mapping for sub-categories (used as base for all their variants)
const subCategoryImages: Record<string, string> = {
  "Rui/Rohu": "/images/products/rohu.jpg",
  "Katla/Catla": "/images/products/katla.jpg",
  Hilsa: "/images/products/hilsa.jpg",
  "Aar/Singhara": "/images/products/rohu.jpg",
  Pabda: "/images/products/katla.jpg",
  Tilapia: "/images/products/tilapia.jpg",
  Pomfret: "/images/products/pomfret.jpg",
  Mackerel: "/images/products/mackerel.jpg",
  Sardine: "/images/products/mackerel.jpg",
  Prawn: "/images/products/prawns.jpg",
  Crab: "/images/products/lobster.jpg",
  Squid: "/images/products/prawns.jpg",
  Anchovy: "/images/products/mackerel.jpg",
  "Premium Prawns": "/images/products/prawns.jpg",
  "King Crab": "/images/products/lobster.jpg",
  Lobster: "/images/products/lobster.jpg",
  "Premium Fish Selection": "/images/products/pomfret.jpg",
  "Sea Urchin": "/images/products/lobster.jpg",
  Scallops: "/images/products/prawns.jpg",
  "Chicken - Whole": "/images/products/chicken.jpg",
  "Chicken - Pieces": "/images/products/chicken.jpg",
  Mutton: "/images/products/mutton.jpg",
  Lamb: "/images/products/mutton.jpg",
  Goat: "/images/products/mutton.jpg",
  Beef: "/images/products/mutton.jpg",
  Pork: "/images/products/mutton.jpg",
  "Fish Fry Mix": "/images/products/rohu.jpg",
  "Prawn Fry Mix": "/images/products/prawns.jpg",
  "Chicken Fry Mix": "/images/products/chicken.jpg",
  "Fish Fingers": "/images/products/rohu.jpg",
  "Shrimp Cutlets": "/images/products/prawns.jpg",
  "Fish Curry Mix": "/images/products/hilsa.jpg",
  "Fish Tandoori Mix": "/images/products/pomfret.jpg",
  "Prawn Biryani Kit": "/images/products/prawns.jpg",
  "Fish Masala": "/images/products/rohu.jpg",
  "Ready to Cook Fish": "/images/products/katla.jpg",
  "Basmati Rice": "/images/products/chicken.jpg",
  "Biryani Rice": "/images/products/chicken.jpg",
  "Fish Masala Powder": "/images/products/rohu.jpg",
  "Fry Masala": "/images/products/mackerel.jpg",
  "Curry Powder": "/images/products/hilsa.jpg",
  "Spice Blends": "/images/products/katla.jpg",
  "Fish for Pets": "/images/products/tilapia.jpg",
  "Chicken Offal": "/images/products/chicken.jpg",
  "Nutritional Mix": "/images/products/tilapia.jpg",
  "Pet Fish Selection": "/images/products/mackerel.jpg",
};

// Base prices per sub-category (variants get slight variations)
const subCategoryBasePrices: Record<string, number> = {
  "Rui/Rohu": 280, "Katla/Catla": 320, Hilsa: 1200, "Aar/Singhara": 450,
  Pabda: 550, Tilapia: 180, Pomfret: 750, Mackerel: 350, Sardine: 220,
  Prawn: 480, Crab: 650, Squid: 400, Anchovy: 200, "Premium Prawns": 850,
  "King Crab": 2500, Lobster: 3000, "Premium Fish Selection": 1500,
  "Sea Urchin": 1800, Scallops: 1200, "Chicken - Whole": 220,
  "Chicken - Pieces": 250, Mutton: 750, Lamb: 800, Goat: 700, Beef: 500,
  Pork: 350, "Fish Fry Mix": 320, "Prawn Fry Mix": 450,
  "Chicken Fry Mix": 280, "Fish Fingers": 350, "Shrimp Cutlets": 400,
  "Fish Curry Mix": 380, "Fish Tandoori Mix": 420, "Prawn Biryani Kit": 550,
  "Fish Masala": 360, "Ready to Cook Fish": 300, "Basmati Rice": 180,
  "Biryani Rice": 220, "Fish Masala Powder": 120, "Fry Masala": 100,
  "Curry Powder": 90, "Spice Blends": 150, "Fish for Pets": 150,
  "Chicken Offal": 80, "Nutritional Mix": 200, "Pet Fish Selection": 180,
};

// Stable deterministic hash -- uses unsigned right shift to avoid sign issues
function deterministicValue(seed: string, index: number): number {
  let hash = 5381;
  const str = `${seed}-v-${index}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash * 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return (hash % 1000) / 1000;
}

/**
 * Generate all products from site config.
 * Each variant in a subcategory becomes its own Product.
 */
export function generateProducts(): Product[] {
  const products: Product[] = [];
  let idCounter = 1;

  for (const [categoryKey, subCatDefs] of Object.entries(siteConfig.subCategories)) {
    const categoryName = categoryNameMap[categoryKey] || categoryKey;

    for (const subCatDef of subCatDefs) {
      const basePrice = subCategoryBasePrices[subCatDef.name] || 300;
      const image = subCategoryImages[subCatDef.name] || "/images/products/rohu.jpg";

      for (let vi = 0; vi < subCatDef.products.length; vi++) {
        const variantName = subCatDef.products[vi];
        const seed = `${categoryKey}-${subCatDef.name}-${variantName}`;

        // Slight price variation per variant: -10% to +20%
        const priceMultiplier = 0.9 + deterministicValue(seed, 0) * 0.3;
        const price = Math.round(basePrice * priceMultiplier);

        const hasDiscount = deterministicValue(seed, 1) > 0.65;
        const discountPct = hasDiscount ? Math.floor(deterministicValue(seed, 2) * 15) + 5 : 0;
        const originalPrice = hasDiscount ? Math.round(price / (1 - discountPct / 100)) : undefined;

        products.push({
          id: `product-${idCounter++}`,
          name: variantName,
          variantName,
          description: `Fresh ${variantName} - cleaned and ready to cook`,
          price,
          originalPrice,
          weight: "500 gm",
          category: categoryName,
          subCategory: subCatDef.name,
          image,
          rating: Number.parseFloat((4 + deterministicValue(seed, 3)).toFixed(1)),
          reviews: Math.floor(deterministicValue(seed, 4) * 500) + 50,
          inStock: true,
          discount: discountPct,
          deliveryTime: "30 mins",
          isBestseller: deterministicValue(seed, 5) > 0.7,
          isFavorite: deterministicValue(seed, 6) > 0.7,
        });
      }
    }
  }

  return products;
}

export const allProducts = generateProducts();

export const bestsellerProducts = allProducts.filter((p) => p.isBestseller);
export const favoriteProducts = allProducts.filter((p) => p.isFavorite);

export const displayBestsellers =
  bestsellerProducts.length >= 4 ? bestsellerProducts.slice(0, 8) : allProducts.slice(0, 8);
export const displayFavorites =
  favoriteProducts.length >= 4 ? favoriteProducts.slice(0, 8) : allProducts.slice(4, 12);

/** Get all products for a given category name */
export function getProductsByCategory(categoryName: string): Product[] {
  return allProducts.filter((p) => p.category === categoryName);
}

/** Get products for a specific subcategory */
export function getProductsBySubCategory(subCategory: string): Product[] {
  return allProducts.filter((p) => p.subCategory === subCategory);
}

/** Get subcategory names for a given category key */
export function getSubCategoryNames(categoryKey: string): string[] {
  const defs = siteConfig.subCategories[categoryKey];
  if (!defs) return [];
  return defs.map((d) => d.name);
}

export const announcementTexts = [
  "Free delivery on orders above Rs.500",
  "Fresh cut guaranteed",
  "Same day delivery available",
  "Use code FRESH20 for 20% off",
  "Order before 2 PM for same day delivery",
];

export const offerBanners = [
  { id: 1, image: "/images/banners/offer-1.jpg", alt: "Fresh Fish Friday - 25% off all fish" },
  { id: 2, image: "/images/banners/offer-2.jpg", alt: "Meat Lovers Special - Buy 2Kg get 500g free" },
  { id: 3, image: "/images/banners/offer-3.jpg", alt: "Premium Seafood Week - Flat 15% off" },
  { id: 4, image: "/images/banners/offer-4.jpg", alt: "Free delivery on orders above Rs.500" },
];
