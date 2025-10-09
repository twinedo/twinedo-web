import { Elysia, t } from "elysia";
import { createOrUpdateCV, getCV } from "./model";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { adminMiddleware } from "../auth/adminMiddleware";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";
import { resolveCVUploadDir } from "../../utils/paths";

const CV_UPLOAD_DIR = resolveCVUploadDir();
const CV_FILENAME = "Twin Edo Nugraha - CV.pdf";
const PUBLIC_DOWNLOAD_PATH = "/api/cv/file";

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

      const downloadUrl = PUBLIC_DOWNLOAD_PATH;

      return {
        status: 200,
        message: "CV fetched successfully",
        cv: {
          filename: cv.filename,
          downloadUrl,
          blobUrl: downloadUrl,
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

    try {
      const fileBytes = await readCvBytes(cv.filename);
      return new Response(fileBytes, {
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

      try {
        await ensureUploadDir();
        const filePath = join(CV_UPLOAD_DIR, CV_FILENAME);
        await writeFile(filePath, fileBuffer);
      } catch (error) {
        console.error("Failed to persist CV on filesystem:", error);
        throw new Error("CV upload failed. Please try again later.");
      }

      const data = await createOrUpdateCV(CV_FILENAME);

      if (!data) {
        throw new Error("CV metadata unavailable after upload.");
      }

      return {
        status: 201,
        message: "CV uploaded successfully",
        data: {
          ...data,
          url: PUBLIC_DOWNLOAD_PATH,
          downloadUrl: PUBLIC_DOWNLOAD_PATH,
          blobUrl: PUBLIC_DOWNLOAD_PATH,
          storage: "public",
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
