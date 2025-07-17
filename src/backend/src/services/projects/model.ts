
import { prisma } from '../../../prisma/client';
import type { Platform, ProjectInput, ProjectUpdateInput } from './types';
import { parseDescription } from './utils.ts';

export const createProject = async (data: ProjectInput) => {
  return await prisma.project.create({
    data: {
      ...data,
      description: JSON.stringify(parseDescription(data.description))
    }
  });
};

export const getProjects = async (filter?: { platform?: Platform }) => {
  const projects = await prisma.project.findMany({
    where: filter,
    orderBy: { year: 'desc' }
  });
  
  return projects.map(proj => ({
    ...proj,
    description: JSON.parse(proj.description)
  }));
};

export const getProject = async (id: string) => {
  const project = await prisma.project.findUnique({ where: { id } });
  return project ? {
    ...project,
    description: JSON.parse(project.description)
  } : null;
};

export const updateProject = async (id: string, data: ProjectUpdateInput) => {
  const updateData = { ...data };
  
  if (data.description !== undefined) {
    updateData.description = JSON.stringify(parseDescription(data.description));
  }

  return await prisma.project.update({
    where: { id },
    data: updateData
  });
};

export const deleteProject = async (id: string) => {
  return await prisma.project.delete({ where: { id } });
};