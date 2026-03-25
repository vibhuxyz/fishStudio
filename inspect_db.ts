import { prisma } from './packages/db/src/index.ts';

async function main() {
  console.log('--- Restoring Products ---');
  const result = await prisma.products.updateMany({
    where: {
      isDeleted: true,
    },
    data: {
      isDeleted: false,
      deletedAt: null,
    }
  });
  console.log(`Updated ${result.count} products.`);

  console.log('\n--- Verifying Store Variants ---');
  const storeVariants = await prisma.products.findMany({
    where: {
      catalogProductId: { not: null },
    },
    select: {
      id: true,
      title: true,
      status: true,
      isDeleted: true,
      stock: true,
      storeId: true,
    }
  });
  console.log(JSON.stringify(storeVariants, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
