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
import { getLatestBlobCv } from "./blobService";

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
  // Public routes - no authentication required
  .get("/", async ({ set, request }) => {
    const requestOrigin = request.headers.get('origin');
    const allowedOrigin = requestOrigin ?? '*';
    const varyHeader: Record<string, string> = requestOrigin ? { Vary: 'Origin' } : {};

    try {
      const cv = await getCV();

      set.headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "no-store",
        ...varyHeader,
      };

      if (!cv) {
        set.status = 404;
        return {
          status: 404,
          message: "No CV found",
        };
      }

      const blobUrl = 'blobUrl' in cv ? (cv as { blobUrl?: string | null }).blobUrl ?? undefined : undefined;
      const fallbackFileUrl = new URL('/api/cv/file', request.url).toString();
      const downloadUrl = blobUrl ?? fallbackFileUrl;

      return {
        status: 200,
        message: "CV fetched successfully",
        cv: {
          ...cv,
          blobUrl,
          downloadUrl,
        },
      };
    } catch (error) {
      console.error('Error fetching CV metadata:', error);
      set.headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "no-store",
        ...varyHeader,
      };
      set.status = 500;
      return {
        status: 500,
        message: "Failed to fetch CV",
      };
    }
  })
  .get("/blob/meta", async ({ set, request }) => {
    const requestOrigin = request.headers.get('origin');
    const allowedOrigin = requestOrigin ?? '*';
    const varyHeader: Record<string, string> = requestOrigin ? { Vary: 'Origin' } : {};

    set.headers = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "no-store",
      ...varyHeader,
    };

    const blobCv = await getLatestBlobCv();

    if (!blobCv) {
      set.status = 404;
      return {
        status: 404,
        message: "No CV blob found",
      };
    }

    return {
      status: 200,
      message: "CV blob fetched successfully",
      cv: {
        filename: blobCv.filename,
        downloadUrl: blobCv.url,
        blobUrl: blobCv.url,
        size: blobCv.size,
        updatedAt: blobCv.uploadedAt.toISOString(),
        createdAt: blobCv.uploadedAt.toISOString(),
      },
    };
  })
  .get("/blob/file", async ({ set, request }) => {
    const requestOrigin = request.headers.get('origin');
    const allowedOrigin = requestOrigin ?? '*';
    const varyHeader: Record<string, string> = requestOrigin ? { Vary: 'Origin' } : {};

    const blobCv = await getLatestBlobCv();

    if (!blobCv) {
      set.headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET",
        ...varyHeader,
      };
      set.status = 404;
      return {
        status: 404,
        message: "No CV blob found",
      };
    }

    try {
      const blobResponse = await fetch(blobCv.url);
      if (!blobResponse.ok) {
        throw new Error(`Failed to fetch blob: ${blobResponse.status}`);
      }

      const blobData = await blobResponse.arrayBuffer();
      return new Response(new Uint8Array(blobData), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${blobCv.filename}"`,
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Expose-Headers": "Content-Disposition",
          "Cache-Control": "no-store",
          ...varyHeader,
        },
      });
    } catch (error) {
      console.error('Error streaming blob CV:', error);
      set.headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET",
        ...varyHeader,
      };
      set.status = 502;
      return {
        status: 502,
        message: "Failed to download CV blob",
      };
    }
  })
  .get("/file", async ({ set, request }) => {
    const requestOrigin = request.headers.get('origin');
    const allowedOrigin = requestOrigin ?? '*';
    const varyHeader: Record<string, string> = requestOrigin ? { Vary: 'Origin' } : {};
    const cv = await getCV();

    if (!cv) {
      set.headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "no-store",
        ...varyHeader,
      };
      set.status = 404;
      return {
        status: 404,
        message: "No CV found",
      };
    }

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
            "Cache-Control": "no-store",
            ...varyHeader,
          },
        });
      } catch (error) {
        console.error('Error fetching blob:', error);
        if (!allowFilesystemFallback) {
          set.headers = {
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Methods": "GET",
            "Cache-Control": "no-store",
            ...varyHeader,
          };
          set.status = 502;
          return {
            status: 502,
            message: "CV file is temporarily unavailable. Please try again shortly.",
          };
        }
        // Fall through to filesystem fallback when allowed
      }
    }

    if (!allowFilesystemFallback) {
      set.headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "no-store",
        ...varyHeader,
      };
      set.status = 404;
      return {
        status: 404,
        message: "CV file not found",
      };
    }

    const filePath = join(CV_UPLOAD_DIR, cv.filename);

    try {
      const fileBuffer = await readFile(filePath);
      return new Response(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${cv.filename}"`,
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Expose-Headers": "Content-Disposition",
          "Cache-Control": "no-store",
          ...varyHeader,
        },
      });
    } catch {
      set.headers = {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "no-store",
        ...varyHeader,
      };
      set.status = 404;
      return {
        status: 404,
        message: "CV file not found",
      };
    }
  })
  .use(jwt(jwtProps))
  // Public routes - redirect download path
  .get("/download", async ({ set, request }) => {
    const origin = request.headers.get('origin');
    const allowedOrigin = origin ?? '*';
    const varyHeader: Record<string, string> = origin ? { Vary: 'Origin' } : {};
    set.headers = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET",
      ...varyHeader,
    };
    set.status = 301;
    return Response.redirect(new URL('/api/cv/file', request.url), 301);
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
