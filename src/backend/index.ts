/* eslint-disable @typescript-eslint/no-explicit-any */
// Force deployment update: 2025-08-27 - Fixed JWT caching issue
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