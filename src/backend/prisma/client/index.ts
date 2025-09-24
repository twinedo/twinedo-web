// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Create Prisma client with proper configuration for both development and production
const createPrisma = () => {
  // Check if we should use direct database connection (for Vercel deployment)
  const useDirectConnection = process.env.VERCEL === '1' && process.env.DIRECT_DATABASE_URL;
  
  if (useDirectConnection) {
    console.log('Creating Prisma client with direct database connection');
    return new PrismaClient({
      datasources: { db: { url: process.env.DIRECT_DATABASE_URL } },
    });
  }

  const shouldUseAccelerate = process.env.DATABASE_URL?.startsWith('prisma://');

  console.log(shouldUseAccelerate ? 'Creating Prisma client with Accelerate' : 'Creating Prisma client with regular connection');

  const client = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

  return shouldUseAccelerate ? client.$extends(withAccelerate()) : client;
}

type PrismaClientInstance = ReturnType<typeof createPrisma>;

// Keep a singleton in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientInstance };

export const prisma: PrismaClientInstance = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
