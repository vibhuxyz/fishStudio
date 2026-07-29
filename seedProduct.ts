/**
 * Storefront demo seed.
 *
 * Fills an otherwise empty install with a browsable catalog: categories +
 * subcategories in site_config, 30 admin catalog-root products, a store
 * variant of each so they are actually buyable, plus banners, coupons and
 * live seller events.
 *
 * Product images are uploaded to Cloudinary from CC0/CC-BY source URLs, into
 * the same folders the admin UI uses, so seeded products are indistinguishable
 * from hand-created ones.
 *
 * Usage:
 *   bun run seedProduct.ts
 *
 * Re-running is safe: products are matched on slug, coupons on code, banners
 * on title and events on title+seller, and anything already present is skipped.
 */

import { prismaMongo as prisma } from "@repo/db-mongo";
import { cloudinary } from "@repo/libs/cloudinary";

const CLOUD_FOLDER = process.env.CLOUDINARY_FOLDER || "fishStudio-app";

/* ─── Image sources ───────────────────────────────────────────────────────
 * Wikimedia Commons (CC BY-SA) and rawpixel (CC0) stock. Uploaded once to
 * Cloudinary under a deterministic public_id, so a re-run reuses the asset
 * instead of piling up duplicates.
 */
const IMAGE_SOURCES: Record<string, string> = {
  sardinePlate: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvaXM5Mjk1LWltYWdlLWt3dnlldXlkLmpwZw.jpg",
  smallFishCrate: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZmYzMjA3LWltYWdlLWt3dnlsbXc0LmpwZw.jpg",
  reefFishStack: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2ZmMzIwMi1pbWFnZS1rd3Z5bmc4bC5qcGc.jpg",
  tunaOnIce: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvYTAxOS1qYWt1YmstMDQ0OC10dW5hLW9uLWEtbWFya2V0LmpwZw.jpg",
  seafoodPlatter: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvcHgxMDIzMTEyLWltYWdlLWt3dndmNm9kLmpwZw.jpg",
  anchovyCrate: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvYTAxOS1qYWt1YmstMDU3NC1mcmVzaC1ibHVlLW1hY2tlcmVsbC1hdC1hLWZpc2gtbWFya2V0LmpwZw.jpg",
  marketBasin: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3Vwd2s2MDk3OTQ2My13aWtpbWVkaWEtaW1hZ2Uta293cmpycWQuanBn.jpg",
  salmonFillet: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvYTAxOS1qYWt1YmstMDgxNi1yYXctc2FsbW9uLWZpbGxldHM1LmpwZw.jpg",
  salmonFilletBoard: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvYTAxOS1qYWt1YmstMDc5MC1yYXctc2FsbW9uLWZpbGxldHM0LmpwZw.jpg",
  mackerelIce: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL3B4ODUyMDE2LWltYWdlLWt3dnV4czVsLmpwZw.jpg",
  mackerelRows: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHgxMjQ1NzEwLWltYWdlLWt3dnc1NmIwLmpwZw.jpg",
  marketFishColour: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHgxNTgzMzM3LWltYWdlLWt3dnZwMGVrLmpwZw.jpg",
  sardinePile: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azYyMTg2NTc4LXdpa2ltZWRpYS1pbWFnZS1rb3dzNXJ1Yi1remVtZWE4aS5qcGc.jpg",
  anchovyDark: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL3B4MTA5Mjk5NS1pbWFnZS1rd3Z3ZTlpaS5qcGc.jpg",
  prawnsCooked: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvaXMxMDE3My1pbWFnZS1rd3Z3dWx2MS5qcGc.jpg",
  lobsterRaw: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHgxMjM3OTkwLWltYWdlLWt3dnkxcm8xLmpwZw.jpg",
  scampiTub: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHUyMzQ2NzgyLWltYWdlLWt3eXJvcnkzLmpwZw.jpg",
  prawnsRawPile: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZnJwcmF3bl9tYXJpbmVfc2hyaW1wX2Zvb2QtaW1hZ2Uta3ljZnRwN3UuanBn.jpg",
  scampiOnIce: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHgxMjU3NTM3LWltYWdlLWt3dnkza3RyLmpwZw.jpg",
  lobsterPlated: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvaXMxMDY1Ni1pbWFnZS1rd3lzaWF3Ny5qcGc.jpg",
  squidRaw: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvZnJmb29kX3NlYWZvb2Rfc3F1aWRfcmF3LWltYWdlLWt5YmJpYjA1LmpwZw.jpg",
  driedFishPile: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZnJiYWtlZF9jb3Vyc2VfZmlzaF9mbG9yYWxfMC1pbWFnZS1reWJlOTltZi5qcGc.jpg",
  driedFishBowl: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZnJiYWtlZF9jb3Vyc2VfZmlzaF9mbG9yYWwtaW1hZ2Uta3liZTkxcTUuanBn.jpg",
  driedFishRack: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZnJydXNzaWFfYmFpa2Fsc2VlX29tdWxfZmlzaF8wLWltYWdlLWt5Y2ZucXNsLmpwZw.jpg",
  mussels: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvaXM5NjA1LWltYWdlLWt3dnlmdm91LmpwZw.jpg",
  fishTailDark: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHg4MjY5MTUtaW1hZ2Uta3d2dXkwdGYuanBn.jpg",
  seafoodIceDisplay: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvcHgxMDIyNjQ0LWltYWdlLWt3eXJpeTR1LmpwZw.jpg",
  pinkFishIce: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2ZsMTU0OTA4NDU5ODEtaW1hZ2Uta3R3cGlpanQuanBn.jpg",
  fishIceBox: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L2ZsMjgwODM5NDUzODUtaW1hZ2Uta3Bxb2RvazMta3Bxb3g0YWkuanBn.jpg",
  squidCloseUp: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2Zyc3F1aWRfb2N0b3B1c19leWVfc2VhZm9vZC1pbWFnZS1reWJhbTVtMi5qcGc.jpg",
  fishermanCatch: "https://images.rawpixel.com/image_1300/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA0L2ZsMzYyMjYxMzkwNTQtaW1hZ2UuanBn.jpg",
  skipjackRow: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZmw4NTcxODI1MDAwLWltYWdlLWtwcW9iZ20wLmpwZw.jpg",
  fishCrates: "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZmYzMTk4LWltYWdlLWt3eXQ1cjJqLmpwZw.jpg",
  fishOctopusIce: "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL3B4OTI4MDM3LWltYWdlLWt3dnVzZHNvLmpwZw.jpg",
  katlaMarket: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Catla_fish_displayed_for_sale_at_Boiddar_Bazar%2C_Sonargaon.jpg",
  tilapiaMarket: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Tilapia_fish_for_sale_in_Wakiso_Daily_Market.jpg",
  tilapiaStack: "https://upload.wikimedia.org/wikipedia/commons/4/48/Tilapia_fish.jpg",
  tengraBowl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Mystus_fishes%2C_a_genus_of_the_catfish_family%2C_for_sale_in_a_market_in_West_Bengal%2C_India.jpg",
  tengraTray: "https://upload.wikimedia.org/wikipedia/commons/4/40/Mystus_fishes.jpg",
  chitalMarket: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chitala_Fish_and_Wallago_attu_Fish_in_a_Bangladeshi_market.jpg",
  hilsaBasket: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Hilsa_Fish_in_Dhaka-6.jpg",
  hilsaTray: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Hilsa_Fish_in_Dhaka-2.jpg",
  pomfretStack: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Pomfret_fishes.jpg",
  pomfretWhite: "https://upload.wikimedia.org/wikipedia/commons/6/66/Pomfret_white.JPG",
  ribbonFishTray: "https://upload.wikimedia.org/wikipedia/commons/7/74/Trichiurus_lepturus_FishMarketInTokyo.JPG",
  croaker: "https://upload.wikimedia.org/wikipedia/commons/5/56/Tiger_Tooth_Croaker_%28Otolithes_ruber%29.jpg",
  dryPrawnMarket: "https://upload.wikimedia.org/wikipedia/commons/5/58/Prawns_in_Kakinada_Fish_Market%2C_Andhra_Pradesh%2C_India.jpg",
  tigerPrawnMarket: "https://upload.wikimedia.org/wikipedia/commons/6/61/Prawns_%28Tiger%29_in_Kakinada_Fish_Market%2C_Andhra_Pradesh%2C_India.jpg",
  mudCrabPile: "https://upload.wikimedia.org/wikipedia/commons/b/bb/DFC_5237-_A_close-up_of_a_pile_of_live_mud_crabs_with_glossy_shells_and_visible_eye_spots%2C_freshly_caught_and_ready_for_the_market.jpg",
  mudCrabSingle: "https://upload.wikimedia.org/wikipedia/commons/5/5f/200_-_puu_talay.jpg",
  pangasCubes: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Frozen_pangasius_fish_cubes.jpg",
};

