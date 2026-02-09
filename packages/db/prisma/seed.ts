import { PrismaClient } from "../src/generated/client.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Checking existing data...");

  /**
   * 1️⃣ USER
   */
  const user = await prisma.users.upsert({
    where: { phone_number: "9999999999" },
    update: {},
    create: {
      name: "Test User",
      phone_number: "9999999999",
      following: [],
    },
  });

  /**
   * 2️⃣ SELLER
   */
  const seller = await prisma.sellers.upsert({
    where: { email: "seller@fish.com" },
    update: {},
    create: {
      name: "Fish Seller",
      email: "seller@fish.com",
      phone_number: "8888888888",
      password: "hashed-password",
      following: [],
    },
  });

  /**
   * 3️⃣ STORE
   */
  const store =
    (await prisma.stores.findFirst({
      where: { sellerId: seller.id },
    })) ??
    (await prisma.stores.create({
      data: {
        name: "Fresh Fish Store",
        bio: "Best fresh fish in town",
        address: "Fish Market Road",
        city: "Kolkata",
        pincode: "700001",
        opening_hours: "8AM - 9PM",
        sellerId: seller.id,
      },
    }));

  /**
   * 4️⃣ PRODUCTS (check once)
   */
  const existingProducts = await prisma.products.findFirst({
    where: { storeId: store.id },
  });

  if (!existingProducts) {
    console.log("🐟 Seeding products...");

    await prisma.products.createMany({
      data: [
        {
          title: "Tilapia Fish",
          slug: "tilapia-fish-4",
          category: "Fresh Water",
          subCategory: "Tilapia",
          short_description: "Fresh Tilapia fish",
          detailed_description: "<p>Healthy freshwater Tilapia</p>",
          tags: ["tilapia", "fresh"],
          sizes: ["500 gm", "1 kg"],
          cuttingTypes: ["Whole", "Curry Cut"],
          pieceSizes: ["medium", "large"],
          processingWeightLoss: "5-8%",
          stock: 15,
          sale_price: 180,
          regular_price: 240,
          totalSold: 40,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Pabda Fish",
          slug: "pabda-fish-7",
          category: "Fresh Water",
          subCategory: "Pabda",
          short_description: "Fresh Pabda fish",
          detailed_description: "<p>Soft and tasty Pabda fish</p>",
          tags: ["pabda", "fresh"],
          sizes: ["250 gm", "500 gm"],
          cuttingTypes: ["Whole"],
          pieceSizes: ["small"],
          processingWeightLoss: "4-6%",
          stock: 12,
          sale_price: 260,
          regular_price: 320,
          totalSold: 22,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },

        // -------- Sea Fish --------
        {
          title: "Indian Mackerel",
          slug: "indian-mackerel-6",
          category: "Sea Fish",
          subCategory: "Mackerel",
          short_description: "Fresh sea Mackerel",
          detailed_description: "<p>Rich in omega-3</p>",
          tags: ["mackerel", "sea"],
          sizes: ["500 gm", "1 kg"],
          cuttingTypes: ["Whole"],
          pieceSizes: ["medium"],
          processingWeightLoss: "6-9%",
          stock: 20,
          sale_price: 190,
          regular_price: 250,
          totalSold: 65,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Fresh Prawns",
          slug: "fresh-prawns-1",
          category: "Sea Fish",
          subCategory: "Prawn",
          short_description: "Juicy sea prawns",
          detailed_description: "<p>Perfect for curry & fry</p>",
          tags: ["prawn", "seafood"],
          sizes: ["250 gm", "500 gm"],
          cuttingTypes: ["Cleaned"],
          pieceSizes: ["medium"],
          processingWeightLoss: "10-15%",
          stock: 18,
          sale_price: 420,
          regular_price: 520,
          totalSold: 80, // 🔥 strong seller
          cashOnDelivery: "no",
          discount_codes: [],
          storeId: store.id,
        },

        // -------- Premium Sea Food --------
        {
          title: "King Crab",
          slug: "king-crab-3",
          category: "Premium Sea Food",
          subCategory: "King Crab",
          short_description: "Premium King Crab",
          detailed_description: "<p>Luxury seafood item</p>",
          tags: ["crab", "premium"],
          sizes: ["1 kg", "2 kg"],
          cuttingTypes: ["Whole"],
          pieceSizes: ["large"],
          processingWeightLoss: "8-12%",
          stock: 5,
          sale_price: 3200,
          regular_price: 3800,
          totalSold: 12,
          cashOnDelivery: "no",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Lobster",
          slug: "lobster-premium-8",
          category: "Premium Sea Food",
          subCategory: "Lobster",
          short_description: "Fresh premium lobster",
          detailed_description: "<p>Restaurant-grade lobster</p>",
          tags: ["lobster", "premium"],
          sizes: ["1 kg"],
          cuttingTypes: ["Whole"],
          pieceSizes: ["large"],
          processingWeightLoss: "10%",
          stock: 4,
          sale_price: 4500,
          regular_price: 5200,
          totalSold: 9,
          cashOnDelivery: "no",
          discount_codes: [],
          storeId: store.id,
        },

        // -------- Pet Serve --------
        {
          title: "Pet Fish Mix",
          slug: "pet-fish-mix",
          category: "Pet Serve",
          subCategory: "Pet Fish Selection",
          short_description: "Nutritious fish for pets",
          detailed_description: "<p>Healthy mix for pets</p>",
          tags: ["pet", "nutrition"],
          sizes: ["1 kg"],
          cuttingTypes: ["Whole"],
          pieceSizes: ["small"],
          processingWeightLoss: "2-4%",
          stock: 25,
          sale_price: 120,
          regular_price: 160,
          totalSold: 35,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Chicken Offal",
          slug: "chicken-offal",
          category: "Pet Serve",
          subCategory: "Chicken Offal",
          short_description: "Protein-rich pet food",
          detailed_description: "<p>Best for dogs & cats</p>",
          tags: ["pet", "chicken"],
          sizes: ["1 kg"],
          cuttingTypes: ["Cleaned"],
          pieceSizes: ["medium"],
          processingWeightLoss: "3%",
          stock: 30,
          sale_price: 140,
          regular_price: 180,
          totalSold: 50,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },

        // -------- Extra Sea Fish --------
        {
          title: "Squid Rings",
          slug: "squid-rings",
          category: "Sea Fish",
          subCategory: "Squid",
          short_description: "Fresh squid rings",
          detailed_description: "<p>Ideal for frying</p>",
          tags: ["squid", "seafood"],
          sizes: ["500 gm"],
          cuttingTypes: ["Rings"],
          pieceSizes: ["medium"],
          processingWeightLoss: "6%",
          stock: 14,
          sale_price: 380,
          regular_price: 450,
          totalSold: 28,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Sardine Fish",
          slug: "sardine-fish",
          category: "Sea Fish",
          subCategory: "Sardine",
          short_description: "Fresh sardine fish",
          detailed_description: "<p>High protein sea fish</p>",
          tags: ["sardine", "sea"],
          sizes: ["500 gm", "1 kg"],
          cuttingTypes: ["Whole"],
          pieceSizes: ["small"],
          processingWeightLoss: "5%",
          stock: 22,
          sale_price: 160,
          regular_price: 210,
          totalSold: 60,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Bengali Rohu",
          slug: "bengali-rohu-38",
          category: "Fresh Water",
          subCategory: "Rui/Rohu",
          short_description: "Fresh Bengali Rohu",
          detailed_description: "<p>Fresh and tasty Rohu</p>",
          tags: ["fresh", "rohu"],
          sizes: ["250 gm", "500 gm", "1 kg"],
          cuttingTypes: ["Whole", "Phile", "Thole"],
          pieceSizes: ["small", "medium", "large"],
          processingWeightLoss: "5-10%",
          stock: 10,
          sale_price: 200,
          regular_price: 300,
          totalSold: 120, // 🔥 BEST SELLER
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Katla Fish",
          slug: "katla-fish-09",
          category: "Fresh Water",
          subCategory: "Katla/Catla",
          short_description: "Fresh Katla Fish",
          detailed_description: "<p>Healthy Katla fish</p>",
          tags: ["katla", "fresh"],
          sizes: ["500 gm", "1 kg"],
          cuttingTypes: ["Whole", "Curry Cut"],
          pieceSizes: ["medium", "large"],
          processingWeightLoss: "5-8%",
          stock: 8,
          sale_price: 220,
          regular_price: 320,
          totalSold: 95, // 🔥 BEST SELLER
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Hilsa Fish",
          slug: "hilsa-fish-8",
          category: "Fresh Water",
          subCategory: "Hilsa",
          short_description: "Premium Hilsa Fish",
          detailed_description: "<p>Premium quality Hilsa</p>",
          tags: ["hilsa", "premium"],
          sizes: ["500 gm", "1 kg"],
          cuttingTypes: ["Whole"],
          pieceSizes: ["large"],
          processingWeightLoss: "6-10%",
          stock: 5,
          sale_price: 900,
          regular_price: 1100,
          totalSold: 30,
          cashOnDelivery: "no",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Pomfret Fish",
          slug: "pomfret-fish-81",
          category: "Sea Fish",
          subCategory: "Pomfret",
          short_description: "Fresh Pomfret Fish",
          detailed_description: "<p>Sea fresh Pomfret</p>",
          tags: ["pomfret", "sea"],
          sizes: ["500 gm"],
          cuttingTypes: ["Whole"],
          pieceSizes: ["medium"],
          processingWeightLoss: "4-7%",
          stock: 6,
          sale_price: 450,
          regular_price: 550,
          totalSold: 15,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Fish for Pets",
          slug: "fish-for-pets",
          category: "Pet Serve",
          subCategory: "Fish for Pets",
          short_description: "Fish for pet food",
          detailed_description: "<p>Healthy fish for pets</p>",
          tags: ["pet", "fish"],
          sizes: ["1 kg"],
          cuttingTypes: ["Whole"],
          pieceSizes: ["large"],
          processingWeightLoss: "3-5%",
          stock: 12,
          sale_price: 150,
          regular_price: 200,
          totalSold: 10,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },

        {
          title: "Tilapia Fish",
          slug: "tilapia-fish",
          category: "Fresh Water",
          subCategory: "Tilapia",
          short_description: "Fresh Tilapia fish",
          detailed_description: "<p>Healthy freshwater Tilapia</p>",
          tags: ["tilapia", "fresh"],
          sizes: ["500 gm", "1 kg"],
          cuttingTypes: ["Whole", "Curry Cut"],
          pieceSizes: ["medium", "large"],
          processingWeightLoss: "5-8%",
          stock: 15,
          sale_price: 180,
          regular_price: 240,
          totalSold: 40,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },
        {
          title: "Bengali Rohu",
          slug: "bengali-rohu",
          category: "Fresh Water",
          subCategory: "Rui/Rohu",
          short_description: "Fresh Bengali Rohu",
          detailed_description: "<p>Fresh and tasty Rohu</p>",
          tags: ["fresh", "rohu"],
          sizes: ["250 gm", "500 gm", "1 kg"],
          cuttingTypes: ["Whole", "Phile", "Thole"],
          pieceSizes: ["small", "medium", "large"],
          processingWeightLoss: "5-10%",
          stock: 10,
          sale_price: 200,
          regular_price: 300,
          totalSold: 120,
          cashOnDelivery: "yes",
          discount_codes: [],
          storeId: store.id,
        },
      ],
    });
  } else {
    console.log("✅ Products already exist — skipping");
  }

  /**
   * 5️⃣ FAVORITES
   */
  const favoritesExist = await prisma.favorites.findFirst({
    where: { userId: user.id },
  });

  if (!favoritesExist) {
    const products = await prisma.products.findMany({ take: 4 });

    await prisma.favorites.createMany({
      data: products.map((p) => ({
        userId: user.id,
        productId: p.id,
      })),
    });
  }

  console.log("✅ Seeding completed safely!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
