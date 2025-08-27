import { Elysia, t } from "elysia";
import { getExperiences, createExperience, updateExperience, deleteExperience, getExperience } from "./model";
import {
  errorResponse,
  successResponse,
} from "../../../../shared";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import { jwtProps } from "../../utils/const";
import { adminMiddleware } from "../auth/adminMiddleware";

// Public experience controller - completely isolated
export const experienceController = new Elysia({ prefix: "/experience" })
  // Simple test endpoint first
  .get("/test", async ({ set }) => {
    try {
      set.status = 200;
      return { message: "Experience test endpoint working", timestamp: new Date().toISOString() };
    } catch {
      set.status = 500;
      return { error: "Test endpoint failed" };
    }
  })
  // Minimal endpoint without database call
  .get("/minimal", async ({ set }) => {
    try {
      set.status = 200;
      return {
        status: 200,
        message: "Minimal experience endpoint working",
        data: []
      };
    } catch {
      set.status = 500;
      return { error: "Minimal endpoint failed" };
    }
  })
  // Public endpoint - NO AUTHENTICATION
  .get("/", async ({ set }) => {
    try {
      const data = await getExperiences();
      const formattedExperiences = data.map(
        (exp: {
          startDate: string | null;
          endDate: string | null;
          description: string[];
          startDateReadable: string;
          endDateReadable: string;
          id: string;
          company: string;
          position: string;
          createdAt: Date;
          updatedAt: Date;
        }) => ({
          ...exp,
          description: exp.description,
        })
      );
      set.status = 200;
      return successResponse(formattedExperiences, "Get experiences successfully", 200);
    } catch (error) {
      set.status = 500;
      return errorResponse(error, "Failed to get experiences", 500);
    }
  })
  // Protected routes for admin
  .use(jwt(jwtProps))
  .use(bearer())
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const experienceData = {
          ...body,
          description: body.description || []
        };
        const experience = await createExperience(experienceData);
        set.status = 201;
        return successResponse(experience, "Experience created successfully", 201);
      } catch (error) {
        set.status = 500;
        return errorResponse(error, "Failed to create experience", 500);
      }
    },
    {
      beforeHandle: adminMiddleware(),
      body: t.Object({
        company: t.String(),
        position: t.String(),
        startDate: t.String(),
        endDate: t.Optional(t.Union([t.String(), t.Null()])),
        description: t.Optional(t.Array(t.String()))
      })
    }
  )
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const experience = await getExperience(id);
        if (!experience) {
          set.status = 404;
          return errorResponse(null, "Experience not found", 404);
        }
        set.status = 200;
        return successResponse(experience, "Experience retrieved successfully", 200);
      } catch (error) {
        set.status = 500;
        return errorResponse(error, "Failed to get experience", 500);
      }
    },
    {
      params: t.Object({
        id: t.String()
      })
    }
  )
  .patch(
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const experience = await updateExperience(id, body);
        set.status = 200;
        return successResponse(experience, "Experience updated successfully", 200);
      } catch (error) {
        set.status = 500;
        return errorResponse(error, "Failed to update experience", 500);
      }
    },
    {
      beforeHandle: adminMiddleware(),
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        company: t.Optional(t.String()),
        position: t.Optional(t.String()),
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.Union([t.String(), t.Null()])),
        description: t.Optional(t.Array(t.String()))
      })
    }
  )
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        await deleteExperience(id);
        set.status = 200;
        return successResponse({}, "Experience deleted successfully", 200);
      } catch (error) {
        set.status = 500;
        return errorResponse(error, "Failed to delete experience", 500);
      }
    },
    {
      beforeHandle: adminMiddleware(),
      params: t.Object({
        id: t.String()
      })
    }
  );
