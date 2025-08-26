import { Elysia, t } from "elysia";
import {
  createProjectImage,
  getProjectImages,
  updateProjectImage,
  deleteProjectImage,
} from "./model";
import { authSwagger } from "../../utils/fun";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";
import bearer from "@elysiajs/bearer";
import { put } from '@vercel/blob';

// PUBLIC ROUTES - NO JWT
const publicRoutes = new Elysia({ prefix: "/project-images" })
  .get(
    "/:bucket",
    async ({ params: { bucket }, set }) => {
      try {
        const images = await getProjectImages(bucket);
        set.status = 200;
        return {
          status: 200,
          message: "Get project images successfully",
          data: images,
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
  );

// PROTECTED ROUTES - JWT REQUIRED
const protectedRoutes = new Elysia({ prefix: "/project-images" })
  .use(jwt(jwtProps))
  .use(bearer())
  .guard(authSwagger(true, ["Project Images"]), (app) =>
    app
      .post(
        "/upload",
        async ({ body: { file, bucket }, set }) => {
          try {
            if (!/^[a-z0-9-]+$/.test(bucket)) {
              set.status = 400;
              return { status: 400, message: "Invalid bucket format" };
            }

            const ext = file.name.substring(file.name.lastIndexOf("."));
            const filename = `img-${Date.now()}${ext}`;
            const pathname = `${bucket}/${filename}`;

            const blob = await put(pathname, file, {
              access: 'public',
            });

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
      .delete(
        "/:id",
        async ({ params: { id }, set }) => {
          try {
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

// COMBINE PUBLIC AND PROTECTED ROUTES
export const projectImageController = new Elysia()
  .use(publicRoutes)
  .use(protectedRoutes);