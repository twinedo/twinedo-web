import { Elysia, t } from "elysia";
import { createOrUpdateCV, getCV } from "./model";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { adminMiddleware } from "../auth/adminMiddleware";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";
import { resolveCVUploadDir } from "../../utils/paths";
import { uploadCvToBlob } from "./blobService";

const CV_UPLOAD_DIR = resolveCVUploadDir();
const CV_FILENAME = "Twin Edo Nugraha - CV.pdf";
const PUBLIC_DOWNLOAD_PATH = "/api/cv/file";
const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const isVercelEnv = Boolean(process.env.VERCEL);
const allowFilesystemFallback = !isVercelEnv || process.env.NODE_ENV !== "production";

const ensureUploadDir = async () => {
  await mkdir(CV_UPLOAD_DIR, { recursive: true });
};

ensureUploadDir().catch(console.error);

const buildCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin ?? "*";
  const varyHeader = origin ? { Vary: "Origin" } : {};

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Expose-Headers": "Content-Disposition",
    "Cache-Control": "no-store",
    ...varyHeader,
  } as Record<string, string>;
};

const readCvBytes = async (filename: string) => {
  const filePath = join(CV_UPLOAD_DIR, filename);
  const fileBuffer = await readFile(filePath);
  return new Uint8Array(fileBuffer);
};

export const cvController = new Elysia({ prefix: "/cv" })
  .get("/", async ({ set, request }) => {
    const origin = request.headers.get("origin");
    const headers = buildCorsHeaders(origin);

    try {
      const cv = await getCV();
      set.headers = headers;

      if (!cv) {
        set.status = 404;
        return {
          status: 404,
          message: "No CV found",
        };
      }

      const downloadUrl = cv.blobUrl ?? (allowFilesystemFallback ? PUBLIC_DOWNLOAD_PATH : null);

      if (!downloadUrl) {
        set.status = 404;
        return {
          status: 404,
          message: "CV is not available for download. Please upload a new CV.",
        };
      }

      return {
        status: 200,
        message: "CV fetched successfully",
        cv: {
          filename: cv.filename,
          downloadUrl,
          blobUrl: cv.blobUrl ?? null,
          size: cv.size,
          createdAt: cv.createdAt.toISOString(),
          updatedAt: cv.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      console.error("Error fetching CV metadata:", error);
      set.headers = headers;
      set.status = 500;
      return {
        status: 500,
        message: "Failed to fetch CV",
      };
    }
  })
  .get("/file", async ({ set, request }) => {
    const origin = request.headers.get("origin");
    const allowedOrigin = origin ?? "*";
    const varyHeader: Record<string, string> = origin ? { Vary: "Origin" } : {};

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

    const sendResponse = (bytes: Uint8Array) =>
      new Response(Buffer.from(bytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${cv.filename}"`,
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Expose-Headers": "Content-Disposition",
          "Cache-Control": "no-store",
          ...varyHeader,
        },
      });

    if (cv.blobUrl) {
      try {
        const blobResponse = await fetch(cv.blobUrl);
        if (!blobResponse.ok) {
          throw new Error(`Failed to fetch blob: ${blobResponse.status}`);
        }
        const blobData = await blobResponse.arrayBuffer();
        return sendResponse(new Uint8Array(blobData));
      } catch (error) {
        console.error("Failed to stream CV blob:", error);
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
            message: "CV file is temporarily unavailable. Please try again later.",
          };
        }
      }
    }

    try {
      const fileBytes = await readCvBytes(cv.filename);
      return sendResponse(fileBytes);
    } catch (error) {
      console.error("Failed to read CV file:", error);
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
  .get("/download", async ({ set, request }) => {
    const origin = request.headers.get("origin");
    const headers = buildCorsHeaders(origin);
    const cv = await getCV();

    if (!cv) {
      set.headers = headers;
      set.status = 404;
      return {
        status: 404,
        message: "No CV found",
      };
    }

    set.headers = headers;
    const redirectUrl = new URL(PUBLIC_DOWNLOAD_PATH, request.url);
    return Response.redirect(redirectUrl, 302);
  })
  .use(jwt(jwtProps))
  .post(
    "/upload",
    async ({ body }) => {
      const file = Array.isArray(body.cv_file) ? body.cv_file[0] : body.cv_file;

      if (!file) {
        throw new Error("No file uploaded");
      }

      if (file.type !== "application/pdf") {
        throw new Error("Only PDF files allowed");
      }

      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      let blobMeta: { url: string; size: number; uploadedAt?: Date } | undefined;

      if (hasBlobToken) {
        try {
          const blob = await uploadCvToBlob(CV_FILENAME, fileBuffer);
          blobMeta = {
            url: blob.url,
            size: fileBuffer.byteLength,
            uploadedAt: new Date(),
          };
        } catch (error) {
          console.error("Failed to upload CV to blob storage:", error);
          if (!allowFilesystemFallback) {
            throw new Error("CV upload failed. Please try again later.");
          }
        }
      }

      if (!blobMeta) {
        if (!allowFilesystemFallback) {
          throw new Error("Blob storage is required in this environment.");
        }

        try {
          await ensureUploadDir();
          const filePath = join(CV_UPLOAD_DIR, CV_FILENAME);
          await writeFile(filePath, fileBuffer);
        } catch (error) {
          console.error("Failed to persist CV on filesystem:", error);
          throw new Error("CV upload failed. Please try again later.");
        }
      }

      const data = await createOrUpdateCV(CV_FILENAME, blobMeta);

      if (!data) {
        throw new Error("CV metadata unavailable after upload.");
      }

      const downloadUrl = blobMeta?.url ?? PUBLIC_DOWNLOAD_PATH;

      return {
        status: 201,
        message: "CV uploaded successfully",
        data: {
          ...data,
          url: downloadUrl,
          downloadUrl,
          blobUrl: blobMeta?.url ?? null,
          storage: blobMeta ? "blob" : "filesystem",
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

if (process.env.NODE_ENV !== "production" && Array.isArray(cvController.routes)) {
  console.log(
    "[CVController] registered routes:",
    cvController.routes.map((route) => `${route.method} ${route.path}`).join(", ")
  );
}