/* ─── Catalog definition ─────────────────────────────────────────────────── */

type SeedProduct = {
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  highlight: string;
  tags: string[];
  images: (keyof typeof IMAGE_SOURCES)[];
  sizes: string[];
  cuttingTypes: string[];
  pieceSizes: string[];
  pricePerKg: number;
  /** Discount off the regular price, as a fraction (0.12 = 12% off). */
  discount: number;
  stock: number;
  totalSold: number;
  ratings: number;
  origin: string;
  source: string;
  shelfLife: string;
  weightLoss: string;
  cookingTips: string[];
  nutrition: { protein: string; omega3: string; calories: string };
};

const WHOLE_FISH_CUTS = ["Whole", "Cleaned Whole", "Curry Cut", "Steaks"];
const SMALL_FISH_CUTS = ["Whole", "Cleaned"];
const PRAWN_CUTS = ["Whole", "Deveined", "Peeled & Deveined"];
const PIECE_SIZES = ["Small", "Medium", "Large"];

const STORAGE = "Keep refrigerated at 0–4°C. Consume within 24 hours of delivery.";

const PRODUCTS: SeedProduct[] = [
  {
    title: "Katla Fish (Whole)",
    slug: "katla-fish-whole",
    category: "Fresh Water",
    subCategory: "Katla",
    short_description:
      "Whole Katla sourced from freshwater farms every morning. Cleaned and cut to order, delivered on ice.",
    highlight:
      "Katla is the Bengali household carp — soft, slightly sweet meat and a large head prized for muri ghonto. Best in curry, jhol and light mustard preparations.",
    tags: ["katla", "carp", "freshwater", "bengali", "fresh-today"],
    images: ["katlaMarket", "marketBasin"],
    sizes: ["500g", "1kg", "2kg"],
    cuttingTypes: WHOLE_FISH_CUTS,
    pieceSizes: PIECE_SIZES,
    pricePerKg: 380,
    discount: 0.12,
    stock: 40,
    totalSold: 86,
    ratings: 4.6,
    origin: "Andhra Pradesh",
    source: "Freshwater",
    shelfLife: "1-2 Days",
    weightLoss: "15%",
    cookingTips: [
      "Marinate with turmeric and salt for 15 minutes before frying",
      "Fry lightly before adding to a curry so the pieces hold together",
      "The head is best kept for muri ghonto",
    ],
    nutrition: { protein: "19g", omega3: "0.6g", calories: "111 kcal" },
  },
  {
    title: "Rohu Curry Cut (Boneless Pieces)",
    slug: "rohu-curry-cut-boneless",
    category: "Fresh Water",
    subCategory: "Rohu",
    short_description:
      "Rohu cut into even curry-sized pieces, deboned and washed. Ready to marinate straight from the pack.",
    highlight:
      "The same daily-catch Rohu, prepped for weeknight cooking — no scaling, no cutting, no cleanup. Pieces are uniform so they cook evenly.",
    tags: ["rohu", "curry cut", "boneless", "freshwater", "ready-to-cook"],
    images: ["pangasCubes", "fishIceBox"],
    sizes: ["500g", "1kg"],
    cuttingTypes: ["Curry Cut", "Boneless Cubes"],
    pieceSizes: ["Medium", "Large"],
    pricePerKg: 420,
    discount: 0.1,
    stock: 32,
    totalSold: 124,
    ratings: 4.7,
    origin: "West Bengal",
    source: "Freshwater",
    shelfLife: "1-2 Days",
    weightLoss: "0%",
    cookingTips: [
      "Pat dry before marinating so the masala sticks",
      "Shallow fry for 2 minutes per side before adding gravy",
    ],
    nutrition: { protein: "20g", omega3: "0.5g", calories: "97 kcal" },
  },
  {
    title: "Tilapia (Whole, Cleaned)",
    slug: "tilapia-whole-cleaned",
    category: "Fresh Water",
    subCategory: "Tilapia",
    short_description:
      "Farm-fresh Tilapia, scaled and gutted. Mild white meat that takes on any masala.",
    highlight:
      "An everyday, budget-friendly fish with firm white flesh and few bones — good for fry, tawa masala and steamed preparations.",
    tags: ["tilapia", "freshwater", "everyday", "value"],
    images: ["tilapiaStack", "tilapiaMarket"],
    sizes: ["500g", "1kg"],
    cuttingTypes: WHOLE_FISH_CUTS,
    pieceSizes: PIECE_SIZES,
    pricePerKg: 260,
    discount: 0.15,
    stock: 55,
    totalSold: 71,
    ratings: 4.3,
    origin: "Uttar Pradesh",
    source: "Farmed",
    shelfLife: "1-2 Days",
    weightLoss: "12%",
    cookingTips: [
      "Score the skin before frying so it cooks through",
      "Pairs well with a simple garlic-chilli rub",
    ],
    nutrition: { protein: "20g", omega3: "0.3g", calories: "96 kcal" },
  },
  {
    title: "Tengra Fish (Small)",
    slug: "tengra-fish-small",
    category: "Fresh Water",
    subCategory: "Tengra",
    short_description:
      "Small river Tengra, cleaned and ready for a classic jhal. Sold by weight, counts vary by size.",
    highlight:
      "Tengra has an unmistakable river flavour that holds up to mustard and green chilli. A Bengali favourite that needs nothing more than a light gravy.",
    tags: ["tengra", "small fish", "freshwater", "bengali"],
    images: ["tengraBowl", "tengraTray"],
    sizes: ["250g", "500g", "1kg"],
    cuttingTypes: SMALL_FISH_CUTS,
    pieceSizes: [],
    pricePerKg: 520,
    discount: 0.08,
    stock: 22,
    totalSold: 48,
    ratings: 4.5,
    origin: "West Bengal",
    source: "Freshwater",
    shelfLife: "1 Day",
    weightLoss: "10%",
    cookingTips: [
      "Fry on high heat so the skin crisps",
      "Best with mustard paste and slit green chillies",
    ],
    nutrition: { protein: "17g", omega3: "0.4g", calories: "104 kcal" },
  },
  {
    title: "Chital / Featherback Fish",
    slug: "chital-featherback-fish",
    category: "Fresh Water",
    subCategory: "Chital",
    short_description:
      "Whole Chital, the fish behind chitol muitha. Cleaned to order with the belly kept intact.",
    highlight:
      "Chital's dense white meat scrapes cleanly off the bone, which is what makes muitha possible. The peti (belly) is the prized cut.",
    tags: ["chital", "chitol", "featherback", "freshwater", "premium"],
    images: ["chitalMarket", "fishCrates"],
    sizes: ["500g", "1kg"],
    cuttingTypes: ["Whole", "Cleaned Whole", "Peti (Belly)", "Curry Cut"],
    pieceSizes: PIECE_SIZES,
    pricePerKg: 720,
    discount: 0.07,
    stock: 14,
    totalSold: 27,
    ratings: 4.8,
    origin: "West Bengal",
    source: "Freshwater",
    shelfLife: "1-2 Days",
    weightLoss: "20%",
    cookingTips: [
      "Scrape the meat with a spoon for muitha, keep the bones for stock",
      "Peti pieces need less cooking time than the back",
    ],
    nutrition: { protein: "21g", omega3: "0.7g", calories: "118 kcal" },
  },
  {
    title: "Mourala Small Fish",
    slug: "mourala-small-fish",
    category: "Fresh Water",
    subCategory: "Mourala",
    short_description:
      "Tiny Mourala cleaned whole — the kind that goes straight into a hot pan with onion and chilli.",
    highlight:
      "Eaten whole, bones and all, which is where the calcium comes from. Crisp-fried Mourala with rice is comfort food across Bengal.",
    tags: ["mourala", "small fish", "freshwater", "crispy"],
    images: ["smallFishCrate", "anchovyCrate"],
    sizes: ["250g", "500g"],
    cuttingTypes: SMALL_FISH_CUTS,
    pieceSizes: [],
    pricePerKg: 460,
    discount: 0.1,
    stock: 18,
    totalSold: 39,
    ratings: 4.4,
    origin: "West Bengal",
    source: "Freshwater",
    shelfLife: "1 Day",
    weightLoss: "8%",
    cookingTips: [
      "Dust with rice flour before frying for extra crunch",
      "Do not overcrowd the pan or they will steam instead of fry",
    ],
    nutrition: { protein: "16g", omega3: "0.5g", calories: "108 kcal" },
  },
  {
    title: "Pangas / Indian Basa (Whole)",
    slug: "pangas-indian-basa-whole",
    category: "Fresh Water",
    subCategory: "Pangas",
    short_description:
      "Whole Pangas, cleaned and cut on order. Thick boneless fillets with a mild taste.",
    highlight:
      "Almost no bones and a neutral flavour, which makes Pangas the easy option for kids, fry batters and continental preparations.",
    tags: ["pangas", "basa", "boneless", "freshwater", "value"],
    images: ["fishCrates", "pinkFishIce"],
    sizes: ["500g", "1kg", "2kg"],
    cuttingTypes: WHOLE_FISH_CUTS,
    pieceSizes: PIECE_SIZES,
    pricePerKg: 240,
    discount: 0.18,
    stock: 60,
    totalSold: 95,
    ratings: 4.2,
    origin: "Andhra Pradesh",
    source: "Farmed",
    shelfLife: "1-2 Days",
    weightLoss: "18%",
    cookingTips: [
      "Do not over-marinate — the flesh is soft and will break",
      "Excellent crumb-fried or in a butter garlic pan sear",
    ],
    nutrition: { protein: "15g", omega3: "0.3g", calories: "90 kcal" },
  },

  {
    title: "Bangda / Indian Mackerel",
    slug: "bangda-indian-mackerel",
    category: "Sea Fish",
    subCategory: "Bangda",
    short_description:
      "Fresh Indian Mackerel off the morning boats, cleaned and gutted on order.",
    highlight:
      "One of the highest omega-3 fish on the coast and priced for everyday cooking. Strong flavour that stands up to a red masala fry.",
    tags: ["bangda", "mackerel", "sea fish", "omega-3", "best-seller"],
    images: ["mackerelIce", "mackerelRows"],
    sizes: ["500g", "1kg"],
    cuttingTypes: WHOLE_FISH_CUTS,
    pieceSizes: PIECE_SIZES,
    pricePerKg: 320,
    discount: 0.14,
    stock: 45,
    totalSold: 152,
    ratings: 4.6,
    origin: "Maharashtra Coast",
    source: "Saltwater",
    shelfLife: "1 Day",
    weightLoss: "12%",
    cookingTips: [
      "Slit the sides so the masala reaches the bone",
      "Rest the marinated fish 30 minutes before frying",
    ],
    nutrition: { protein: "22g", omega3: "2.6g", calories: "205 kcal" },
  },
  {
    title: "Surmai / King Fish Steaks",
    slug: "surmai-king-fish-steaks",
    category: "Sea Fish",
    subCategory: "Surmai",
    short_description:
      "Thick-cut Surmai steaks from large king fish. Firm, meaty and almost boneless.",
    highlight:
      "The tawa-fry fish of the Konkan coast. Steaks hold their shape on high heat, so they are equally good grilled or in a coconut curry.",
    tags: ["surmai", "king fish", "seer", "steaks", "sea fish", "premium"],
    images: ["fishIceBox", "fishCrates"],
    sizes: ["500g", "1kg"],
    cuttingTypes: ["Steaks", "Curry Cut", "Cleaned Whole"],
    pieceSizes: PIECE_SIZES,
    pricePerKg: 820,
    discount: 0.09,
    stock: 26,
    totalSold: 88,
    ratings: 4.8,
    origin: "Konkan Coast",
    source: "Saltwater",
    shelfLife: "1-2 Days",
    weightLoss: "10%",
    cookingTips: [
      "Rava-coat the steaks for a classic Malvani fry",
      "Two minutes a side is enough — it dries out quickly",
    ],
    nutrition: { protein: "24g", omega3: "1.4g", calories: "134 kcal" },
  },
  {
    title: "Sardine / Tarli",
    slug: "sardine-tarli",
    category: "Sea Fish",
    subCategory: "Sardine",
    short_description:
      "Oil sardines landed this morning, cleaned whole. Sold by weight.",
    highlight:
      "Cheap, oily and full of flavour. Tarli fry with a coconut-chilli masala is a coastal staple for a reason.",
    tags: ["sardine", "tarli", "sea fish", "omega-3", "value"],
    images: ["sardinePile", "sardinePlate"],
    sizes: ["250g", "500g", "1kg"],
    cuttingTypes: SMALL_FISH_CUTS,
    pieceSizes: [],
    pricePerKg: 280,
    discount: 0.16,
    stock: 38,
    totalSold: 64,
    ratings: 4.3,
    origin: "Kerala Coast",
    source: "Saltwater",
    shelfLife: "1 Day",
    weightLoss: "14%",
    cookingTips: [
      "Rub with tamarind to cut the oiliness",
      "Fry until the tail is crisp",
    ],
    nutrition: { protein: "20g", omega3: "1.5g", calories: "185 kcal" },
  },
  {
    title: "Mandeli / Anchovy",
    slug: "mandeli-anchovy",
    category: "Sea Fish",
    subCategory: "Mandeli",
    short_description:
      "Small silver anchovies, cleaned and drained. Ideal for crisp fries and koliwada batter.",
    highlight:
      "Mandeli cooks in minutes and turns golden and crisp without much oil. A Mumbai monsoon favourite.",
    tags: ["mandeli", "anchovy", "sea fish", "crispy", "small fish"],
    images: ["anchovyDark", "anchovyCrate"],
    sizes: ["250g", "500g"],
    cuttingTypes: SMALL_FISH_CUTS,
    pieceSizes: [],
    pricePerKg: 340,
    discount: 0.12,
    stock: 20,
    totalSold: 41,
    ratings: 4.4,
    origin: "Maharashtra Coast",
    source: "Saltwater",
    shelfLife: "1 Day",
    weightLoss: "10%",
    cookingTips: [
      "Semolina coating keeps them crisp longer",
      "Serve immediately — they soften as they cool",
    ],
    nutrition: { protein: "20g", omega3: "1.4g", calories: "131 kcal" },
  },
  {
    title: "Poa / Croaker Fish",
    slug: "poa-croaker-fish",
    category: "Sea Fish",
    subCategory: "Poa",
    short_description:
      "Fresh Poa (croaker), cleaned and cut on order. Soft white flesh with a delicate taste.",
    highlight:
      "Light and easy to digest, which is why Poa is the fish of choice for children and for anyone recovering from illness.",
    tags: ["poa", "croaker", "sea fish", "light", "everyday"],
    images: ["croaker", "marketFishColour"],
    sizes: ["500g", "1kg"],
    cuttingTypes: WHOLE_FISH_CUTS,
    pieceSizes: PIECE_SIZES,
    pricePerKg: 400,
    discount: 0.11,
    stock: 30,
    totalSold: 57,
    ratings: 4.4,
    origin: "Gujarat Coast",
    source: "Saltwater",
    shelfLife: "1-2 Days",
    weightLoss: "14%",
    cookingTips: [
      "Steam with ginger and spring onion for a light meal",
      "Handle gently, the flesh flakes easily",
    ],
    nutrition: { protein: "18g", omega3: "0.8g", calories: "102 kcal" },
  },
  {
    title: "Black Pomfret",
    slug: "black-pomfret",
    category: "Sea Fish",
    subCategory: "Pomfret",
    short_description:
      "Whole Black Pomfret, gutted and cleaned. Firmer and meatier than the silver variety.",
    highlight:
      "Black Pomfret carries masala better than white and costs less. Perfect for a full tawa fry where the fish is the centrepiece.",
    tags: ["pomfret", "black pomfret", "sea fish", "tawa fry"],
    images: ["pomfretWhite", "pomfretStack"],
    sizes: ["500g", "1kg"],
    cuttingTypes: ["Whole", "Cleaned Whole", "Curry Cut"],
    pieceSizes: PIECE_SIZES,
    pricePerKg: 640,
    discount: 0.1,
    stock: 24,
    totalSold: 63,
    ratings: 4.6,
    origin: "Gujarat Coast",
    source: "Saltwater",
    shelfLife: "1-2 Days",
    weightLoss: "12%",
    cookingTips: [
      "Score both sides deeply before marinating",
      "Finish on low heat so the centre cooks through",
    ],
    nutrition: { protein: "21g", omega3: "1.3g", calories: "126 kcal" },
  },
  {
    title: "Bhetki / Barramundi (Whole)",
    slug: "bhetki-barramundi-whole",
    category: "Sea Fish",
    subCategory: "Bhetki",
    short_description:
      "Whole Bhetki, cleaned to order. The fish behind Kolkata's fish fry and paturi.",
    highlight:
      "Thick white fillets with no small bones — Bhetki is what restaurants use for fish fry, orly and paturi.",
    tags: ["bhetki", "barramundi", "seabass", "sea fish", "premium"],
    images: ["fishTailDark", "reefFishStack"],
    sizes: ["1kg", "2kg"],
    cuttingTypes: ["Whole", "Cleaned Whole", "Fillet", "Curry Cut"],
    pieceSizes: PIECE_SIZES,
    pricePerKg: 780,
    discount: 0.08,
    stock: 16,
    totalSold: 74,
    ratings: 4.8,
    origin: "West Bengal",
    source: "Saltwater",
    shelfLife: "1-2 Days",
    weightLoss: "22%",
    cookingTips: [
      "Ask for fillet cut if you are making fish fry",
      "Mustard paste and a banana leaf is all paturi needs",
    ],
    nutrition: { protein: "23g", omega3: "1.1g", calories: "121 kcal" },
  },
  {
    title: "Ribbon Fish / Vela",
    slug: "ribbon-fish-vela",
    category: "Sea Fish",
    subCategory: "Ribbon Fish",
    short_description:
      "Silver ribbon fish, cleaned and cut into pan-sized lengths.",
    highlight:
      "Sweet, delicate meat that pulls off the central bone in clean strips. Cooks in minutes — do not overdo it.",
    tags: ["ribbon fish", "vela", "sea fish", "coastal"],
    images: ["ribbonFishTray", "reefFishStack"],
    sizes: ["500g", "1kg"],
    cuttingTypes: ["Cleaned", "Curry Cut"],
    pieceSizes: ["Medium", "Large"],
    pricePerKg: 360,
    discount: 0.13,
    stock: 21,
    totalSold: 33,
    ratings: 4.2,
    origin: "Andhra Coast",
    source: "Saltwater",
    shelfLife: "1 Day",
    weightLoss: "16%",
    cookingTips: [
      "Shallow fry in a tamarind-chilli marinade",
      "Three minutes per side is plenty",
    ],
    nutrition: { protein: "18g", omega3: "0.9g", calories: "110 kcal" },
  },
  {
    title: "Tuna Steaks",
    slug: "tuna-steaks",
    category: "Sea Fish",
    subCategory: "Tuna",
    short_description:
      "Deep-red tuna loin cut into thick steaks. Boneless, skinless and ready for the grill.",
    highlight:
      "Lean, dense and high in protein. Sear the outside and leave the centre pink, or flake it into salads and sandwiches.",
    tags: ["tuna", "steaks", "sea fish", "protein", "boneless"],
    images: ["tunaOnIce", "skipjackRow"],
    sizes: ["250g", "500g", "1kg"],
    cuttingTypes: ["Steaks", "Cubes"],
    pieceSizes: ["Medium", "Large"],
    pricePerKg: 700,
    discount: 0.1,
    stock: 19,
    totalSold: 46,
    ratings: 4.5,
    origin: "Lakshadweep Sea",
    source: "Saltwater",
    shelfLife: "1-2 Days",
    weightLoss: "0%",
    cookingTips: [
      "Sear 90 seconds per side on a very hot pan",
      "Rest before slicing so the juices settle",
    ],
    nutrition: { protein: "29g", omega3: "1.3g", calories: "144 kcal" },
  },
  {
    title: "Rawas / Indian Salmon",
    slug: "rawas-indian-salmon",
    category: "Sea Fish",
    subCategory: "Rawas",
    short_description:
      "Premium Rawas, cleaned and cut into steaks or curry pieces on request.",
    highlight:
      "Rawas has a buttery texture and very few bones, which is why it commands the highest price on the Mumbai coast.",
    tags: ["rawas", "indian salmon", "sea fish", "premium", "boneless"],
    images: ["pinkFishIce", "marketFishColour"],
    sizes: ["500g", "1kg"],
    cuttingTypes: ["Steaks", "Curry Cut", "Fillet"],
    pieceSizes: PIECE_SIZES,
    pricePerKg: 900,
    discount: 0.07,
    stock: 15,
    totalSold: 52,
    ratings: 4.9,
    origin: "Maharashtra Coast",
    source: "Saltwater",
    shelfLife: "1-2 Days",
    weightLoss: "10%",
    cookingTips: [
      "Minimal masala — the fish carries its own flavour",
      "Excellent grilled with lemon and pepper",
    ],
    nutrition: { protein: "24g", omega3: "1.8g", calories: "138 kcal" },
  },

  {
    title: "Hilsa / Ilish (Whole)",
    slug: "hilsa-ilish-whole",
    category: "Premimum Sea Food",
    subCategory: "Hilsa",
    short_description:
      "Whole Padma-style Hilsa, cut into classic gada pieces on request. Roe included when in season.",
    highlight:
      "The king of Bengali fish. Hilsa needs nothing beyond mustard oil, salt and green chilli — its own oil does the rest.",
    tags: ["hilsa", "ilish", "bengali", "premium", "seasonal", "best-seller"],
    images: ["hilsaBasket", "hilsaTray"],
    sizes: ["500g", "1kg", "1.5kg"],
    cuttingTypes: ["Whole", "Gada Cut", "Curry Cut"],
    pieceSizes: PIECE_SIZES,
    pricePerKg: 1450,
    discount: 0.06,
    stock: 12,
    totalSold: 118,
    ratings: 4.9,
    origin: "Bay of Bengal",
    source: "Saltwater",
    shelfLife: "1-2 Days",
    weightLoss: "8%",
    cookingTips: [
      "Never wash the pieces after cutting — it washes away the oil",
      "Steam with mustard paste for shorshe ilish",
      "Keep the frying oil, it is the best part",
    ],
    nutrition: { protein: "22g", omega3: "2.9g", calories: "273 kcal" },
  },
  {
    title: "Norwegian Salmon Fillet",
    slug: "norwegian-salmon-fillet",
    category: "Premimum Sea Food",
    subCategory: "Salmon",
    short_description:
      "Boneless, skin-on Atlantic salmon fillet. Portioned and vacuum packed.",
    highlight:
      "Consistently rich in omega-3 and easy to cook — pan sear skin-side down and it does most of the work itself.",
    tags: ["salmon", "fillet", "imported", "premium", "boneless", "omega-3"],
    images: ["salmonFillet", "salmonFilletBoard"],
    sizes: ["250g", "500g", "1kg"],
    cuttingTypes: ["Fillet", "Steaks", "Cubes"],
    pieceSizes: ["Medium", "Large"],
    pricePerKg: 1900,
    discount: 0.05,
    stock: 10,
    totalSold: 37,
    ratings: 4.9,
    origin: "Norway",
    source: "Farmed",
    shelfLife: "2-3 Days",
    weightLoss: "0%",
    cookingTips: [
      "Start skin-side down on a hot dry pan for crisp skin",
      "Take it off at medium — carryover heat finishes it",
    ],
    nutrition: { protein: "25g", omega3: "2.3g", calories: "208 kcal" },
  },
  {
    title: "Basa Fillet (Boneless)",
    slug: "basa-fillet-boneless",
    category: "Premimum Sea Food",
    subCategory: "Basa Fillet",
    short_description:
      "Trimmed boneless Basa fillets, individually portioned. Zero prep needed.",
    highlight:
      "Completely boneless with a mild taste, which makes it the safest fish to serve children and the easiest base for continental sauces.",
    tags: ["basa", "fillet", "boneless", "kids-friendly", "ready-to-cook"],
    images: ["pangasCubes", "lobsterRaw"],
    sizes: ["250g", "500g", "1kg"],
    cuttingTypes: ["Fillet", "Cubes"],
    pieceSizes: ["Medium", "Large"],
    pricePerKg: 480,
    discount: 0.14,
    stock: 28,
    totalSold: 66,
    ratings: 4.3,
    origin: "Vietnam",
    source: "Farmed",
    shelfLife: "2-3 Days",
    weightLoss: "0%",
    cookingTips: [
      "Thaw fully and pat dry or it will steam in the pan",
      "Works well with lemon butter or a light crumb",
    ],
    nutrition: { protein: "16g", omega3: "0.3g", calories: "92 kcal" },
  },
  {
    title: "Fresh Lobster (Whole)",
    slug: "fresh-lobster-whole",
    category: "Premimum Sea Food",
    subCategory: "Lobster",
    short_description:
      "Whole lobster, cleaned and deveined on request. Sold by piece weight.",
    highlight:
      "Sweet, firm tail meat that needs nothing more than butter and garlic. Grill it halved, shell-side down.",
    tags: ["lobster", "shellfish", "premium", "celebration"],
    images: ["lobsterRaw", "lobsterPlated"],
    sizes: ["500g", "1kg"],
    cuttingTypes: ["Whole", "Halved", "Cleaned & Deveined"],
    pieceSizes: ["Medium", "Large"],
    pricePerKg: 2200,
    discount: 0.05,
    stock: 8,
    totalSold: 19,
    ratings: 4.8,
    origin: "Tamil Nadu Coast",
    source: "Saltwater",
    shelfLife: "1 Day",
    weightLoss: "0%",
    cookingTips: [
      "Halve lengthwise and grill shell-side down",
      "Overcooking turns the tail rubbery — 6-8 minutes is enough",
    ],
    nutrition: { protein: "19g", omega3: "0.4g", calories: "89 kcal" },
  },
  {
    title: "Weekend Seafood Combo Box",
    slug: "weekend-seafood-combo-box",
    category: "Premimum Sea Food",
    subCategory: "Combo",
    short_description:
      "A curated box: prawns, one whole sea fish, squid rings and a fillet pack. Contents rotate with the day's catch.",
    highlight:
      "Built for a weekend of cooking without four separate orders. Everything arrives cleaned, cut and separately packed.",
    tags: ["combo", "seafood box", "value", "weekend", "assorted"],
    images: ["seafoodPlatter", "seafoodIceDisplay"],
    sizes: ["1 Box (1.5kg)", "1 Box (3kg)"],
    cuttingTypes: [],
    pieceSizes: [],
    pricePerKg: 700,
    discount: 0.2,
    stock: 15,
    totalSold: 58,
    ratings: 4.7,
    origin: "Mixed",
    source: "Mixed",
    shelfLife: "1-2 Days",
    weightLoss: "0%",
    cookingTips: [
      "Cook the prawns and squid first — they keep the least",
      "Contents vary by day, check the packing slip",
    ],
    nutrition: { protein: "21g", omega3: "1.2g", calories: "125 kcal" },
  },

  {
    title: "Tiger Prawns (Large)",
    slug: "tiger-prawns-large",
    category: "Prawns & Shellfish",
    subCategory: "Tiger Prawn",
    short_description:
      "Large tiger prawns, headless or whole. Deveined on request at no extra cost.",
    highlight:
      "Big enough to skewer, firm enough to hold a bite. Tiger prawns stay juicy where smaller varieties turn rubbery.",
    tags: ["tiger prawn", "prawns", "shellfish", "premium", "best-seller"],
    images: ["prawnsRawPile", "tigerPrawnMarket"],
    sizes: ["250g", "500g", "1kg"],
    cuttingTypes: PRAWN_CUTS,
    pieceSizes: ["Large", "Jumbo"],
    pricePerKg: 880,
    discount: 0.1,
    stock: 25,
    totalSold: 141,
    ratings: 4.7,
    origin: "Andhra Coast",
    source: "Farmed",
    shelfLife: "1 Day",
    weightLoss: "25%",
    cookingTips: [
      "Cook only until they curl into a C — an O means overcooked",
      "Keep the shells for stock",
    ],
    nutrition: { protein: "24g", omega3: "0.5g", calories: "99 kcal" },
  },
  {
    title: "White Prawns (Medium)",
    slug: "white-prawns-medium",
    category: "Prawns & Shellfish",
    subCategory: "White Prawn",
    short_description:
      "Medium white prawns, cleaned and deveined. The everyday prawn for curries and pulao.",
    highlight:
      "Sweeter and softer than tiger prawns, and priced for regular cooking. The right size for prawn curry and fried rice.",
    tags: ["white prawn", "prawns", "shellfish", "everyday"],
    images: ["tigerPrawnMarket", "prawnsCooked"],
    sizes: ["250g", "500g", "1kg"],
    cuttingTypes: PRAWN_CUTS,
    pieceSizes: ["Small", "Medium"],
    pricePerKg: 620,
    discount: 0.12,
    stock: 34,
    totalSold: 97,
    ratings: 4.5,
    origin: "Andhra Coast",
    source: "Farmed",
    shelfLife: "1 Day",
    weightLoss: "22%",
    cookingTips: [
      "Add to a curry at the very end, they need 3-4 minutes",
      "A pinch of turmeric while washing removes any smell",
    ],
    nutrition: { protein: "22g", omega3: "0.4g", calories: "95 kcal" },
  },
  {
    title: "Scampi / Golda Chingri",
    slug: "scampi-golda-chingri",
    category: "Prawns & Shellfish",
    subCategory: "Scampi",
    short_description:
      "Giant river prawns with the head on. Cleaned to order, heads kept for the malaikari.",
    highlight:
      "Golda chingri is a special-occasion prawn — the head holds the fat that gives chingri malaikari its richness.",
    tags: ["scampi", "golda", "chingri", "river prawn", "premium", "bengali"],
    images: ["scampiTub", "scampiOnIce"],
    sizes: ["500g", "1kg"],
    cuttingTypes: ["Whole", "Deveined"],
    pieceSizes: ["Large", "Jumbo"],
    pricePerKg: 1250,
    discount: 0.08,
    stock: 11,
    totalSold: 44,
    ratings: 4.8,
    origin: "West Bengal",
    source: "Freshwater",
    shelfLife: "1 Day",
    weightLoss: "20%",
    cookingTips: [
      "Fry the heads separately and add the fat back to the gravy",
      "Coconut milk goes in last, on low heat",
    ],
    nutrition: { protein: "20g", omega3: "0.5g", calories: "104 kcal" },
  },
  {
    title: "Squid / Calamari Rings",
    slug: "squid-calamari-rings",
    category: "Prawns & Shellfish",
    subCategory: "Squid",
    short_description:
      "Cleaned squid, whole tubes or cut into rings. Skin and quill removed.",
    highlight:
      "Squid is either cooked in two minutes or in twenty — anything in between turns it chewy. Rings are ready for the batter.",
    tags: ["squid", "calamari", "shellfish", "ready-to-cook"],
    images: ["squidRaw", "squidCloseUp"],
    sizes: ["250g", "500g"],
    cuttingTypes: ["Whole Tube", "Rings", "Cleaned"],
    pieceSizes: ["Medium", "Large"],
    pricePerKg: 560,
    discount: 0.11,
    stock: 17,
    totalSold: 51,
    ratings: 4.4,
    origin: "Kerala Coast",
    source: "Saltwater",
    shelfLife: "1 Day",
    weightLoss: "15%",
    cookingTips: [
      "Two minutes on high heat, or slow cook for twenty",
      "Pat completely dry before it goes into batter",
    ],
    nutrition: { protein: "16g", omega3: "0.5g", calories: "92 kcal" },
  },
  {
    title: "Live Mud Crab",
    slug: "live-mud-crab",
    category: "Prawns & Shellfish",
    subCategory: "Crab",
    short_description:
      "Live mud crab, tied and delivered fresh. Cleaned and cut on request.",
    highlight:
      "Heavy claws and dense body meat. Mud crab is worth the mess — a chilli or butter-pepper crab needs nothing else.",
    tags: ["crab", "mud crab", "shellfish", "live", "premium"],
    images: ["mudCrabPile", "mudCrabSingle"],
    sizes: ["500g", "1kg"],
    cuttingTypes: ["Whole", "Cleaned & Cut"],
    pieceSizes: ["Medium", "Large"],
    pricePerKg: 750,
    discount: 0.09,
    stock: 13,
    totalSold: 36,
    ratings: 4.6,
    origin: "Tamil Nadu Coast",
    source: "Saltwater",
    shelfLife: "Same Day",
    weightLoss: "30%",
    cookingTips: [
      "Crack the claws before cooking so the masala gets in",
      "Cook the same day it is delivered",
    ],
    nutrition: { protein: "18g", omega3: "0.4g", calories: "87 kcal" },
  },
  {
    title: "Fresh Mussels / Clams",
    slug: "fresh-mussels-clams",
    category: "Prawns & Shellfish",
    subCategory: "Shellfish",
    short_description:
      "Cleaned and de-bearded mussels, scrubbed and ready to steam.",
    highlight:
      "Steam them with garlic and they open in five minutes. Discard any that stay shut — those were not alive.",
    tags: ["mussels", "clams", "shellfish", "coastal", "quick-cook"],
    images: ["mussels", "fishOctopusIce"],
    sizes: ["500g", "1kg"],
    cuttingTypes: ["Whole", "Half Shell"],
    pieceSizes: [],
    pricePerKg: 380,
    discount: 0.15,
    stock: 16,
    totalSold: 28,
    ratings: 4.2,
    origin: "Kerala Coast",
    source: "Saltwater",
    shelfLife: "Same Day",
    weightLoss: "60%",
    cookingTips: [
      "Throw away any shell that does not open after steaming",
      "Keep the liquor left in the pan, it is the stock",
    ],
    nutrition: { protein: "24g", omega3: "0.7g", calories: "86 kcal" },
  },

  {
    title: "Dry Bombil (Bombay Duck)",
    slug: "dry-bombil-bombay-duck",
    category: "Dry Fish",
    subCategory: "Dry Bombil",
    short_description:
      "Sun-dried Bombay duck, cleaned and packed. Strong aroma, stronger flavour.",
    highlight:
      "Roasted over a flame or fried in a thin batter, dry bombil is the sharpest side dish on a coastal plate. Keeps for months.",
    tags: ["dry fish", "bombil", "bombay duck", "sukat", "long-shelf"],
    images: ["driedFishPile", "driedFishRack"],
    sizes: ["100g", "250g", "500g"],
    cuttingTypes: ["Whole", "Cleaned"],
    pieceSizes: [],
    pricePerKg: 900,
    discount: 0.1,
    stock: 26,
    totalSold: 43,
    ratings: 4.3,
    origin: "Maharashtra Coast",
    source: "Sun-dried",
    shelfLife: "3-4 Months",
    weightLoss: "0%",
    cookingTips: [
      "Roast directly on the flame before frying to cut the smell",
      "Store in an airtight jar away from other food",
    ],
    nutrition: { protein: "48g", omega3: "1.1g", calories: "220 kcal" },
  },
  {
    title: "Dry Prawns (Sukat)",
    slug: "dry-prawns-sukat",
    category: "Dry Fish",
    subCategory: "Dry Prawn",
    short_description:
      "Cleaned sun-dried prawns, shells removed. A spoonful lifts any vegetable dish.",
    highlight:
      "Dry prawns bring depth that fresh prawns cannot — a handful in a drumstick or brinjal curry changes the whole dish.",
    tags: ["dry fish", "dry prawns", "sukat", "long-shelf", "pantry"],
    images: ["dryPrawnMarket", "driedFishBowl"],
    sizes: ["100g", "250g", "500g"],
    cuttingTypes: ["Cleaned"],
    pieceSizes: ["Small", "Medium"],
    pricePerKg: 1100,
    discount: 0.08,
    stock: 22,
    totalSold: 31,
    ratings: 4.4,
    origin: "Andhra Coast",
    source: "Sun-dried",
    shelfLife: "4-6 Months",
    weightLoss: "0%",
    cookingTips: [
      "Dry roast for a minute before grinding into masala",
      "Rinse quickly in warm water to remove excess salt",
    ],
    nutrition: { protein: "62g", omega3: "0.9g", calories: "290 kcal" },
  },
];

