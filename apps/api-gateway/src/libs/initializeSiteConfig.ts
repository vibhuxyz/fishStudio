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
