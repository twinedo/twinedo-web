import { Elysia, t } from "elysia";
import {
  getProjectImages,
} from "./model";

// Create completely isolated controller for testing
export const projectImageController = new Elysia({ prefix: "/project-images" })
  .get("/test", ({ set }) => {
    console.log('[ProjectImages] Test endpoint called');
    set.status = 200;
    return {
      status: 200,
      message: "Project images test endpoint working",
      timestamp: new Date().toISOString()
    };
  })
  .get(
    "/:bucket",
    async ({ params: { bucket }, set }) => {
      try {
        console.log('[ProjectImages] Getting images for bucket:', bucket);
        const images = await getProjectImages(bucket);
        console.log('[ProjectImages] Found', images.length, 'images');
        
        set.status = 200;
        return {
          status: 200,
          message: "Get project images successfully",
          data: images,
        };
      } catch (error) {
        console.error('[ProjectImages] Error getting images:', error);
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