import { PrismaClient } from '../prisma/generated-client';

const globalForMongo = globalThis as unknown as {
  mongo: PrismaClient | undefined;
};

export const prismaMongo = globalForMongo.mongo ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.mongo = prismaMongo;
}

// Check database connection
prismaMongo.$connect()
  .then(() => {
    console.log("MongoDB is connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error: ", error.message);
  });
