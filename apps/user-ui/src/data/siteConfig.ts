import type { StaticImageData } from "next/image";

import fishRohu from "@/assets/fish-rohu.jpg";
import fishKatla from "@/assets/fish-katla.jpg";
import fishHilsa from "@/assets/fish-hilsa.jpg";
import fishPomfret from "@/assets/fish-pomfret.jpg";
import prawns from "@/assets/prawns.jpg";
import chicken from "@/assets/chicken.jpg";
import mutton from "@/assets/mutton.jpg";

/* ---------------------------------- */
/* Categories */
/* ---------------------------------- */

export const categories = [
  "Fresh Water",
  "Sea Fish",
  "Premium Sea Food",
  "Meat & Poultry",
  "Fry Ready",
  "Moms Magic",
  "Rice & Spice",
  "Pet Serve",
] as const;

export type Category = (typeof categories)[number];

/* ---------------------------------- */
/* Category → Key Mapping */
/* ---------------------------------- */

export const categoryKeyMap = {
  "Fresh Water": "freshWater",
  "Sea Fish": "seaFish",
  "Premium Sea Food": "premiumSeaFood",
  "Meat & Poultry": "meatPoultry",
  "Fry Ready": "fryReady",
  "Moms Magic": "momsMagic",
  "Rice & Spice": "riceSpice",
  "Pet Serve": "petServe",
} as const;

export type CategoryKey = (typeof categoryKeyMap)[Category];

/* ---------------------------------- */
/* Sub Categories */
/* ---------------------------------- */

export const subCategories = {
  freshWater: [
    "Rui/Rohu",
    "Katla/Catla",
    "Hilsa",
    "Aar/Singhara",
    "Pabda",
    "Tilapia",
  ],
  seaFish: [
    "Pomfret",
    "Mackerel",
    "Sardine",
    "Prawn",
    "Crab",
    "Squid",
    "Anchovy",
  ],
  premiumSeaFood: [
    "Premium Prawns",
    "King Crab",
    "Lobster",
    "Premium Fish Selection",
    "Sea Urchin",
    "Scallops",
  ],
  meatPoultry: [
    "Chicken - Whole",
    "Chicken - Pieces",
    "Mutton",
    "Lamb",
    "Goat",
    "Beef",
    "Pork",
  ],
  fryReady: [
    "Fish Fry Mix",
    "Prawn Fry Mix",
    "Chicken Fry Mix",
    "Fish Fingers",
    "Shrimp Cutlets",
  ],
  momsMagic: [
    "Fish Curry Mix",
    "Fish Tandoori Mix",
    "Prawn Biryani Kit",
    "Fish Masala",
    "Ready to Cook Fish",
  ],
  riceSpice: [
    "Basmati Rice",
    "Biryani Rice",
    "Fish Masala Powder",
    "Fry Masala",
    "Curry Powder",
    "Spice Blends",
  ],
  petServe: [
    "Fish for Pets",
    "Chicken Offal",
    "Nutritional Mix",
    "Pet Fish Selection",
  ],
} as const;

export type SubCategory =
  (typeof subCategories)[keyof typeof subCategories][number];

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

export const getCategoryKey = (category: Category): CategoryKey => {
  return categoryKeyMap[category];
};

/* ---------------------------------- */
/* Product */
/* ---------------------------------- */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: StaticImageData;
  category: Category;
  subCategory: SubCategory;
  rating: number;
  inStock: boolean;
  isBestseller?: boolean;
}

/* ---------------------------------- */
/* Products */
/* ---------------------------------- */

export const products: Product[] = [
  {
    id: "1",
    name: "Rui/Rohu",
    description: "Fresh Rui fish, perfect for Bengali curry",
    price: 320,
    unit: "per Kg",
    image: fishRohu,
    category: "Fresh Water",
    subCategory: "Rui/Rohu",
    rating: 4.8,
    inStock: true,
    isBestseller: true,
  },
  {
    id: "2",
    name: "Katla/Catla",
    description: "Premium Katla fish, great for celebrations",
    price: 380,
    unit: "per Kg",
    image: fishKatla,
    category: "Fresh Water",
    subCategory: "Katla/Catla",
    rating: 4.9,
    inStock: true,
    isBestseller: true,
  },
  {
    id: "3",
    name: "Hilsa",
    description: "The king of fish, seasonal delicacy",
    price: 1200,
    unit: "per Kg",
    image: fishHilsa,
    category: "Fresh Water",
    subCategory: "Hilsa",
    rating: 5.0,
    inStock: true,
    isBestseller: true,
  },
  {
    id: "4",
    name: "Pomfret",
    description: "Silver Pomfret, ideal for frying",
    price: 750,
    unit: "per Kg",
    image: fishPomfret,
    category: "Sea Fish",
    subCategory: "Pomfret",
    rating: 4.7,
    inStock: true,
  },
  {
    id: "5",
    name: "Premium Prawns",
    description: "Jumbo prawns, cleaned and deveined",
    price: 890,
    unit: "per Kg",
    image: prawns,
    category: "Premium Sea Food",
    subCategory: "Premium Prawns",
    rating: 4.8,
    inStock: true,
    isBestseller: true,
  },
  {
    id: "6",
    name: "Chicken - Pieces",
    description: "Fresh chicken curry cut pieces",
    price: 220,
    unit: "per Kg",
    image: chicken,
    category: "Meat & Poultry",
    subCategory: "Chicken - Pieces",
    rating: 4.6,
    inStock: true,
  },
  {
    id: "7",
    name: "Mutton",
    description: "Premium goat mutton, bone-in pieces",
    price: 780,
    unit: "per Kg",
    image: mutton,
    category: "Meat & Poultry",
    subCategory: "Mutton",
    rating: 4.9,
    inStock: true,
    isBestseller: true,
  },
  {
    id: "8",
    name: "Prawn",
    description: "Medium sized prawns, cleaned",
    price: 450,
    unit: "per Kg",
    image: prawns,
    category: "Sea Fish",
    subCategory: "Prawn",
    rating: 4.5,
    inStock: true,
  },
];

