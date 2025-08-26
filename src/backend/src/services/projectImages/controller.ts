import { Elysia, t } from "elysia";
import {
  getProjectImages,
} from "./model";

// Completely isolated controller - NO JWT dependencies
export const projectImageController = new Elysia({ prefix: "/project-images" })
  .get("/test", ({ set }) => {
    console.log('[ProjectImages] Test endpoint called - v2');
    set.status = 200;
    return {
      status: 200,
      message: "Project images test endpoint working - v2",
      timestamp: new Date().toISOString(),
      version: "2025-08-27-cache-fix"
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
          version: "2025-08-27-cache-fix"
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