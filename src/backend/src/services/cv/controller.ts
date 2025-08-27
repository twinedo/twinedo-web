import { Elysia, t } from "elysia";
import { createOrUpdateCV, getCV } from "./model";
import { staticPlugin } from "@elysiajs/static";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { unlink, constants } from "node:fs/promises";
import { adminMiddleware } from "../auth/adminMiddleware";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";
import bearer from "@elysiajs/bearer";
import getConfig from "next/config";
import { errorResponse } from "../../../../shared";

const { CV_UPLOAD_DIR } = getConfig().serverRuntimeConfig;

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

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
  .get("/", async () => {
    const cv = await getCV();
    return { cv };
  })
  .get("/download", async ({ set }) => {
    const cv = await getCV();

    if (!cv) {
      set.headers = {
        "Access-Control-Allow-Origin": baseUrl || "*",
        "Access-Control-Allow-Methods": "GET",
      };
      return errorResponse("No CV found", "", 404);
    }

    const filePath = join(CV_UPLOAD_DIR, cv.filename);

    // Set headers for download
    set.headers = {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${cv.filename}"`,
      "Access-Control-Allow-Origin": baseUrl || "*",
      "Access-Control-Expose-Headers": "Content-Disposition",
    };

    // Return the file
    const fileBuffer = await readFile(filePath);
    return new Response(fileBuffer.buffer);
  })
  .use(jwt(jwtProps))
  .use(bearer())
  .post(
    "/upload",
    async ({ body }) => {
        await ensureUploadDir();

        const file = Array.isArray(body.cv_file)
          ? body.cv_file[0]
          : body.cv_file;

        if (!file) throw new Error("No file uploaded");
        if (file.type !== "application/pdf")
          throw new Error("Only PDF files allowed");

        // Constant filename
        const filename = "Twin Edo Nugraha - CV.pdf";
        const filePath = join(CV_UPLOAD_DIR, filename);

        // Delete existing file if it exists
        try {
          await access(filePath, constants.F_OK);
          await unlink(filePath);
        } catch {
          console.log("No existing file to delete");
        }

        // Save new file
        const arrayBuffer = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(arrayBuffer));
        const cv = await createOrUpdateCV(filename);

        return {
          success: true,
          message: "CV updated successfully",
          cv,
          url: `/cv/files/${filename}`,
          downloadUrl: `/cv/download`,
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
