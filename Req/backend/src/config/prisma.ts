import { PrismaClient } from '@prisma/client';

// Create a global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client instance
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
};

// Use global variable in development to prevent multiple instances
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
