import { prisma } from "../../../prisma/client"

export const createOrUpdateCV = async (filename: string, blobUrl?: string) => {
  // Delete all existing CV records (since we only want one)
  await prisma.cV.deleteMany({})
  
  // Create new record
  return await prisma.cV.create({
    data: { filename, blobUrl }
  })
}

export const getCV = async () => {
  try {
    return await prisma.cV.findFirst()
  } catch (error) {
    // If blobUrl column doesn't exist, select only existing columns
    if (error instanceof Error && 'code' in error && error.code === 'P2022' && error.message.includes('blobUrl')) {
      return await prisma.cV.findFirst({
        select: {
          id: true,
          filename: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }
    throw error;
  }
}