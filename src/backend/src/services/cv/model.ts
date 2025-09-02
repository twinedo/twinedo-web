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
  return await prisma.cV.findFirst()
}