/* ─── Category tree ──────────────────────────────────────────────────────── */

const CATEGORY_TREE: Record<string, string[]> = {
  "Fresh Water": ["Rohu", "Katla", "Tilapia", "Tengra", "Chital", "Mourala", "Pangas"],
  "Sea Fish": [
    "Poa", "Pomfret", "Amodi", "Bangda", "Surmai", "Sardine",
    "Mandeli", "Bhetki", "Ribbon Fish", "Tuna", "Rawas",
  ],
  "Premimum Sea Food": [
    "Tilapia Fillet", "Pabda", "Hilsa", "Salmon", "Basa Fillet", "Lobster", "Combo",
  ],
  "Prawns & Shellfish": ["Tiger Prawn", "White Prawn", "Scampi", "Squid", "Crab", "Shellfish"],
  "Dry Fish": ["Dry Bombil", "Dry Prawn"],
};

const NEW_CATEGORY_IMAGES: Record<string, keyof typeof IMAGE_SOURCES> = {
  "Prawns & Shellfish": "scampiOnIce",
  "Dry Fish": "driedFishBowl",
};

/* ─── Banners, coupons, events ───────────────────────────────────────────── */

const BANNERS: {
  title: string;
  subtitle: string;
  bannerType: "homepage" | "category" | "combo" | "announcement";
  image?: keyof typeof IMAGE_SOURCES;
  category?: string;
  price?: string;
}[] = [
  {
    title: "Fresh Catch, Every Morning",
    subtitle: "Cut after you order. At your door in 90 minutes.",
    bannerType: "homepage",
    image: "seafoodIceDisplay",
  },
  {
    title: "From Boat to Doorstep",
    subtitle: "Sourced daily from the harbour, never frozen twice",
    bannerType: "homepage",
    image: "fishermanCatch",
  },
  {
    title: "Today's Harbour Picks",
    subtitle: "Whole fish, cleaned and cut the way you want",
    bannerType: "homepage",
    image: "marketBasin",
  },
  {
    title: "Weekend Seafood Combo",
    subtitle: "Prawns + fish + squid, one box",
    bannerType: "combo",
    image: "seafoodPlatter",
    price: "699",
  },
  {
    title: "Prawns & Shellfish",
    subtitle: "Tiger prawns, scampi and live crab",
    bannerType: "category",
    category: "Prawns & Shellfish",
    image: "prawnsRawPile",
  },
  {
    title: "Freshwater Favourites",
    subtitle: "Rohu, Katla and Tengra from the morning haul",
    bannerType: "category",
    category: "Fresh Water",
    image: "katlaMarket",
  },
  {
    title: "Straight Off the Boats",
    subtitle: "Bangda, Surmai, Pomfret and the day's sea catch",
    bannerType: "category",
    category: "Sea Fish",
    image: "marketFishColour",
  },
  {
    title: "Premium Picks",
    subtitle: "Ilish, Norwegian salmon and lobster",
    bannerType: "category",
    category: "Premimum Sea Food",
    image: "hilsaBasket",
  },
  {
    title: "Sun-Dried & Stocked",
    subtitle: "Bombil and sukat that keep for months",
    bannerType: "category",
    category: "Dry Fish",
    image: "driedFishRack",
  },
  {
    title: "Free delivery on orders above ₹299",
    subtitle: "Every day, across all serviceable pincodes",
    bannerType: "announcement",
  },
  {
    title: "Order before 9 AM for same-day delivery",
    subtitle: "Instant delivery slots open 11 AM – 7 PM",
    bannerType: "announcement",
  },
];

