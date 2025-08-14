// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Factory so we can infer the exact returned type (after $extends)
const createPrisma = () =>
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  }).$extends(withAccelerate())

// Use the factory's return type here
type Prisma = ReturnType<typeof createPrisma>

// Keep a singleton in dev
const globalForPrisma = globalThis as unknown as { prisma?: Prisma }

export const prisma: Prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
