import { Elysia, t } from "elysia";
import {
  createExperience,
  getExperiences,
  getExperience,
  updateExperience,
  deleteExperience,
} from "./model";
import { authSwagger } from "../../utils/fun";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";
import bearer from "@elysiajs/bearer";
import { isValidYyyyMm } from "../../utils/dateUtils";
import { errorResponse, successResponse, type Experience, type ExperienceUpdateInput } from '../../../../shared'

export const experienceController = new Elysia({ prefix: "/experience" })
  // Create new experience

  // Get all experiences (sorted by endDate)
  .get("/", async () => {
    try {
      const data = await getExperiences();
      const formattedExperiences = data.map((exp: Experience) => ({
        ...exp,
        description: exp.description
          // typeof exp.description === "string" && exp.description
          //   ? JSON.parse(exp.description)
          //   : [],
      }));
      return successResponse(formattedExperiences, "Get exp successfully", 200);
      // set.status = 200;
      // return {
      //   status: 200,
      //   message: "Get experiences successfully",
      //   data: formattedExperiences,
      // };
    } catch (error) {
      return errorResponse(error, "Failed to get experiences", 500);
      // set.status = 500;
      // return {
      //   status: 500,
      //   message: "Failed to get experiences",
      //   error: error instanceof Error ? error.message : String(error),
      // };
    }
  })
  .use(jwt(jwtProps))
  .use(bearer())
  .guard(authSwagger(true), (app) =>
    app
      .post(
        "/",
        async ({ body, set }) => {
          try {
            // Validate date formats
            if (!isValidYyyyMm(body.startDate)) {
              set.status = 400;
              return { error: "Invalid start date format. Use YYYY-MM" };
            }

            if (body.endDate && !isValidYyyyMm(body.endDate)) {
              set.status = 400;
              return { error: "Invalid end date format. Use YYYY-MM" };
            }

            // Optional: Validate description array
            if (body.description && body.description.length > 0) {
              const hasEmptyPoints = body.description.some(
                (point) => !point.trim()
              );
              if (hasEmptyPoints) {
                set.status = 400;
                return { error: "Description points cannot be empty" };
              }
            }

            const description = Array.isArray(body.description)
              ? body.description
                  .map((item) => String(item).trim())
                  .filter((item) => item.length > 0)
              : [];

            const finalBody = {
              ...body,
              description
            }

            const experience = await createExperience(finalBody);
            return { success: true, data: experience };
          } catch (error) {
            set.status = 400;
            return { error: error?.toString() };
          }
        },
        {
          body: t.Object({
            company: t.String(),
            position: t.String(),
            startDate: t.String(), // "2025-06"
            endDate: t.Optional(t.Union([t.String(), t.Null()])), // "2025-12" or null
            description: t.Optional(t.Array(t.String())), // Array of strings for bullet points
          }),
        }
      )
      // Update experience
      .patch(
        "/:id",
        async ({ params: { id }, body, set }) => {
          try {
            // Prepare update data with only provided fields
            const updateData: Partial<ExperienceUpdateInput> = {};

            if (body.company !== undefined) updateData.company = body.company;
            if (body.position !== undefined)
              updateData.position = body.position;

            // Handle date fields - validate format if provided
            if (body.startDate !== undefined) {
              if (!isValidYyyyMm(body.startDate)) {
                set.status = 400;
                return { error: "Invalid start date format. Use YYYY-MM" };
              }
              updateData.startDate = body.startDate;
            }

            if (body.endDate !== undefined) {
              if (body.endDate && !isValidYyyyMm(body.endDate)) {
                set.status = 400;
                return { error: "Invalid end date format. Use YYYY-MM" };
              }
              updateData.endDate = body.endDate;
            }

            // Handle description array
            if (body.description !== undefined) {
              if (body.description === null) {
                updateData.description = [];
              } else if (Array.isArray(body.description)) {
                // Validate that all array items are non-empty strings
                const hasEmptyPoints = body.description.some(
                  (point) => !point.trim()
                );
                if (hasEmptyPoints) {
                  set.status = 400;
                  return { error: "Description points cannot be empty" };
                }
                updateData.description = body.description;
              } else if (typeof body.description === "string") {
                // Convert string to array by splitting on newlines
                updateData.description = body.description
                  .split("\n")
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0);
              } else {
                updateData.description = [];
              }
            }

            // Check if experience exists first
            const exists = await getExperience(id);
            if (!exists) {
              set.status = 404;
              return {
                status: 404,
                message: "Experience not found",
              };
            }

            const data = await updateExperience(id, updateData);

            set.status = 200;
            return {
              status: 200,
              message: "Experience updated successfully",
              data: data,
            };
          } catch (error) {
            set.status = 500;
            return {
              status: 500,
              message: "Failed to update experience",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            company: t.Optional(t.String()),
            position: t.Optional(t.String()),
            startDate: t.Optional(t.String()), // YYYY-MM format
            endDate: t.Optional(t.Union([t.String(), t.Null()])), // YYYY-MM format or null
            description: t.Optional(
              t.Union([t.Array(t.String()), t.String(), t.Null()])
            ), // Array of strings, single string, or null
          }),
        }
      )

      // Delete experience
      .delete(
        "/:id",
        async ({ params: { id }, set }) => {
          try {
            const data = await deleteExperience(id);
            set.status = 200;
            return {
              status: 200,
              message: "Experience deleted successfully",
              data,
            };
          } catch (error) {
            set.status = 500;
            return {
              status: 500,
              message: "Failed to delete experience",
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