const COUPONS = [
  {
    public_name: "Welcome Offer",
    discountCode: "WELCOME100",
    discountType: "fixed",
    discountValue: 100,
    minOrderValue: 499,
    maxUsesPerUser: 1,
    isFirstOrder: true,
    maxUses: null as number | null,
  },
  {
    public_name: "Flat ₹50 Off",
    discountCode: "FRESH50",
    discountType: "fixed",
    discountValue: 50,
    minOrderValue: 399,
    maxUsesPerUser: 3,
    isFirstOrder: false,
    maxUses: 1000,
  },
  {
    public_name: "15% Off on Big Orders",
    discountCode: "SAVE15",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 699,
    maxUsesPerUser: 2,
    isFirstOrder: false,
    maxUses: 500,
  },
  {
    public_name: "Free Delivery",
    discountCode: "FREEDEL",
    discountType: "free_delivery",
    discountValue: 0,
    minOrderValue: 299,
    maxUsesPerUser: 5,
    isFirstOrder: false,
    maxUses: null as number | null,
  },
  {
    public_name: "Mega Saver ₹200 Off",
    discountCode: "MEGA200",
    discountType: "fixed",
    discountValue: 200,
    minOrderValue: 1499,
    maxUsesPerUser: 2,
    isFirstOrder: false,
    maxUses: 250,
  },
];

