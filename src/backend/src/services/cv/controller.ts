import { Elysia, t } from "elysia";
import { createOrUpdateCV, getCV } from "./model";
import { staticPlugin } from "@elysiajs/static";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { adminMiddleware } from "../auth/adminMiddleware";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";
import { put } from "@vercel/blob";
import { resolveCVUploadDir } from "../../utils/paths";

const CV_UPLOAD_DIR = resolveCVUploadDir();
const allowFilesystemFallback = !process.env.VERCEL && process.env.NODE_ENV !== 'production';

// Ensure upload directory exists - wrapped in async function
const ensureUploadDir = async () => {
  await mkdir(CV_UPLOAD_DIR, { recursive: true });
};

// Call the function to ensure directory exists
ensureUploadDir().catch(console.error);

// Create base controller
const baseCvController = new Elysia({ prefix: "/cv" });

// Only use static plugin in development or when not on Vercel
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL && CV_UPLOAD_DIR) {
  baseCvController.use(
    staticPlugin({
      assets: CV_UPLOAD_DIR,
      prefix: "/cv/files",
    })
  );
}

export const cvController = baseCvController
  .use(jwt(jwtProps))
  // Public routes - no authentication required
  .get("/", async () => {
    const cv = await getCV();
    return { cv };
  })
  .get("/download", async ({ set, request }) => {
    const requestOrigin = request.headers.get('origin');
    const allowedOrigin = requestOrigin ?? '*';
    const varyHeader: Record<string, string> = requestOrigin ? { Vary: 'Origin' } : {};
    const cv = await getCV();

    if (!cv) {
      set.headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET",
        ...varyHeader,
      };
      set.status = 404;
      return {
        status: 404,
        message: "No CV found"
      };
    }

    // If CV has blobUrl, fetch and serve it
    if (cv && 'blobUrl' in cv && cv.blobUrl && typeof cv.blobUrl === 'string') {
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
      } catch {
        console.error('Error fetching blob:');
        // Fall through to filesystem fallback
      }
    }

    // Fallback to filesystem (for development or legacy)
    const filePath = join(CV_UPLOAD_DIR, cv.filename);

    try {
      // Set headers for download
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
    } catch {
      set.headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET",
        ...varyHeader,
      };
      set.status = 404;
      return {
        status: 404,
        message: "CV file not found"
      };
    }
  })
  // Protected routes - authentication required (JWT middleware applied here)
  .post(
    "/upload",
    async ({ body }) => {
        const file = Array.isArray(body.cv_file)
          ? body.cv_file[0]
          : body.cv_file;

        if (!file) throw new Error("No file uploaded");
        if (file.type !== "application/pdf")
          throw new Error("Only PDF files allowed");

        // Constant filename
        const filename = "Twin Edo Nugraha - CV.pdf";
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        let blobUrl: string | undefined;

        try {
          const blob = await put(`cv/${filename}`, fileBuffer, {
            access: 'public',
            addRandomSuffix: false,
          });
          blobUrl = blob.url;
        } catch (error) {
          console.error('Upload to Vercel Blob failed:', error);
        }

        if (!blobUrl) {
          if (!allowFilesystemFallback) {
            throw new Error('Unable to store CV. Blob storage is not configured.');
          }

          try {
            await ensureUploadDir();
            const filePath = join(CV_UPLOAD_DIR, filename);
            await writeFile(filePath, fileBuffer);
          } catch (error) {
            console.error('Failed to persist CV on filesystem:', error);
            throw new Error('CV upload failed. Please try again later.');
          }
        }

        // Save to database with blob URL (or without if filesystem fallback)
        const data = await createOrUpdateCV(filename, blobUrl);
        const storage = blobUrl ? 'blob' : 'filesystem';

        return {
          status: 201,
          message: "CV uploaded successfully",
          data: {
            ...data,
            url: blobUrl,
            storage,
          },
        };
    },
    {
      beforeHandle: adminMiddleware(),
      body: t.Object({
        cv_file: t.Any(),
      }),
      parse: async ({ request }) => {
        const formData = await request.formData();
        const cv_file = formData.get("cv_file");
        return { cv_file };
      },
    }
  );

if (process.env.NODE_ENV !== 'production' && Array.isArray(cvController.routes)) {
  console.log('[CVController] registered routes:', cvController.routes.map((route) => `${route.method} ${route.path}`).join(', '));
}
