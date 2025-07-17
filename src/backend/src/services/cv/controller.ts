import { Elysia, t } from "elysia";
import { createOrUpdateCV, getCV } from "./model";
import { staticPlugin } from "@elysiajs/static";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { unlink } from "node:fs/promises";
import { authSwagger } from "../../utils/fun";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";
import bearer from "@elysiajs/bearer";
import { errorResponse } from "../../../../shared";
import getConfig from "next/config";

const { CV_UPLOAD_DIR } = getConfig().serverRuntimeConfig;

// Ensure upload directory exists - wrapped in async function
const ensureUploadDir = async () => {
  await mkdir(CV_UPLOAD_DIR, { recursive: true });
};

// Call the function to ensure directory exists
ensureUploadDir().catch(console.error);

export const cvController = new Elysia({ prefix: "/cv" })
  .use(
    staticPlugin({
      assets: CV_UPLOAD_DIR,
      prefix: "/cv/files",
    })
  )
  .get("/", async () => {
    const cv = await getCV();
    return { cv };
  })
  .get("/download", async ({ set }) => {
    const cv = await getCV();

    if (!cv) {
      set.headers = {
        "Access-Control-Allow-Origin": import.meta.env.VITE_FRONTEND_URL || "*",
        "Access-Control-Allow-Methods": "GET",
      };
      return errorResponse("No CV found", "", 404);
    }

    const filePath = join(CV_UPLOAD_DIR, cv.filename);

    // Set headers for download
    set.headers = {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${cv.filename}"`,
      "Access-Control-Allow-Origin": import.meta.env.VITE_FRONTEND_URL || "*",
      "Access-Control-Expose-Headers": "Content-Disposition",
    };

    // Return the file
    return new Response(Bun.file(filePath));
  })
  .use(jwt(jwtProps))
  .use(bearer())
  .guard(authSwagger(true), (app) =>
    app.post(
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
          (await Bun.file(filePath).exists()) && (await unlink(filePath));
        } catch (error) {
          console.log("No existing file to delete");
        }

        // Save new file
        await Bun.write(filePath, file);
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
        body: t.Object({
          cv_file: t.Any(),
        }),
        parse: async ({ request }) => {
          const formData = await request.formData();
          const cv_file = formData.get("cv_file");
          return { cv_file };
        },
      }
    )
  );