const EVENTS = [
  {
    title: "Free Delivery Weekend",
    description: "No delivery charge on every order above ₹299 this weekend.",
    type: "FREE_DELIVERY" as const,
    minOrder: 299,
    discount: null as number | null,
    startsInDays: -1,
    endsInDays: 6,
  },
  {
    title: "Monsoon Special — 10% Off",
    description: "Flat 10% off across fresh water and sea fish.",
    type: "DISCOUNT" as const,
    minOrder: 499,
    discount: 10,
    startsInDays: -2,
    endsInDays: 12,
  },
  {
    title: "Evening Flash Sale",
    description: "20% off on the day's remaining catch, 6 PM to 9 PM.",
    type: "FLASH_SALE" as const,
    minOrder: 0,
    discount: 20,
    startsInDays: 0,
    endsInDays: 3,
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const uploadedImages = new Map<string, { url: string; file_id: string }>();

// Cloudinary rejects with a plain { error: { message, http_code } } object rather
// than an Error, so String() on it prints "[object Object]" and the real cause
// never makes it into the step summary.
const reason = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const { error: nested, message } = error as {
      error?: { message?: string };
      message?: string;
    };
    if (nested?.message) return nested.message;
    if (message) return message;
  }
  return String(error);
};

// Wikimedia rejects Cloudinary's remote fetcher outright, so the bytes are
// pulled here and handed to Cloudinary inline instead. Their UA policy wants a
// contact address and the Accept headers a browser would send — without both,
// upload.wikimedia.org answers 429 regardless of request rate.
const IMAGE_FETCH_HEADERS = {
  "User-Agent": "fishStudio-seed/1.0 (https://fishstudio.app; vik6026717961@gmail.com)",
  Accept: "image/jpeg,image/*,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
};

