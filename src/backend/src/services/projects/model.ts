import { prisma } from "../../../prisma/client";
import type { Platform, ProjectInput, ProjectUpdateInput } from "./types";
import { parseDescription } from "./utils";

export const createProject = async (data: ProjectInput) => {
  return await prisma.project.create({
    data: {
      ...data,
      description: JSON.stringify(parseDescription(data.description)),
    },
  });
};

export const getProjects = async (filter?: { platform?: Platform }) => {
  const projects = await prisma.project.findMany({
    where: filter,
    orderBy: { year: "desc" },
  });

  return projects.map(
    (proj: {
      id: string;
      year: string;
      platform: string;
      tag: string;
      project_name: string;
      description: string;
      link_appstore: string | null;
      link_playstore: string | null;
      link_website: string | null;
      display: string;
      bucket: string;
      createdAt: Date;
      updatedAt: Date;
    }) => {
      return {
        ...proj,
        description: Array.isArray(proj.description)
          ? proj.description
          : [proj.description],
        link_appstore: proj.link_appstore || "", // Fallback to empty string
        link_playstore: proj.link_playstore || "",
        link_website: proj.link_website || "",
      };
    }
  );
};

export const getProject = async (id: string) => {
  const project = await prisma.project.findUnique({ where: { id } });
  return project
    ? {
        ...project,
        description: JSON.parse(project.description),
      }
    : null;
};

export const updateProject = async (id: string, data: ProjectUpdateInput) => {
  const updateData = { ...data };

  if (data.description !== undefined) {
    updateData.description = JSON.stringify(parseDescription(data.description));
  }

  // Ensure description is string or undefined
  if (Array.isArray(updateData.description)) {
    updateData.description = JSON.stringify(updateData.description);
  }

  return await prisma.project.update({
    where: { id },
    data: updateData as Omit<typeof updateData, "description"> & {
      description?: string;
    },
  });
};

export const deleteProject = async (id: string) => {
  return await prisma.project.delete({ where: { id } });
};
