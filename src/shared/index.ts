import type { ApiErrorResponse, ApiSuccessResponse } from "./types/api";
import type { ProfileProps } from "./types/profile";
import type { Project, ProjectImage } from "./types/project";
import { successResponse, errorResponse } from "./helper/api-response";
import type { Experience , ExperienceInput, ExperienceUpdateInput } from './features/experiences'

export type {
  ApiErrorResponse,
  ApiSuccessResponse,

  ProfileProps,
  Project,
  ProjectImage,

  Experience,
  ExperienceInput,
  ExperienceUpdateInput
};

export {
    successResponse, errorResponse,
}