const WIKIMEDIA_ORIGINAL =
  /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/)([0-9a-f]\/[0-9a-f]{2}\/)([^/]+)$/;

// Commons originals run 2-6 MB. Cloudinary's socket timeout only fires on an
// idle connection, so a base64 body that size trickles up for minutes without
// ever failing — that is what stalled the run partway through the catalog.
// The thumbnail renderer returns the same frame under 1 MB, and the upload
// caps width at 1200 anyway. 1280 is one of the few widths Commons still
// serves; keep the original as a fallback in case that list changes again.
function downloadCandidates(url: string) {
  const match = url.match(WIKIMEDIA_ORIGINAL);
  if (!match) return [url];
  const [, base, hash, file] = match;
  return [`${base}thumb/${hash}${file}/1280px-${file}`, url];
}

async function fetchAsDataUri(url: string) {
  let lastStatus = 0;

  for (const candidate of downloadCandidates(url)) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await fetch(candidate, {
        headers: IMAGE_FETCH_HEADERS,
        signal: AbortSignal.timeout(60_000),
      });
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const mime = response.headers.get("content-type") ?? "image/jpeg";
        return `data:${mime};base64,${buffer.toString("base64")}`;
      }
      lastStatus = response.status;
      if (response.status !== 429) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }

  throw new Error(`Image download failed (${lastStatus}): ${url}`);
}

