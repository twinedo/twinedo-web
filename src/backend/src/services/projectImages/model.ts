import { prisma } from "../../../prisma/client";

export const createProjectImage = async (data: { bucket: string; filename: string, blobUrl: string }) => {
  return await prisma.projectImage.create({
    data: {
      ...data,
      order: 0,
      isFeatured: false,
      blobUrl: data.blobUrl,
    }
  })
}

export const getProjectImages = async (bucket: string) => {
  return await prisma.projectImage.findMany({
    where: { bucket },
    orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
    select: { 
      id: true, 
      bucket: true,
      filename: true,
      isFeatured: true,
      isThumbnail: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      blobUrl: true 
    }
  })
}

export const updateProjectImage = async (id: string, data: { 
  isFeatured?: boolean; 
  order?: number 
}) => {
  return await prisma.projectImage.update({
    where: { id },
    data
  })
}

export const deleteProjectImage = async (id: string) => {
  return await prisma.projectImage.delete({ where: { id } })
}

export const connectImagesToProject = async (bucket: string, projectId: string) => {
  return await prisma.projectImage.updateMany({
    where: { bucket },
    data: { bucket: projectId } // Or keep bucket and add projectId if needed
  })
}