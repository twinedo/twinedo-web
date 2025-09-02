// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Create Prisma client with proper configuration for both development and production
const createPrisma = () => {
  // Check if we should use direct database connection (for Vercel deployment)
  const useDirectConnection = process.env.VERCEL === '1' && process.env.DIRECT_DATABASE_URL;
  
  if (useDirectConnection) {
    console.log('Creating Prisma client with direct database connection');
    return new PrismaClient({
      datasources: { db: { url: process.env.DIRECT_DATABASE_URL } },
    });
  } else {
    console.log('Creating Prisma client with regular connection');
    return new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });
  }
}

// Keep a singleton in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}