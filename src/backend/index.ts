/* eslint-disable @typescript-eslint/no-explicit-any */
// FORCE DEPLOYMENT 2025-09-02: Clear CV download cache issue
// JWT error persists due to Vercel route-specific caching
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { cvController } from "./src/services/cv";
import { experienceController } from "./src/services/experience";
import { projectController } from "./src/services/projects";
import { projectImageController } from "./src/services/projectImages";
import { authController } from "./src/services/auth";
import bcrypt from "bcryptjs";
import { prisma } from './prisma/client';
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { resolveCVUploadDir } from "./src/utils/paths";

const app = new Elysia({ prefix: "/api" })
  .get('/health', () => ({ ok: true }))
  .get('/health/db', async () => {
    try {
      // minimal DB check
      await prisma.$queryRaw`SELECT 1`;
      return { db: 'ok' };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { db: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  })
  .get('/debug/env', () => ({
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasPublicJwtSecret: !!process.env.NEXT_PUBLIC_JWT_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasDirectDatabaseUrl: !!process.env.DIRECT_DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    databaseUrl: process.env.DATABASE_URL?.substring(0, 50) + '...' || 'Not set'
  }))
  // Setup endpoint to create admin user
  .post('/setup-admin', async ({ set, body }) => {
    try {
      const { password } = body as { password: string };
      
      if (!password) {
        set.status = 400;
        return { status: 400, message: "Password is required" };
      }
      
      // Check if admin user already exists
      const existingAdmin = await prisma.user.findUnique({
        where: { email: "twinedo.dev@gmail.com" }
      });
      
      if (existingAdmin) {
        set.status = 400;
        return { status: 400, message: "Admin user already exists" };
      }
      
      // Create admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      const adminUser = await prisma.user.create({
        data: {
          email: "twinedo.dev@gmail.com",
          password: hashedPassword,
          role: "superadmin"
        }
      });
      
      set.status = 201;
      return { 
        status: 201, 
        message: "Admin user created successfully",
        data: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role
        }
      };
    } catch (error) {
      console.error("Setup admin error:", error);
      set.status = 500;
      return { 
        status: 500, 
        message: "Failed to create admin user",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  })
  .use(cors())
  .get("/", () => ("Hello from Elysia!"))
  // Completely isolated CV download endpoint - no controller dependencies
  .get("/download/cv", async ({ set, request }) => {
    const CV_UPLOAD_DIR = resolveCVUploadDir();
    const requestOrigin = request.headers.get('origin');
    const allowedOrigin = requestOrigin ?? '*';
    const varyHeader: Record<string, string> = requestOrigin ? { Vary: 'Origin' } : {};

    try {
      console.log("Standalone CV download endpoint called");

      // Get CV data directly
      let cv;
      try {
        // Try to get CV with blobUrl field
        try {
          cv = await prisma.$queryRaw`SELECT id, filename, "blobUrl", "createdAt", "updatedAt" FROM "CV" LIMIT 1`;
          if (Array.isArray(cv) && cv.length > 0) {
            cv = cv[0];
          } else {
            cv = null;
          }
        } catch {
          console.log("Failed to query with blobUrl, trying without...");
          // Fallback to query without blobUrl field (for older schema)
          cv = await prisma.$queryRaw`SELECT id, filename, "createdAt", "updatedAt" FROM "CV" LIMIT 1`;
          if (Array.isArray(cv) && cv.length > 0) {
            cv = cv[0];
            // Add blobUrl as undefined to match expected structure
            cv.blobUrl = undefined;
          } else {
            cv = null;
          }
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        set.status = 500;
        return { status: 500, message: "Database error" };
      } finally {
        // Disconnect the Prisma client to prevent connection leaks
        await prisma.$disconnect();
      }

      if (!cv) {
        set.status = 404;
        set.headers = {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "GET",
          ...varyHeader,
        };
        return { status: 404, message: "No CV found" };
      }

      // If CV has blobUrl, fetch and serve it
      if (cv && 'blobUrl' in cv && cv.blobUrl && typeof cv.blobUrl === 'string') {
        console.log("Using blob URL:", cv.blobUrl);
        try {
          const blobResponse = await fetch(cv.blobUrl);
          if (!blobResponse.ok) {
            throw new Error(`Failed to fetch blob: ${blobResponse.status}`);
          }

          const blobData = await blobResponse.arrayBuffer();
          return new Response(new Uint8Array(blobData), {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${cv.filename}"`,
              "Access-Control-Allow-Origin": allowedOrigin,
              "Access-Control-Expose-Headers": "Content-Disposition",
              ...varyHeader,
            },
          });
        } catch (blobError) {
          console.error('Error fetching blob:', blobError);
          // Fall through to filesystem fallback
        }
      }

      // Fallback to filesystem
      console.log("Using filesystem fallback");
      const filePath = join(CV_UPLOAD_DIR, cv.filename);
      console.log("File path:", filePath);

      try {
        const fileBuffer = await readFile(filePath);

        return new Response(new Uint8Array(fileBuffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${cv.filename}"`,
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Expose-Headers": "Content-Disposition",
            ...varyHeader,
          },
        });
      } catch (fileError) {
        console.error('Error reading file:', fileError);
        set.headers = {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "GET",
          ...varyHeader,
        };
        set.status = 404;
        return { status: 404, message: "CV file not found" };
      }
    } catch (error) {
      console.error('Download CV error:', error);
      set.headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET",
        ...varyHeader,
      };
      set.status = 500;
      return { status: 500, message: "Internal server error" };
    }
  })
  .get("/images/:bucket", async ({ params: { bucket }, set }) => {
    try {
      // Import the function directly here to bypass controller caching
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
export const OPTIONS = app.handle as any;
export const HEAD = app.handle as any;

export default app;
export type App = typeof app;