// already exported stuff above …

export const sizes: Record<string, string[]> = {
  "Rui/Rohu": [
    "< 500 gm",
    "500 gm - 1 Kg",
    "1 Kg - 2 Kg",
    "2 Kg - 3 Kg",
    "> 3 Kg",
  ],
  "Katla/Catla": [
    "< 500 gm",
    "500 gm - 1 Kg",
    "1 Kg - 2 Kg",
    "2 Kg - 3 Kg",
    "> 3 Kg",
  ],
  Hilsa: ["< 500 gm", "500 gm - 1 Kg", "1 Kg - 1.5 Kg", "> 1.5 Kg"],
  Tilapia: ["< 500 gm", "500 gm - 1 Kg"],
  "Aar/Singhara": ["< 500 gm", "500 gm - 1 Kg", "1 Kg - 2 Kg", "> 2 Kg"],
  Pabda: ["< 250 gm", "250 gm - 500 gm", "500 gm - 1 Kg"],
  Pomfret: ["< 500 gm", "500 gm - 1 Kg", "> 1 Kg"],
  default: ["< 500 gm", "500 gm - 1 Kg", "1 Kg - 2 Kg", "> 2 Kg"],
};

export const cuttingTypes = [
  {
    id: "whole",
    name: "Whole Fish",
    description: "Complete fish, cleaned and ready to cook",
    icon: "🐟",
  },
  {
    id: "gutted",
    name: "Gutted (Whole-Cut in Pieces)",
    description: "Fish cut into pieces, cleaned and gutted",
    icon: "✂️",
  },
  {
    id: "fillet",
    name: "Fillet",
    description: "Boneless pieces from both sides of fish",
    icon: "🔪",
  },
  {
    id: "steaks",
    name: "Steaks/Cross Cut",
    description: "Cross-sectional cuts of fish",
    icon: "🥩",
  },
  {
    id: "minced",
    name: "Minced/Ground",
    description: "Fish ground into fine pieces",
    icon: "⚙️",
  },
  {
    id: "head",
    name: "Head",
    description: "Fish head only (useful for stock)",
    icon: "💀",
  },
  {
    id: "tail",
    name: "Tail",
    description: "Fish tail portion",
    icon: "🐠",
  },
  {
    id: "gadaPeti",
    name: "Gada Peti",
    description: "Central body portion (premium cut)",
    icon: "📦",
  },
  {
    id: "ring",
    name: "Ring",
    description: "Ring-shaped cuts (useful for curries)",
    icon: "💍",
  },
] as const;

export const pieceSizes = [
  {
    id: "extra_small",
    name: "Extra Small",
    range: "20-40 gm",
    description: "Very small pieces, ideal for frying or appetizers",
  },
  {
    id: "small",
    name: "Small",
    range: "40-60 gm",
    description: "Small pieces, good for various cooking methods",
  },
  {
    id: "medium",
    name: "Medium",
    range: "60-80 gm",
    description: "Medium-sized pieces, versatile for most dishes",
  },
  {
    id: "large",
    name: "Large",
    range: "80-100 gm",
    description: "Large pieces, ideal for substantial portions",
  },
  {
    id: "extra_large",
    name: "Extra Large",
    range: "> 100 gm",
    description: "Extra large pieces for premium presentation",
  },
] as const;

export const processingWeightLoss: Record<
  string,
  number | { min: number; max: number; description: string }
> = {
  whole: 0,
  gutted: { min: 15, max: 25, description: "Gut & clean loss" },
  fillet: { min: 35, max: 45, description: "Fillet loss" },
  steaks: { min: 10, max: 15, description: "Steak trimming loss" },
  minced: { min: 20, max: 30, description: "Grinding loss" },
  head: 0,
  default: { min: 5, max: 10, description: "Standard loss" },
};

/* ---------------------------------- */
/* Selectors */
/* ---------------------------------- */

export const getProductsByCategory = (category: Category) =>
  products.filter((p) => p.category === category);

export const getProductsBySubCategory = (subCategory: SubCategory) =>
  products.filter((p) => p.subCategory === subCategory);

export const getBestsellers = () => products.filter((p) => p.isBestseller);

export const getProductById = (id: string) => products.find((p) => p.id === id);
