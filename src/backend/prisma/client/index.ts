// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Factory so we can infer the exact returned type (after $extends)
const createPrisma = () => {
  // Check if we should use direct database connection (for Vercel deployment)
  const useDirectConnection = process.env.VERCEL === '1' && process.env.DIRECT_DATABASE_URL;
  
  if (useDirectConnection) {
    console.log('Creating Prisma client with direct database connection');
    return new PrismaClient({
      datasources: { db: { url: process.env.DIRECT_DATABASE_URL } },
    });
  } else {
    console.log('Creating Prisma client with Accelerate connection');
    return new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    }).$extends(withAccelerate());
  }
}

// Use the factory's return type here
type Prisma = ReturnType<typeof createPrisma>

// Keep a singleton in dev
const globalForPrisma = globalThis as unknown as { prisma?: Prisma }

export const prisma: Prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}