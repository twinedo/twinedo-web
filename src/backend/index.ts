/* eslint-disable @typescript-eslint/no-explicit-any */
// FORCE DEPLOYMENT 2025-08-27: Clear project-images cache issue
// JWT error persists due to Vercel route-specific caching
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { cvController } from "./src/services/cv";
import { experienceController } from "./src/services/experience";
import { projectController } from "./src/services/projects";
import { projectImageController } from "./src/services/projectImages";
import { authController } from "./src/services/auth";
import { prisma } from "./prisma/client";

const app = new Elysia({ prefix: "/api" })
  .get('/health', () => ({ ok: true }))
  .get('/health/db', async () => {
    // minimal DB check
    await prisma.$queryRaw`SELECT 1`
    return { db: 'ok' }
  })
  .get('/debug/env', () => ({
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasPublicJwtSecret: !!process.env.NEXT_PUBLIC_JWT_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV
  }))
  .use(cors())
  .get("/", () => ("Hello from Elysia!"))
  .get("/images/:bucket", async ({ params: { bucket }, set }) => {
    try {
      // Import the function directly here to bypass controller caching
      const { prisma } = await import('./prisma/client');
      const images = await prisma.projectImage.findMany({
        where: { bucket },
        orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
        select: { 
          id: true, 
          bucket: true,
          filename: true,
          isFeatured: true,
          isThumbnail: true,
          order: true,
          createdAt: true,
          updatedAt: true,
          blobUrl: true 
        }
      });
      set.status = 200;
      return {
        status: 200,
        message: "Get project images successfully - bypass route",
        data: images,
        version: "cache-bypass-v1"
      };
    } catch (error) {
      set.status = 500;
      return {
        status: 500,
        message: "Failed to get project images",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .use(experienceController)
  .use(cvController)           
  .use(projectController)      
  .use(projectImageController)
  .use(authController)         
  .use(
    swagger({
      documentation: {
        info: {
          title: "Portfolio API",
          version: "1.0.0",
        },
        tags: [
          { name: "Project Images", description: "Image management endpoints" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        // Remove the global security: [{ bearerAuth: [] }] here
      },
    })
  )
  .onError(({ code, error, request }) => {
    console.error('[ElysiaError]', {
      code,
      method: request.method,
      url: request.url,
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
    return new Response('Internal error', { status: 500 });
  });

// console.log(
//   `🦊 Backend running at http://${app.server}:${app.server?.port}`
// );
export const GET = app.handle as any;
export const POST = app.handle as any;
export const PATCH = app.handle as any;
export const DELETE = app.handle as any;
export const PUT = app.handle as any;

export default app;
export type App = typeof app;