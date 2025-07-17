import { ApiSuccessResponse, Project, ProjectImage, ApiErrorResponse } from "@/shared";
import { useQuery } from "@tanstack/react-query";

export const getProjects = async (platform?: 'mobile' | 'website'): Promise<Project[]> => {
  const response = await fetch(`/api/project?platform=${platform}`);

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
    }));
    throw new Error(errorData.message || "Failed to fetch projects");
  }

  const resData: ApiSuccessResponse<Project[]> = await response.json();
  return resData.data;
};

export const useGetProjects = (platform?: 'mobile' | 'website') => {
  return useQuery({ queryKey: ["useGetProjects", platform], queryFn: () => getProjects(platform), staleTime: 60_000 });
};

const getProjectById = async (id: string): Promise<Project> => {
  const response = await fetch(`/api/project/${id}`);

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
    }));
    throw new Error(errorData.message || "Failed to fetch projects");
  }

  const resData: ApiSuccessResponse<Project> = await response.json();
  return resData.data;
}; 

export const useGetProjectById = (id: string) => {
  return useQuery({ queryKey: ["useGetProjectById", id], queryFn: () => getProjectById(id), staleTime: 60_000 });
};

const getProjectImages = async (bucket: string): Promise<ProjectImage[]> => {
  const response = await fetch(`/api/project-images/${bucket}`);

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText,
    }));
    throw new Error(errorData.message || "Failed to fetch projects");
  }

  const resData: ApiSuccessResponse<ProjectImage[]> = await response.json();
  return resData.data;
}; 

export const useGetProjectImages = (bucket: string) => {
  return useQuery({ queryKey: ["useGetProjectImages", bucket], queryFn: () => getProjectImages(bucket) });
};