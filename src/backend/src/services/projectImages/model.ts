import { prisma } from "../../../prisma/client";


export const createProjectImage = async (data: { bucket: string; filename: string }) => {
  return await prisma.projectImage.create({
    data: {
      ...data,
      order: 0,
      isFeatured: false
    }
  })
}

export const getProjectImages = async (bucket: string) => {
  return await prisma.projectImage.findMany({
    where: { bucket },
    orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }]
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