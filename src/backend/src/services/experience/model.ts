import { prisma } from "../../../prisma/client";
import { epochToYyyyMm, yyyyMmToEpoch, epochToReadable } from "../../utils/dateUtils";
import type { ExperienceInput, ExperienceUpdateInput } from "../../../../shared";

export const createExperience = async (data: ExperienceInput) => {
  if (!data.startDate) {
    throw new Error('Start date is required');
  }

  return await prisma.experience.create({ 
    data: {
      ...data,
      startDate: yyyyMmToEpoch(data.startDate),
      endDate: data.endDate ? yyyyMmToEpoch(data.endDate) : null,
      description:  data.description || [],
    }
  });
};

export const getExperiences = async () => {
  const experiences = await prisma.experience.findMany({
    orderBy: [
      { endDate: 'desc' },
      { startDate: 'desc' }
    ]
  });

  return experiences.map(exp => ({
    ...exp,
    startDate: epochToYyyyMm(exp.startDate),
    endDate: exp.endDate ? epochToYyyyMm(exp.endDate) : null,
    description: exp.description,
    // Add readable format for display
    startDateReadable: epochToReadable(exp.startDate),
    endDateReadable: exp.endDate ? epochToReadable(exp.endDate) : 'Present',
  }));
};

export const getExperience = async (id: string) => {
  const experience = await prisma.experience.findUnique({ where: { id } });
  if (!experience) return null;

  return {
    ...experience,
    startDate: epochToYyyyMm(experience.startDate),
    endDate: experience.endDate ? epochToYyyyMm(experience.endDate) : null,
    startDateReadable: epochToReadable(experience.startDate),
    endDateReadable: experience.endDate ? epochToReadable(experience.endDate) : 'Present',
  };
};

export const updateExperience = async (id: string, data: Partial<ExperienceUpdateInput>) => {
  const { startDate, endDate, description, ...rest } = data;
  
  const updateData: any = { ...rest };
  
  if (startDate !== undefined) {
    updateData.startDate = yyyyMmToEpoch(startDate);
  }
  
  if (endDate !== undefined) {
    updateData.endDate = endDate ? yyyyMmToEpoch(endDate) : null;
  }

  // Handle description array properly
  if (description !== undefined) {
    updateData.description = description || [];
  }

  const updated = await prisma.experience.update({
    where: { id },
    data: updateData
  });

  // Return with readable format
  return {
    ...updated,
    startDate: epochToYyyyMm(updated.startDate),
    endDate: updated.endDate ? epochToYyyyMm(updated.endDate) : null,
    startDateReadable: epochToReadable(updated.startDate),
    endDateReadable: updated.endDate ? epochToReadable(updated.endDate) : 'Present',
  };
};

export const deleteExperience = async (id: string) => {
  return await prisma.experience.delete({ where: { id } });
};