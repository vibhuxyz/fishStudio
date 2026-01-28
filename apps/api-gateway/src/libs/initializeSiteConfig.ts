import { prisma } from "@repo/db";

const initializeConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();

    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: ["Fish", "Meat", "vegetables"],
          subCategories: {
            fish: ["Salmon", "Tuna", "Trout"],
            meat: [
              "Beef",
              "Chicken",
              "Pork",
              "Mutton",
              "Lamb",
              "Goat",
              "Sheep",
              "Veal",
              "Turkey",
              "Duck",
              "Pheasant",
              "Quail",
            ],
            vegetables: ["Carrot", "Cucumber", "Spinach"],
          },
        },
      });
    }
  } catch (error) {
    console.log("Error During Initialization of Site Config", error);
  }
};

export default initializeConfig;
