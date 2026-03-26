import { prismaMongo as prisma } from "@repo/db-mongo";
import cron from "node-cron";

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();

    await prisma.products.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lte: now },
      },
    });
  } catch (error) {
    (console.log("(Cron Job) Error during deleting product"), error);
  }
});
