import { Elysia, t } from "elysia";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from "./model";
import { staticPlugin } from "@elysiajs/static";
import { ensureBucketExists, deleteProjectFiles } from "./utils";
import { prisma } from "../../../prisma/client";
import { adminMiddleware } from "../auth/adminMiddleware";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";

const PROJECTS_UPLOAD_DIR = process.env.PROJECTS_UPLOAD_DIR;

const baseProjectController = new Elysia({ prefix: "/project" });

if (process.env.NODE_ENV !== 'production' && PROJECTS_UPLOAD_DIR) {
  baseProjectController.use(
    staticPlugin({
      assets: PROJECTS_UPLOAD_DIR,
      prefix: "/project/files",
    })
  );
}

export const projectController = baseProjectController
  .use(jwt(jwtProps))
  .post(
    "/",
    async ({ body, set }) => {
      try {
        await ensureBucketExists(body.bucket);

        const data = await createProject(body);

        await prisma.projectImage.updateMany({
          where: { bucket: data.bucket },
          data: { bucket: data.bucket }, // Or add projectId if schema changed
        });

        set.status = 201;
        return {
          status: 201,
          message: "Project created successfully",
          data: {
            ...data,
            description: JSON.parse(data.description),
          },
        };
      } catch (error) {
        set.status = 500;
        return {
          status: 500,
          message: "Failed to create project",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      beforeHandle: adminMiddleware(),
      body: t.Object({
        year: t.String(),
        platform: t.Union([t.Literal("mobile"), t.Literal("website")]),
        tag: t.String(),
        project_name: t.String(),
        description: t.Union([t.String(), t.Array(t.String())]),
        link_appstore: t.Optional(t.Union([t.String(), t.Null()])),
        link_playstore: t.Optional(t.Union([t.String(), t.Null()])),
        link_website: t.Optional(t.Union([t.String(), t.Null()])),
        display: t.Optional(t.String()),
        bucket: t.String(),
      }),
    }
  )
  .patch(
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const data = await updateProject(id, body);

        set.status = 200;
        return {
          status: 200,
          message: "Project updated successfully",
          data: {
            ...data,
            description: JSON.parse(data.description),
          },
        };
      } catch (error) {
        set.status = 500;
        return {
          status: 500,
          message: "Failed to update project",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      beforeHandle: adminMiddleware(),
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        year: t.Optional(t.String()),
        platform: t.Optional(
          t.Union([t.Literal("mobile"), t.Literal("website")])
        ),
        tag: t.Optional(t.String()),
        project_name: t.Optional(t.String()),
        description: t.Optional(t.Union([t.String(), t.Array(t.String())])),
        link_appstore: t.Optional(t.Union([t.String(), t.Null()])),
        link_playstore: t.Optional(t.Union([t.String(), t.Null()])),
        link_website: t.Optional(t.Union([t.String(), t.Null()])),
        display: t.Optional(t.String()),
        bucket: t.Optional(t.String()),
      }),
    }
  )
  // Delete project
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const project = await getProject(id);
        if (!project) {
          set.status = 404;
          return {
            status: 404,
            message: "Project not found",
          };
        }

        // Delete associated files
        await deleteProjectFiles(project.bucket, [project.display]);

        const data = await deleteProject(id);

        set.status = 200;
        return {
          status: 200,
          message: "Project deleted successfully",
          data,
        };
      } catch (error) {
        set.status = 500;
        return {
          status: 500,
          message: "Failed to delete project",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      beforeHandle: adminMiddleware(),
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // Get all projects (with optional platform filter)
  .get(
    "/",
    async ({ query: { platform }, set }) => {
      try {
        const filter = platform
          ? { platform: platform as "mobile" | "website" }
          : undefined;
        const data = await getProjects(filter);

        set.status = 200;
        return {
          status: 200,
          message: "Get projects successfully",
          data,
        };
      } catch (error) {
        set.status = 500;
        return {
          status: 500,
          message: "Failed to get projects",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      query: t.Object({
        platform: t.Optional(
          t.Union([t.Literal("mobile"), t.Literal("website")])
        ),
      }),
    }
  )
  // Get single project
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const data = await getProject(id);
        if (!data) {
          set.status = 404;
          return {
            status: 404,
            message: "Project not found",
          };
        }

        set.status = 200;
        return {
          status: 200,
          message: "Get project successfully",
          data,
        };
      } catch (error) {
        set.status = 500;
        return {
          status: 500,
          message: "Failed to get project",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
