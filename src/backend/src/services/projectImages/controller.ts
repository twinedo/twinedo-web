import { Elysia, t } from "elysia";
import { getProjectImages } from "./model";
import { prisma } from "../../../prisma/client";

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
  );