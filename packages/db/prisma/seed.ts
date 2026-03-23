import { PrismaClient } from "../src/generated/client.js";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

// Setup readline interface for terminal prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask yes/no questions
function askQuestion(query:any) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

async function main() {
  console.log("🌱 Checking existing data...");

  /**
   * 1️⃣ USER
   */
  let user = await prisma.users.findUnique({
    where: { phone_number: "9999999999" },
  });

  if (user) {
    console.log("✅ User already exists — skipping");
  } else {
    const shouldSeed = await askQuestion(
      "❓ Do you want to seed the Test User? (y/n): ",
    );
    if (shouldSeed) {
      user = await prisma.users.create({
        data: {
          name: "Test User",
          phone_number: "9999999999",
          following: [],
        },
      });
      console.log("✅ User seeded successfully!");
    } else {
      console.log("⏭️  Skipped User.");
    }
  }

  /**
   * 2️⃣ SELLER
   */
  let seller = await prisma.sellers.findUnique({
    where: { email: "seller@fish.com" },
  });

  if (seller) {
    console.log("✅ Seller already exists — skipping");
  } else {
    const shouldSeed = await askQuestion(
      "❓ Do you want to seed the Fish Seller? (y/n): ",
    );
    if (shouldSeed) {
      const plainPassword = "123456";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      seller = await prisma.sellers.create({
        data: {
          name: "Fish Seller",
          email: "seller@fish.com",
          phone_number: "8888888888",
          password: hashedPassword,
          following: [],
        },
      });
      console.log("✅ Seller seeded successfully!");
    } else {
      console.log("⏭️  Skipped Seller.");
    }
  }

  /**
   * 3️⃣ STORE
   */
  let store = seller
    ? await prisma.stores.findFirst({ where: { sellerId: seller.id } })
    : null;

  if (store) {
    console.log("✅ Store already exists — skipping");
  } else {
    const shouldSeed = await askQuestion(
      "❓ Do you want to seed the Fresh Fish Store? (y/n): ",
    );
    if (shouldSeed) {
      // If we don't have a seller from above, try to find ANY seller in the database
      let targetSeller = seller || (await prisma.sellers.findFirst());

      if (!targetSeller) {
        console.log(
          "❌ Cannot seed Store: No Seller exists in the database. Please seed a Seller first.",
        );
      } else {
        store = await prisma.stores.create({
          data: {
            name: "Fresh Fish Store",
            bio: "Best fresh fish in town",
            address: "Fish Market Road",
            city: "Kolkata",
            pincode: "700001",
            opening_hours: "8AM - 9PM",
            sellerId: targetSeller.id,
          },
        });
        console.log("✅ Store seeded successfully!");
      }
    } else {
      console.log("⏭️  Skipped Store.");
    }
  }

  /**
   * 4️⃣ PRODUCTS WITH IMAGES
   */
  let existingProducts = store
    ? await prisma.products.findFirst({ where: { storeId: store.id } })
    : null;

  if (existingProducts) {
    console.log("✅ Products already exist — skipping");
  } else {
    const shouldSeed = await askQuestion(
      "❓ Do you want to seed Products with images? (y/n): ",
    );
    if (shouldSeed) {
      let targetStore = store || (await prisma.stores.findFirst());

      if (!targetStore) {
        console.log(
          "❌ Cannot seed Products: No Store exists in the database. Please seed a Store first.",
        );
      } else {
        console.log("🐟 Seeding products with images...");

        const productsWithImages = [
          // -------- Fresh Water Fish --------
          {
            product: {
              title: "Bengali Rohu",
              slug: "bengali-rohu-fresh-water",
              category: "Fresh Water",
              subCategory: "Rui/Rohu",
              short_description:
                "Fresh Bengali Rohu fish, perfect for traditional Bengali cuisine. Rich in omega-3 and protein.",
              detailed_description:
                "<p>Fresh and tasty Rohu fish, ideal for Bengali curries and traditional recipes. Known for its tender meat and rich flavor.</p>",
              tags: ["rohu", "fresh", "bengali", "traditional"],
              sizes: ["250g", "500g", "1kg"],
              cuttingTypes: ["Whole", "Curry Cut", "Fillet"],
              pieceSizes: ["Small", "Medium", "Large"],
              processingWeightLoss: "5-10%",
              stock: 10,
              sale_price: 200,
              regular_price: 300,
              totalSold: 120,
              ratings: 4.8,
              cashOnDelivery: "Yes",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "rohu_fish_1",
                url: "https://ik.imagekit.io/pay/rohu.jpg?updatedAt=1770539184817",
              },
              {
                file_id: "rohu_fish_2",
                url: "https://ik.imagekit.io/pay/hilsa.jpg?updatedAt=1770539184767",
              },
            ],
          },
          {
            product: {
              title: "Katla Fish",
              slug: "katla-fish-fresh-water",
              category: "Fresh Water",
              subCategory: "Katla/Catla",
              short_description:
                "Fresh Katla fish with firm texture and mild flavor. Great for grilling and frying.",
              detailed_description:
                "<p>Healthy Katla fish, perfect for grilling, frying, or making delicious curry. High in protein and low in fat.</p>",
              tags: ["katla", "fresh", "healthy"],
              sizes: ["500g", "1kg", "2kg"],
              cuttingTypes: ["Whole", "Curry Cut", "Steaks"],
              pieceSizes: ["Medium", "Large"],
              processingWeightLoss: "5-8%",
              stock: 8,
              sale_price: 220,
              regular_price: 320,
              totalSold: 95,
              ratings: 4.6,
              cashOnDelivery: "Yes",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "katla_fish_1",
                url: "https://ik.imagekit.io/pay/katla.jpg?updatedAt=1770539184787",
              },
              {
                file_id: "katla_fish_2",
                url: "https://ik.imagekit.io/pay/hilsa.jpg?updatedAt=1770539184767",
              },
              {
                file_id: "katla_fish_3",
                url: "https://ik.imagekit.io/pay/katla.jpg?updatedAt=1770539184787",
              },
            ],
          },
          {
            product: {
              title: "Hilsa Fish Premium",
              slug: "hilsa-fish-premium-fresh-water",
              category: "Fresh Water",
              subCategory: "Hilsa",
              short_description:
                "Premium quality Hilsa fish, the king of fish in Bengali cuisine. Rich, oily, and flavorful.",
              detailed_description:
                "<p>Premium quality Hilsa fish, known for its rich taste and high omega-3 content. Perfect for special occasions and traditional Bengali preparations.</p>",
              tags: ["hilsa", "premium", "bengali", "special"],
              sizes: ["500g", "1kg"],
              cuttingTypes: ["Whole", "Sliced"],
              pieceSizes: ["Large"],
              processingWeightLoss: "6-10%",
              stock: 5,
              sale_price: 900,
              regular_price: 1100,
              totalSold: 30,
              ratings: 4.9,
              cashOnDelivery: "No",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "hilsa_fish_1",
                url: "https://ik.imagekit.io/pay/hilsa.jpg?updatedAt=1770539184767",
              },
              {
                file_id: "hilsa_fish_2",
                url: "https://ik.imagekit.io/pay/katla.jpg?updatedAt=1770539184787",
              },
            ],
          },
          {
            product: {
              title: "Tilapia Fish",
              slug: "tilapia-fish-fresh-water",
              category: "Fresh Water",
              subCategory: "Tilapia",
              short_description:
                "Fresh Tilapia fish with mild flavor and firm texture. Healthy and versatile.",
              detailed_description:
                "<p>Healthy freshwater Tilapia, low in calories and high in protein. Perfect for grilling, baking, or frying.</p>",
              tags: ["tilapia", "fresh", "healthy", "versatile"],
              sizes: ["500g", "1kg"],
              cuttingTypes: ["Whole", "Curry Cut", "Fillet"],
              pieceSizes: ["Medium", "Large"],
              processingWeightLoss: "5-8%",
              stock: 15,
              sale_price: 180,
              regular_price: 240,
              totalSold: 40,
              ratings: 4.4,
              cashOnDelivery: "Yes",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "tilapia_fish_1",
                url: "https://ik.imagekit.io/pay/tilapia.jpg?updatedAt=1770539184626",
              },
              {
                file_id: "tilapia_fish_2",
                url: "https://ik.imagekit.io/pay/tilapia.jpg?updatedAt=1770539184626",
              },
            ],
          },
          {
            product: {
              title: "Pabda Fish",
              slug: "pabda-fish-fresh-water",
              category: "Fresh Water",
              subCategory: "Pabda",
              short_description:
                "Fresh Pabda fish, small and delicate with soft texture. Perfect for Bengali style curry.",
              detailed_description:
                "<p>Soft and tasty Pabda fish, ideal for traditional Bengali preparations. Known for its delicate flavor and tender meat.</p>",
              tags: ["pabda", "fresh", "delicate", "bengali"],
              sizes: ["250g", "500g"],
              cuttingTypes: ["Whole"],
              pieceSizes: ["Small", "Medium"],
              processingWeightLoss: "4-6%",
              stock: 12,
              sale_price: 260,
              regular_price: 320,
              totalSold: 22,
              ratings: 4.5,
              cashOnDelivery: "Yes",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "pabda_fish_1",
                url: "https://ik.imagekit.io/pay/hilsa.jpg?updatedAt=1770539184767",
              },
              {
                file_id: "pabda_fish_2",
                url: "https://ik.imagekit.io/pay/hilsa.jpg?updatedAt=1770539184767",
              },
            ],
          },

          // -------- Sea Fish --------
          {
            product: {
              title: "Indian Mackerel",
              slug: "indian-mackerel-sea-fish",
              category: "Sea Fish",
              subCategory: "Mackerel",
              short_description:
                "Fresh sea Mackerel, rich in omega-3 fatty acids. Great for frying and grilling.",
              detailed_description:
                "<p>Rich in omega-3 and packed with nutrients. Perfect for shallow frying or grilling with minimal spices.</p>",
              tags: ["mackerel", "sea", "omega3", "healthy"],
              sizes: ["500g", "1kg"],
              cuttingTypes: ["Whole", "Cleaned"],
              pieceSizes: ["Medium"],
              processingWeightLoss: "6-9%",
              stock: 20,
              sale_price: 190,
              regular_price: 250,
              totalSold: 65,
              ratings: 4.6,
              cashOnDelivery: "Yes",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "mackerel_1",
                url: "https://ik.imagekit.io/pay/mackerel.jpg?updatedAt=1770539184395",
              },
              {
                file_id: "mackerel_2",
                url: "https://ik.imagekit.io/pay/mackerel.jpg?updatedAt=1770539184395",
              },
            ],
          },
          {
            product: {
              title: "Fresh Prawns",
              slug: "fresh-prawns-sea-fish",
              category: "Sea Fish",
              subCategory: "Prawn",
              short_description:
                "Juicy sea prawns, perfect for curry and fry. Rich in protein and minerals.",
              detailed_description:
                "<p>Perfect for curry & fry. Fresh from the sea, these prawns are juicy, flavorful, and packed with protein.</p>",
              tags: ["prawn", "seafood", "protein", "premium"],
              sizes: ["250g", "500g", "1kg"],
              cuttingTypes: ["Whole", "Cleaned", "Deveined"],
              pieceSizes: ["Medium", "Large"],
              processingWeightLoss: "10-15%",
              stock: 18,
              sale_price: 420,
              regular_price: 520,
              totalSold: 80,
              ratings: 4.7,
              cashOnDelivery: "No",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "prawn_1",
                url: "https://ik.imagekit.io/pay/prawns.jpg?updatedAt=1770539184792",
              },
              {
                file_id: "prawn_2",
                url: "https://ik.imagekit.io/pay/prawns.jpg?updatedAt=1770539184792",
              },
            ],
          },
          {
            product: {
              title: "Pomfret Fish",
              slug: "pomfret-fish-sea-fish",
              category: "Sea Fish",
              subCategory: "Pomfret",
              short_description:
                "Fresh Pomfret fish with delicate flavor and fine texture. Premium quality.",
              detailed_description:
                "<p>Sea fresh Pomfret with delicate flavor and fine texture. Perfect for steaming, frying, or grilling.</p>",
              tags: ["pomfret", "sea", "premium", "delicate"],
              sizes: ["500g", "1kg"],
              cuttingTypes: ["Whole", "Cleaned"],
              pieceSizes: ["Medium", "Large"],
              processingWeightLoss: "4-7%",
              stock: 6,
              sale_price: 450,
              regular_price: 550,
              totalSold: 15,
              ratings: 4.8,
              cashOnDelivery: "Yes",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "pomfret_1",
                url: "https://ik.imagekit.io/pay/pomfret.jpg?updatedAt=1770539184631",
              },
              {
                file_id: "pomfret_2",
                url: "https://ik.imagekit.io/pay/pomfret.jpg?updatedAt=1770539184631",
              },
            ],
          },
          {
            product: {
              title: "Sardine Fish",
              slug: "sardine-fish-sea-fish",
              category: "Sea Fish",
              subCategory: "Sardine",
              short_description:
                "Fresh sardine fish, high in protein and omega-3. Perfect for frying.",
              detailed_description:
                "<p>High protein sea fish, rich in omega-3 fatty acids. Perfect for shallow frying with spices.</p>",
              tags: ["sardine", "sea", "protein", "omega3"],
              sizes: ["500g", "1kg"],
              cuttingTypes: ["Whole", "Cleaned"],
              pieceSizes: ["Small", "Medium"],
              processingWeightLoss: "5%",
              stock: 22,
              sale_price: 160,
              regular_price: 210,
              totalSold: 60,
              ratings: 4.4,
              cashOnDelivery: "Yes",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "sardine_1",
                url: "https://ik.imagekit.io/pay/rohu.jpg?updatedAt=1770539184817",
              },
              {
                file_id: "sardine_2",
                url: "https://ik.imagekit.io/pay/rohu.jpg?updatedAt=1770539184817",
              },
            ],
          },
          {
            product: {
              title: "Squid Rings",
              slug: "squid-rings-sea-fish",
              category: "Sea Fish",
              subCategory: "Squid",
              short_description:
                "Fresh squid rings, ideal for frying and grilling. Tender and flavorful.",
              detailed_description:
                "<p>Ideal for frying and grilling. Pre-cut into rings for your convenience. Tender, flavorful, and versatile.</p>",
              tags: ["squid", "seafood", "rings", "versatile"],
              sizes: ["500g", "1kg"],
              cuttingTypes: ["Rings", "Whole"],
              pieceSizes: ["Medium"],
              processingWeightLoss: "6%",
              stock: 14,
              sale_price: 380,
              regular_price: 450,
              totalSold: 28,
              ratings: 4.5,
              cashOnDelivery: "Yes",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "squid_1",
                url: "https://ik.imagekit.io/pay/rohu.jpg?updatedAt=1770539184817",
              },
              {
                file_id: "squid_2",
                url: "https://ik.imagekit.io/pay/rohu.jpg?updatedAt=1770539184817",
              },
            ],
          },

          // -------- Premium Sea Food --------
          {
            product: {
              title: "King Crab",
              slug: "king-crab-premium-sea-food",
              category: "Premium Sea Food",
              subCategory: "King Crab",
              short_description:
                "Premium King Crab, luxury seafood item. Sweet and succulent meat.",
              detailed_description:
                "<p>Luxury seafood item with sweet, succulent meat. Perfect for special occasions and gourmet preparations.</p>",
              tags: ["crab", "premium", "luxury", "gourmet"],
              sizes: ["1kg", "2kg"],
              cuttingTypes: ["Whole", "Legs"],
              pieceSizes: ["Large"],
              processingWeightLoss: "8-12%",
              stock: 5,
              sale_price: 3200,
              regular_price: 3800,
              totalSold: 12,
              ratings: 5.0,
              cashOnDelivery: "No",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "king_crab_1",
                url: "https://ik.imagekit.io/pay/lobster.jpg?updatedAt=1770539184409",
              },
              {
                file_id: "king_crab_2",
                url: "https://ik.imagekit.io/pay/lobster.jpg?updatedAt=1770539184409",
              },
            ],
          },
          {
            product: {
              title: "Lobster",
              slug: "lobster-premium-sea-food",
              category: "Premium Sea Food",
              subCategory: "Lobster",
              short_description:
                "Fresh premium lobster, restaurant-grade quality. Tender and flavorful.",
              detailed_description:
                "<p>Restaurant-grade lobster with tender, flavorful meat. Perfect for grilling, steaming, or making gourmet dishes.</p>",
              tags: ["lobster", "premium", "restaurant", "gourmet"],
              sizes: ["1kg", "2kg"],
              cuttingTypes: ["Whole", "Tails"],
              pieceSizes: ["Large"],
              processingWeightLoss: "10%",
              stock: 4,
              sale_price: 4500,
              regular_price: 5200,
              totalSold: 9,
              ratings: 5.0,
              cashOnDelivery: "No",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "lobster_1",
                url: "https://ik.imagekit.io/pay/lobster.jpg?updatedAt=1770539184409",
              },
              {
                file_id: "lobster_2",
                url: "https://ik.imagekit.io/pay/lobster.jpg?updatedAt=1770539184409",
              },
            ],
          },

          // -------- Pet Serve --------
          {
            product: {
              title: "Pet Fish Mix",
              slug: "pet-fish-mix-pet-serve",
              category: "Pet Serve",
              subCategory: "Pet Fish Selection",
              short_description:
                "Nutritious fish mix for pets. Healthy and affordable pet food option.",
              detailed_description:
                "<p>Healthy mix for pets, packed with nutrients. Perfect for dogs and cats as a protein-rich meal supplement.</p>",
              tags: ["pet", "nutrition", "healthy", "affordable"],
              sizes: ["1kg", "2kg"],
              cuttingTypes: ["Whole", "Cut Pieces"],
              pieceSizes: ["Small", "Medium"],
              processingWeightLoss: "2-4%",
              stock: 25,
              sale_price: 120,
              regular_price: 160,
              totalSold: 35,
              ratings: 4.3,
              cashOnDelivery: "Yes",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "pet_fish_1",
                url: "https://ik.imagekit.io/pay/mackerel.jpg?updatedAt=1770539184395",
              },
              {
                file_id: "pet_fish_2",
                url: "https://ik.imagekit.io/pay/mackerel.jpg?updatedAt=1770539184395",
              },
            ],
          },
          {
            product: {
              title: "Chicken Offal for Pets",
              slug: "chicken-offal-pet-serve",
              category: "Pet Serve",
              subCategory: "Chicken Offal",
              short_description:
                "Protein-rich chicken offal for pets. Best for dogs and cats.",
              detailed_description:
                "<p>Best for dogs & cats. Rich in protein and essential nutrients. A healthy and economical pet food option.</p>",
              tags: ["pet", "chicken", "protein", "nutritious"],
              sizes: ["1kg", "2kg"],
              cuttingTypes: ["Cleaned", "Mixed"],
              pieceSizes: ["Medium"],
              processingWeightLoss: "3%",
              stock: 30,
              sale_price: 140,
              regular_price: 180,
              totalSold: 50,
              ratings: 4.4,
              cashOnDelivery: "Yes",
              discount_codes: [],
              status: "Active",
              storeId: targetStore.id,
            },
            images: [
              {
                file_id: "chicken_offal_1",
                url: "https://ik.imagekit.io/pay/mackerel.jpg?updatedAt=1770539184395",
              },
              {
                file_id: "chicken_offal_2",
                url: "https://ik.imagekit.io/pay/mackerel.jpg?updatedAt=1770539184395",
              },
            ],
          },
        ];

        for (const item of productsWithImages) {
          await prisma.products.create({
            //@ts-ignore
            data: {
              ...item.product,
              images: {
                create: item.images.map((img) => ({
                  ...img,
                  type: "PRODUCT",
                })),
              },
            },
          });
        }
        console.log("✅ Products with images seeded successfully!");
      }
    } else {
      console.log("⏭️  Skipped Products.");
    }
  }

  /**
   * 5️⃣ BANNERS
   */
  let existingBanners = seller
    ? await prisma.banners.findFirst({ where: { sellerId: seller.id } })
    : null;

  if (existingBanners) {
    console.log("✅ Banners already exist — skipping");
  } else {
    const shouldSeed = await askQuestion(
      "❓ Do you want to seed Banners? (y/n): ",
    );
    if (shouldSeed) {
      let targetSeller = seller || (await prisma.sellers.findFirst());

      if (!targetSeller) {
        console.log(
          "❌ Cannot seed Banners: No Seller exists in the database. Please seed a Seller first.",
        );
      } else {
        console.log("📸 Seeding banners...");
        const bannerData = [
          {
            imageUrl: "https://ik.imagekit.io/pay/offer-3.jpg",
            fileId: "offer-3.jpg",
            isActive: true,
            sellerId: targetSeller.id,
          },
          {
            imageUrl: "https://ik.imagekit.io/pay/offer-2.jpg",
            fileId: "offer-2.jpg",
            isActive: true,
            sellerId: targetSeller.id,
          },
          {
            imageUrl: "https://ik.imagekit.io/pay/offer-1.jpg",
            fileId: "offer-1.jpg",
            isActive: true,
            sellerId: targetSeller.id,
          },
          {
            imageUrl: "https://ik.imagekit.io/pay/offer-4.jpg",
            fileId: "offer-4.jpg",
            isActive: true,
            sellerId: targetSeller.id,
          },
        ];

        await prisma.banners.createMany({ data: bannerData });
        console.log("✅ Banners seeded successfully!");
      }
    } else {
      console.log("⏭️  Skipped Banners.");
    }
  }

  /**
   * 6️⃣ FAVORITES
   */
  let favoritesExist = user
    ? await prisma.favorites.findFirst({ where: { userId: user.id } })
    : null;

  if (favoritesExist) {
    console.log("✅ Favorites already exist — skipping");
  } else {
    const shouldSeed = await askQuestion(
      "❓ Do you want to seed Favorites? (y/n): ",
    );
    if (shouldSeed) {
      let targetUser = user || (await prisma.users.findFirst());
      const availableProducts = await prisma.products.findMany({ take: 5 });

      if (!targetUser) {
        console.log(
          "❌ Cannot seed Favorites: No User exists in the database.",
        );
      } else if (availableProducts.length === 0) {
        console.log(
          "⚠️ Cannot seed Favorites: No Products exist in the database to favorite.",
        );
      } else {
        await prisma.favorites.createMany({
          data: availableProducts.map((p) => ({
            userId: targetUser.id,
            productId: p.id,
          })),
        });
        console.log("✅ Favorites seeded successfully!");
      }
    } else {
      console.log("⏭️  Skipped Favorites.");
    }
  }

  console.log("\n🎉 Seeding process completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    rl.close();
  });
