import { Elysia, t } from "elysia";
import { getProjectImages, createProjectImage, updateProjectImage, deleteProjectImage } from "./model";
import { prisma } from "../../../prisma/client";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import { jwtProps } from "../../utils/const";
import { adminMiddleware } from "../auth/adminMiddleware";

// SIMPLE PUBLIC CONTROLLER - ZERO JWT DEPENDENCIES
export const projectImageController = new Elysia({ prefix: "/project-images" })
  .get("/test-db", async ({ set }) => {
    try {
      // Test basic database connection without projectImage table
      await prisma.$queryRaw`SELECT 1 as test`;
      
      // Test ProjectImage table existence and count
      const count = await prisma.projectImage.count();
      
      // Test getting distinct buckets
      const buckets = await prisma.projectImage.groupBy({
        by: ['bucket'],
        _count: { bucket: true }
      });
      
      set.status = 200;
      return {
        status: 200,
        message: "Database and ProjectImage table test successful",
        data: {
          totalRecords: count,
          availableBuckets: buckets
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      set.status = 500;
      return {
        status: 500,
        message: "Database test failed",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
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
  )
  // Protected routes for admin
  .use(jwt(jwtProps))
  .use(bearer())
  .post(
    "/upload",
    async ({ body, set }) => {
      try {
        // For now, we'll handle simple metadata creation
        // File upload to blob storage would be handled separately
        const imageData = {
          bucket: body.bucket,
          filename: body.filename,
          blobUrl: body.blobUrl || `https://example.com/${body.bucket}/${body.filename}`,
        };
        
        const image = await createProjectImage(imageData);
        set.status = 201;
        return {
          status: 201,
          message: "Project image uploaded successfully",
          data: image,
        };
      } catch (error) {
        set.status = 500;
        return {
          status: 500,
          message: "Failed to upload project image",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      beforeHandle: adminMiddleware(),
      body: t.Object({
        bucket: t.String(),
        filename: t.String(),
        blobUrl: t.Optional(t.String())
      })
    }
  )
  .patch(
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const image = await updateProjectImage(id, body);
        set.status = 200;
        return {
          status: 200,
          message: "Project image updated successfully",
          data: image,
        };
      } catch (error) {
        set.status = 500;
        return {
          status: 500,
          message: "Failed to update project image",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      beforeHandle: adminMiddleware(),
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        isFeatured: t.Optional(t.Boolean()),
        order: t.Optional(t.Number())
      })
    }
  )
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        await deleteProjectImage(id);
        set.status = 200;
        return {
          status: 200,
          message: "Project image deleted successfully",
          data: {},
        };
      } catch (error) {
        set.status = 500;
        return {
          status: 500,
          message: "Failed to delete project image",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      beforeHandle: adminMiddleware(),
      params: t.Object({
        id: t.String()
      })
    }
  );