/**
 * Uploads a source image into Cloudinary under a deterministic public_id so a
 * re-run reuses the same asset rather than creating a duplicate.
 */
async function uploadImage(
  assetKey: keyof typeof IMAGE_SOURCES,
  folder: string,
  publicId: string,
) {
  const cacheKey = `${folder}/${publicId}`;
  const cached = uploadedImages.get(cacheKey);
  if (cached) return cached;

  const source = await fetchAsDataUri(IMAGE_SOURCES[assetKey]!);
  const response = await cloudinary.uploader.upload(source, {
    folder,
    public_id: publicId,
    overwrite: false,
    resource_type: "image",
    quality: "auto:good",
    fetch_format: "auto",
    transformation: [{ width: 1200, crop: "limit" }],
    timeout: 90_000,
  });
  const uploaded = { url: response.secure_url, file_id: response.public_id };
  uploadedImages.set(cacheKey, uploaded);
  return uploaded;
}

const productFolder = (title: string) =>
  `${CLOUD_FOLDER}/products/${title.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`;

// The folder is part of the public_id, and Cloudinary 400s on "&" and most other
// punctuation — "Prawns & Shellfish" is why that one banner failed every run.
const cloudinarySegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseWeightToGrams = (size: string) => {
  const match = size.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(kg|g)/);
  if (!match) return 1000;
  const amount = Number(match[1]);
  return match[2] === "kg" ? Math.round(amount * 1000) : Math.round(amount);
};

const roundPrice = (value: number) => Math.round(value / 5) * 5;

/**
 * Per-size prices derived from the per-kg rate. Box sizes fall back to a flat
 * multiplier because "1 Box (1.5kg)" has no per-kg meaning on its own.
 */
function buildSizePricing(product: SeedProduct) {
  return product.sizes.map((size) => {
    const grams = parseWeightToGrams(size);
    const regularPrice = roundPrice((product.pricePerKg * grams) / 1000);
    return {
      size,
      weightGrams: grams,
      regularPrice,
      salePrice: roundPrice(regularPrice * (1 - product.discount)),
    };
  });
}

const buildCuttingTypePricing = (product: SeedProduct) =>
  product.cuttingTypes.map((cuttingType, index) => {
    // First option is the plain cut; each extra prep step carries a small charge.
    const premium = index === 0 ? 0 : 20 + index * 10;
    return { cuttingType, salePrice: premium, regularPrice: premium };
  });

const buildPieceSizePricing = (product: SeedProduct) =>
  product.pieceSizes.map((pieceSize, index) => {
    const premium = index === 0 ? 0 : index * 15;
    return { pieceSize, salePrice: premium, regularPrice: premium };
  });

/* ─── Seed steps ─────────────────────────────────────────────────────────── */

async function seedCategories() {
  let config = await prisma.site_config.findFirst();
  if (!config) {
    config = await prisma.site_config.create({
      data: { categories: [], subCategories: {}, categoryImages: {} },
    });
  }

  const categories = [...config.categories];
  const subCategories = { ...((config.subCategories as Record<string, string[]>) ?? {}) };
  const categoryImages = { ...((config.categoryImages as Record<string, string>) ?? {}) };

  let addedCategories = 0;
  let addedSubCategories = 0;

  for (const [category, subs] of Object.entries(CATEGORY_TREE)) {
    if (!categories.includes(category)) {
      categories.push(category);
      addedCategories++;
    }
    const existing = subCategories[category] ?? [];
    const merged = [...existing];
    for (const sub of subs) {
      if (!merged.some((s) => s.toLowerCase() === sub.toLowerCase())) {
        merged.push(sub);
        addedSubCategories++;
      }
    }
    subCategories[category] = merged;

    const imageKey = NEW_CATEGORY_IMAGES[category];
    if (imageKey && !categoryImages[category]) {
      try {
        const uploaded = await uploadImage(
          imageKey,
          `${CLOUD_FOLDER}/categriy/categoryImage/images`,
          cloudinarySegment(category),
        );
        categoryImages[category] = uploaded.url;
      } catch (error) {
        console.warn(`  ✗ category image for "${category}": ${reason(error)}`);
      }
    }
  }

  await prisma.site_config.update({
    where: { id: config.id },
    data: { categories, subCategories, categoryImages },
  });
  console.log(
    `🗂️  Categories: +${addedCategories} categories, +${addedSubCategories} subcategories`,
  );
}

async function seedProducts(adminId: string, storeId: string) {
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of PRODUCTS) {
    try {
      await seedProduct(product, adminId, storeId, () => created++, () => skipped++);
    } catch (error) {
      failed++;
      console.warn(`  ✗ ${product.title}: ${reason(error)}`);
    }
  }

  console.log(
    `🐟 Products: ${created} created, ${skipped} already present` +
      (failed > 0 ? `, ${failed} failed` : ""),
  );
}

async function seedProduct(
  product: SeedProduct,
  adminId: string,
  storeId: string,
  onCreated: () => void,
  onSkipped: () => void,
) {
  let catalogRoot = await prisma.products.findUnique({
    where: { slug: product.slug },
    select: { id: true },
  });

  if (catalogRoot) {
    onSkipped();
  } else {
    const folder = productFolder(product.title);
    const images = [];
    for (const [index, assetKey] of product.images.entries()) {
      images.push(await uploadImage(assetKey, folder, `${product.slug}-${index + 1}`));
    }

    catalogRoot = await prisma.products.create({
      data: {
        title: product.title,
        slug: product.slug,
        isCatalog: true,
        category: product.category,
        subCategory: product.subCategory,
        short_description: product.short_description,
        tags: product.tags,
        sizes: product.sizes,
        sizePricing: null,
        cuttingTypes: product.cuttingTypes,
        pieceSizes: product.pieceSizes,
        processingWeightLoss: product.weightLoss,
        stock: 0,
        sale_price: 0,
        regular_price: 0,
        origin: product.origin,
        source: product.source,
        shelfLife: product.shelfLife,
        storageInstructions: STORAGE,
        cookingTips: product.cookingTips,
        highlightDescription: product.highlight,
        nutritionProtein: product.nutrition.protein,
        nutritionOmega3: product.nutrition.omega3,
        nutritionCalories: product.nutrition.calories,
        cashOnDelivery: "yes",
        discount_codes: [],
        isDeleted: false,
        admin: { connect: { id: adminId } },
        images: {
          create: images.map((image) => ({
            file_id: image.file_id,
            url: image.url,
            type: "PRODUCT" as const,
          })),
        },
      },
    });

    onCreated();
    console.log(`  ✓ ${product.title}`);
  }

  // A run that dies between the two creates leaves a catalog root with no
  // store variant, and a catalog root on its own is never buyable — so the
  // variant is checked separately instead of riding on the create above.
  const variantSlug = `${product.slug}-${storeId.slice(-6)}`;
  const variant = await prisma.products.findUnique({
    where: { slug: variantSlug },
    select: { id: true },
  });
  if (variant) return;

  const sizePricing = buildSizePricing(product);
  const cheapest = sizePricing.reduce((low, entry) =>
    entry.salePrice < low.salePrice ? entry : low,
  );

  await prisma.products.create({
    data: {
      title: product.title,
      slug: variantSlug,
      isCatalog: false,
      category: product.category,
      subCategory: product.subCategory,
      short_description: product.short_description,
      tags: product.tags,
      sizes: product.sizes,
      sizePricing,
      cuttingTypes: product.cuttingTypes,
      cuttingTypePricing: buildCuttingTypePricing(product),
      pieceSizes: product.pieceSizes,
      pieceSizePricing: buildPieceSizePricing(product),
      processingWeightLoss: product.weightLoss,
      basePricePerKg: product.pricePerKg,
      pricingMethod: "per_kg",
      stock: product.stock,
      sale_price: cheapest.salePrice,
      regular_price: cheapest.regularPrice,
      totalSold: product.totalSold,
      ratings: product.ratings,
      cashOnDelivery: "yes",
      discount_codes: [],
      status: "Active",
      isDeleted: false,
      store: { connect: { id: storeId } },
      catalogProduct: { connect: { id: catalogRoot.id } },
    },
  });
}

