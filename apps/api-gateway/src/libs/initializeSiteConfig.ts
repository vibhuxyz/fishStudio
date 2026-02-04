import { prisma } from "@repo/db";

const initializeConfig = async () => {
  try {
    // Check if configuration already exists to avoid duplicates
    const existingConfig = await prisma.site_config.findFirst();

    if (!existingConfig) {
      // Create the site configuration with comprehensive product options
      await prisma.site_config.create({
        data: {
          // Main product categories based on the Jalongi interface
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

          // Detailed subcategories for each main category
          subCategories: {
            // Fresh Water Fish - Local and popular freshwater varieties
            freshWater: [
              "Rui/Rohu",
              "Katla/Catla",
              "Hilsa",
              "Aar/Singhara",
              "Pabda",
              "Tilapia",
            ],

            // Sea Fish - Salt water fish varieties
            seaFish: [
              "Pomfret",
              "Mackerel",
              "Sardine",
              "Prawn",
              "Crab",
              "Squid",
              "Anchovy",
            ],

            // Premium/High-end seafood products
            premiumSeaFood: [
              "Premium Prawns",
              "King Crab",
              "Lobster",
              "Premium Fish Selection",
              "Sea Urchin",
              "Scallops",
            ],

            // Meat and Poultry products
            meatPoultry: [
              "Chicken - Whole",
              "Chicken - Pieces",
              "Mutton",
              "Lamb",
              "Goat",
              "Beef",
              "Pork",
            ],

            // Pre-prepared frying items
            fryReady: [
              "Fish Fry Mix",
              "Prawn Fry Mix",
              "Chicken Fry Mix",
              "Fish Fingers",
              "Shrimp Cutlets",
            ],

            // Special prepared/cooked items (Moms Magic)
            momsMagic: [
              "Fish Curry Mix",
              "Fish Tandoori Mix",
              "Prawn Biryani Kit",
              "Fish Masala",
              "Ready to Cook Fish",
            ],

            // Rice and spice combinations
            riceSpice: [
              "Basmati Rice",
              "Biryani Rice",
              "Fish Masala Powder",
              "Fry Masala",
              "Curry Powder",
              "Spice Blends",
            ],

            // Pet food products
            petServe: [
              "Fish for Pets",
              "Chicken Offal",
              "Nutritional Mix",
              "Pet Fish Selection",
            ],
          },

          // Available sizes for different fish types
          // Maps subcategory to available weight ranges
          sizes: {
            // Rui/Rohu comes in different weight categories
            "Rui/Rohu": [
              "< 500 gm",
              "500 gm - 1 Kg",
              "1 Kg - 2 Kg",
              "2 Kg - 3 Kg",
              "> 3 Kg",
            ],

            // Katla/Catla larger varieties
            "Katla/Catla": [
              "< 500 gm",
              "500 gm - 1 Kg",
              "1 Kg - 2 Kg",
              "2 Kg - 3 Kg",
              "> 3 Kg",
            ],

            // Hilsa specific sizes
            Hilsa: ["< 500 gm", "500 gm - 1 Kg", "1 Kg - 1.5 Kg", "> 1.5 Kg"],

            // Tilapia comes in smaller portions
            Tilapia: ["< 500 gm", "500 gm - 1 Kg"],

            // Aar/Singhara medium sizes
            "Aar/Singhara": [
              "< 500 gm",
              "500 gm - 1 Kg",
              "1 Kg - 2 Kg",
              "> 2 Kg",
            ],

            // Pabda small to medium
            Pabda: ["< 250 gm", "250 gm - 500 gm", "500 gm - 1 Kg"],

            // Sea fish varieties
            Pomfret: ["< 500 gm", "500 gm - 1 Kg", "> 1 Kg"],

            // Default sizes for unmapped products
            default: ["< 500 gm", "500 gm - 1 Kg", "1 Kg - 2 Kg", "> 2 Kg"],
          },

          // Different ways to cut fish for different cooking methods
          cuttingTypes: [
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
          ],

          // Piece sizes for cut fish - how to portion the pieces
          pieceSizes: [
            {
              id: "extra_small",
              name: "Extra Small",
              range: "20-40 gm",
              description: "Very small pieces, ideal for frying or appetizers",
              useCase: "Fry, Appetizers",
            },
            {
              id: "small",
              name: "Small",
              range: "40-60 gm",
              description: "Small pieces, good for various cooking methods",
              useCase: "Fry, Curry, Grill",
            },
            {
              id: "medium",
              name: "Medium",
              range: "60-80 gm",
              description: "Medium-sized pieces, versatile for most dishes",
              useCase: "Curry, Tandoori, Grill, Fry",
            },
            {
              id: "large",
              name: "Large",
              range: "80-100 gm",
              description: "Large pieces, ideal for substantial portions",
              useCase: "Tandoori, Grill, Curry",
            },
            {
              id: "extra_large",
              name: "Extra Large",
              range: "> 100 gm",
              description: "Extra large pieces for premium presentation",
              useCase: "Special Occasions, Premium Dishes",
            },
            {
              id: "whole_small_fish",
              name: "Whole Small Fish",
              range: "100-150 gm",
              description: "Small whole fish (e.g., Tilapia, small Pomfret)",
              useCase: "Whole Fish Cooking",
            },
          ],

          // Weight loss information for different cutting types
          // Represents the percentage of weight lost during processing
          processingWeightLoss: {
            whole: 0,
            // Description: Whole fish with gutting/cleaning
            gutted: {
              min: 15,
              max: 25,
              description:
                "Weight loss from gutting, cleaning and removing head/tail",
            },
            // Description: Fillet preparation removes bones and skin
            fillet: {
              min: 35,
              max: 45,
              description: "Weight loss from removing bones, skin and waste",
            },
            // Description: Steaks - moderate waste from cutting
            steaks: {
              min: 10,
              max: 15,
              description: "Weight loss from cross-cutting and trimming",
            },
            // Description: Minced has significant processing loss
            minced: {
              min: 20,
              max: 30,
              description: "Weight loss from grinding and moisture release",
            },
            // Description: Head only - no processing loss
            head: 0,
            // Description: Default for other types
            default: {
              min: 5,
              max: 10,
              description: "Standard processing weight loss",
            },
          },

          // Pricing tiers based on quantity purchased
          // Helps implement bulk pricing strategies
          // pricingTiers: {
          //   retail: {
          //     name: "Retail",
          //     minQuantity: 0,
          //     maxQuantity: 1,
          //     discount: 0,
          //     description: "Single unit purchase",
          //   },
          //   small_bulk: {
          //     name: "Small Bulk",
          //     minQuantity: 2,
          //     maxQuantity: 5,
          //     discount: 5,
          //     description: "2-5 kg purchase",
          //   },
          //   medium_bulk: {
          //     name: "Medium Bulk",
          //     minQuantity: 6,
          //     maxQuantity: 10,
          //     discount: 10,
          //     description: "6-10 kg purchase",
          //   },
          //   large_bulk: {
          //     name: "Large Bulk",
          //     minQuantity: 11,
          //     maxQuantity: 25,
          //     discount: 15,
          //     description: "11-25 kg purchase",
          //   },
          //   wholesale: {
          //     name: "Wholesale",
          //     minQuantity: 26,
          //     maxQuantity: null,
          //     discount: 20,
          //     description: "26+ kg purchase",
          //   },
          // },
        },
      });

      console.log("✅ Site configuration initialized successfully!");
    } else {
      console.log(
        "ℹ️ Site configuration already exists. Skipping initialization.",
      );
    }
  } catch (error) {
    console.error("❌ Error During Initialization of Site Config:", error);
    throw error;
  }
};

export default initializeConfig;
