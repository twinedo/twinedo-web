import { Elysia, t } from "elysia";
import {
  createProjectImage,
  getProjectImages,
  updateProjectImage,
  deleteProjectImage,
} from "./model";
import { staticPlugin } from "@elysiajs/static";
import { join } from "node:path";
import { mkdir, unlink } from "node:fs/promises";
import { prisma } from "../../../prisma/client";
import { authSwagger } from "../../utils/fun";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";
import bearer from "@elysiajs/bearer";
import getConfig from "next/config";
import { put } from '@vercel/blob';
const { PROJECTS_UPLOAD_DIR } = getConfig().serverRuntimeConfig;

// Create base controller
const baseProjectImageController = new Elysia({ prefix: "/project-images" });

// Only use static plugin in development or when not on Vercel
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL && PROJECTS_UPLOAD_DIR) {
  baseProjectImageController.use(
    staticPlugin({
      assets: PROJECTS_UPLOAD_DIR,
      prefix: "/project/files",
    })
  );
}

export const projectImageController = baseProjectImageController
  // Get all images for a bucket (PUBLIC ENDPOINT - NO AUTH REQUIRED)
  .get(
    "/:bucket",
    async ({ params: { bucket }, set }) => {
      try {
        const images = await getProjectImages(bucket);
        const data = images.map(
          (img: {
            bucket: string;
            id: string;
            filename: string;
            isFeatured: boolean;
            isThumbnail: boolean;
            order: number;
            createdAt: Date;
            updatedAt: Date;
            url?: string;
            blobUrl?: string | null;
          }) => ({
            ...img
          })
        );

        set.status = 200;
        return {
          status: 200,
          message: "Get project images successfully",
          data,
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
  )
  // PROTECTED ENDPOINTS BELOW - REQUIRE AUTHENTICATION
  .use(jwt(jwtProps))
  .use(bearer())
  .guard(authSwagger(true, ["Project Images"]), (app) =>
    app
      .post(
        "/upload",
        async ({ body: { file, bucket }, set }) => {
          try {
            // Validate bucket format (alphanumeric with dashes)
            if (!/^[a-z0-9-]+$/.test(bucket)) {
              set.status = 400;
              return { status: 400, message: "Invalid bucket format" };
            }

            // Ensure bucket directory exists
            const bucketDir = join(PROJECTS_UPLOAD_DIR, bucket);
            await mkdir(bucketDir, { recursive: true });

            // Generate unique filename
            const ext = file.name.substring(file.name.lastIndexOf("."));
            const filename = `img-${Date.now()}${ext}`;
            const filePath = join(bucketDir, filename);
            const pathname = `${bucket}/${filename}`;

            // Save file to Vercel Blob
            const blob = await put(pathname, file, {
              access: 'public',
            });

            // Create database record
            const data = await createProjectImage({ bucket, filename, blobUrl: blob.url });

            set.status = 201;
            return {
              status: 201,
              message: "Image uploaded successfully",
              data: {
                ...data,
                url: blob.url,
              },
            };
          } catch (error) {
            set.status = 500;
            return {
              status: 500,
              message: "Failed to upload image",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
        {
          body: t.Object({
            file: t.File(),
            bucket: t.String(),
          }),
        }
      )
      // Update image metadata
      .patch(
        "/:id",
        async ({ params: { id }, body, set }) => {
          try {
            const data = await updateProjectImage(id, body);

            set.status = 200;
            return {
              status: 200,
              message: "Image updated successfully",
              data,
            };
          } catch (error) {
            set.status = 500;
            return {
              status: 500,
              message: "Failed to update image",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            isFeatured: t.Optional(t.Boolean()),
            order: t.Optional(t.Number()),
          }),
        }
      )
      // Delete image
      .delete(
        "/:id",
        async ({ params: { id }, set }) => {
          try {
            // Get image record first to determine bucket
            const image = await prisma.projectImage.findUnique({
              where: { id },
            });
            if (!image) {
              set.status = 404;
              return { status: 404, message: "Image not found" };
            }

            // Delete file from filesystem
            const filePath = join(
              PROJECTS_UPLOAD_DIR,
              image.bucket,
              image.filename
            );
            await unlink(filePath).catch(() => {});

            // Delete database record
            await deleteProjectImage(id);

            set.status = 200;
            return {
              status: 200,
              message: "Image deleted successfully",
            };
          } catch (error) {
            set.status = 500;
            return {
              status: 500,
              message: "Failed to delete image",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )
  );