/**
 * Store variants for catalog products that were created before this seed and
 * have no variant yet — without one they never appear on the storefront.
 */
async function seedMissingVariants(storeId: string) {
  // Prisma leaves unset optional relation scalars off the document entirely, and
  // `storeId: null` compiles to a strict null match that skips a missing field —
  // so every catalog root created through the admin UI was invisible here. isSet
  // is the only filter that matches both an absent field and an explicit null.
  const orphans = await prisma.products.findMany({
    where: {
      adminId: { not: null },
      storeId: { isSet: false },
      catalogProductId: { isSet: false },
      isDeleted: { not: true },
      slug: { notIn: PRODUCTS.map((p) => p.slug) },
    },
    select: { id: true, title: true, slug: true, category: true, subCategory: true, short_description: true, tags: true, sizes: true, cuttingTypes: true, pieceSizes: true, processingWeightLoss: true },
  });

  let created = 0;
  let skipped = 0;
  for (const catalog of orphans) {
    const hasVariant = await prisma.products.findFirst({
      where: { catalogProductId: catalog.id, storeId },
      select: { id: true },
    });
    if (hasVariant || !catalog.slug) {
      skipped++;
      continue;
    }

    const sizes = catalog.sizes.length > 0 ? catalog.sizes : ["1kg"];
    const sizePricing = sizes.map((size) => {
      const grams = parseWeightToGrams(size);
      const regularPrice = roundPrice((500 * grams) / 1000);
      return { size, weightGrams: grams, regularPrice, salePrice: roundPrice(regularPrice * 0.9) };
    });
    const cheapest = sizePricing.reduce((low, e) => (e.salePrice < low.salePrice ? e : low));

    await prisma.products.create({
      data: {
        title: catalog.title,
        slug: `${catalog.slug}-${storeId.slice(-6)}`,
        isCatalog: false,
        category: catalog.category,
        subCategory: catalog.subCategory,
        short_description: catalog.short_description,
        tags: catalog.tags,
        sizes,
        sizePricing,
        cuttingTypes: catalog.cuttingTypes,
        pieceSizes: catalog.pieceSizes,
        processingWeightLoss: catalog.processingWeightLoss,
        basePricePerKg: 500,
        pricingMethod: "per_kg",
        stock: 25,
        sale_price: cheapest.salePrice,
        regular_price: cheapest.regularPrice,
        cashOnDelivery: "yes",
        discount_codes: [],
        status: "Active",
        isDeleted: false,
        store: { connect: { id: storeId } },
        catalogProduct: { connect: { id: catalog.id } },
      },
    });
    created++;
    console.log(`  ✓ variant for existing catalog product "${catalog.title}"`);
  }

  console.log(`🔗 Variants: ${created} backfilled, ${skipped} already present`);
}

async function seedBanners(adminId: string, sellerId: string) {
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const banner of BANNERS) {
    try {
      const existing = await prisma.banners.findFirst({
        where: { title: banner.title },
        select: { id: true },
      });
      if (existing) {
        skipped++;
        continue;
      }

      let imageUrl = "";
      let fileId = "";
      if (banner.image) {
        const folder =
          banner.bannerType === "category" && banner.category
            ? `${CLOUD_FOLDER}/banners/category/${cloudinarySegment(banner.category)}/images`
            : `${CLOUD_FOLDER}/banners/homepage`;
        const uploaded = await uploadImage(
          banner.image,
          folder,
          cloudinarySegment(banner.title),
        );
        imageUrl = uploaded.url;
        fileId = uploaded.file_id;
      }

      // getAnnouncementBanners resolves announcements through the sellers
      // covering the shopper's pincode, so an admin-owned one never renders.
      const owner =
        banner.bannerType === "announcement"
          ? { seller: { connect: { id: sellerId } } }
          : { admin: { connect: { id: adminId } } };

      await prisma.banners.create({
        data: {
          imageUrl,
          fileId,
          isActive: true,
          status: "APPROVED",
          bannerType: banner.bannerType,
          category: banner.category ?? null,
          title: banner.title,
          subtitle: banner.subtitle,
          price: banner.price ?? null,
          ...owner,
        },
      });
      created++;
      console.log(`  ✓ ${banner.title}`);
    } catch (error) {
      failed++;
      console.warn(`  ✗ ${banner.title}: ${reason(error)}`);
    }
  }

  console.log(
    `🖼️  Banners: ${created} created, ${skipped} already present` +
      (failed > 0 ? `, ${failed} failed` : ""),
  );
}

async function seedCoupons(sellerId: string) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 3);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const coupon of COUPONS) {
    try {
      const existing = await prisma.discount_codes.findUnique({
        where: { discountCode: coupon.discountCode },
        select: { id: true },
      });
      if (existing) {
        skipped++;
        continue;
      }
      await prisma.discount_codes.create({
        data: {
          public_name: coupon.public_name,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountCode: coupon.discountCode,
          minOrderValue: coupon.minOrderValue,
          expiresAt,
          maxUses: coupon.maxUses,
          maxUsesPerUser: coupon.maxUsesPerUser,
          isFirstOrder: coupon.isFirstOrder,
          isActive: true,
          seller: { connect: { id: sellerId } },
        },
      });
      created++;
    } catch (error) {
      failed++;
      console.warn(`  ✗ ${coupon.discountCode}: ${reason(error)}`);
    }
  }

  console.log(
    `🏷️  Coupons: ${created} created, ${skipped} already present` +
      (failed > 0 ? `, ${failed} failed` : ""),
  );
}

async function seedEvents(sellerId: string) {
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const event of EVENTS) {
    try {
      const existing = await prisma.seller_events.findFirst({
        where: { title: event.title, sellerId },
        select: { id: true },
      });
      if (existing) {
        skipped++;
        continue;
      }

      const startTime = new Date();
      startTime.setDate(startTime.getDate() + event.startsInDays);
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + event.endsInDays);

      await prisma.seller_events.create({
        data: {
          sellerId,
          title: event.title,
          description: event.description,
          type: event.type,
          minOrder: event.minOrder,
          discount: event.discount,
          startTime,
          endTime,
          isActive: true,
        },
      });
      created++;
    } catch (error) {
      failed++;
      console.warn(`  ✗ ${event.title}: ${reason(error)}`);
    }
  }

  console.log(
    `🎉 Events: ${created} created, ${skipped} already present` +
      (failed > 0 ? `, ${failed} failed` : ""),
  );
}

/* ─── Entry point ────────────────────────────────────────────────────────── */

// One bad step used to take the whole seed down with it — banners, coupons and
// events never ran because a single product image stalled the catalog step.
async function runStep(name: string, step: () => Promise<void>) {
  try {
    await step();
  } catch (error) {
    console.error(`❌ ${name} step failed, moving on: ${reason(error)}`);
  }
}

async function main() {
  const admin = await prisma.admins.findFirst({ orderBy: { createdAt: "asc" } });
  if (!admin) {
    throw new Error(
      "No admin found. Sign up an admin first — catalog products need an owner.",
    );
  }

  const store = await prisma.stores.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, sellerId: true },
  });
  if (!store) {
    throw new Error(
      "No store found. Register a seller and create their store first — products need a storefront to be sold from.",
    );
  }

  console.log(`🌱 Seeding for admin "${admin.name}" and store "${store.name}"\n`);

  await runStep("Categories", () => seedCategories());
  await runStep("Products", () => seedProducts(admin.id, store.id));
  await runStep("Variants", () => seedMissingVariants(store.id));
  await runStep("Banners", () => seedBanners(admin.id, store.sellerId));
  await runStep("Coupons", () => seedCoupons(store.sellerId));
  await runStep("Events", () => seedEvents(store.sellerId));

  // Search results come from Meilisearch, not Mongo, so seeded products stay
  // invisible to search until they are indexed.
  try {
    const { reindexAllProducts } = await import(
      "./apps/product-service/src/lib/meilisearch.js"
    );
    const indexed = await reindexAllProducts();
    console.log(`🔍 Meilisearch: reindexed ${indexed} store products`);
  } catch (error) {
    console.warn(
      `⚠️  Meilisearch reindex skipped (${error instanceof Error ? error.message : error}). Run it later from the admin dashboard.`,
    );
  }
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
