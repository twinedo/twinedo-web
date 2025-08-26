import { Elysia, t } from "elysia";
import { getProjectImages } from "./model";

// SIMPLE PUBLIC CONTROLLER - ZERO JWT DEPENDENCIES
export const projectImageController = new Elysia({ prefix: "/project-images" })
  .get(
    "/:bucket",
    async ({ params: { bucket }, set }) => {
      try {
        const images = await getProjectImages(bucket);
        set.status = 200;
        return {
          status: 200,
          message: "Get project images successfully",
          data: images,
        };
      } catch (error) {
        set.status = 500;
        return {
          status: 500,
          message: "Failed to get project images",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      params: t.Object({
        bucket: t.String(),
      }),
    }
  );