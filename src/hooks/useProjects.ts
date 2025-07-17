import { getProjects } from "@/services/projects";
import { Project } from "@/shared";
import { useEffect, useState } from "react";

export const useProjects = (platform: "mobile" | "website") => {
  const [data, setData] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    setIsLoading(true);
    const getProjectByPlatform = async () => {
      try {
        const response = await getProjects(platform);
        setData(response);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    getProjectByPlatform();
  }, [platform]);

  return { data, error, isLoading };
};
