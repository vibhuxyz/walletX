import { PrismaClient } from '../node_modules/.prisma/mongo-client';

const globalForMongo = globalThis as unknown as {
  mongo: PrismaClient | undefined;
};

export const prismaMongo = globalForMongo.mongo ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.mongo = prismaMongo;
}
