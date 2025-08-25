import { Elysia } from "elysia";
import { getExperiences } from "./model";
import {
  errorResponse,
  successResponse,
} from "../../../../shared";

// Public experience controller - completely isolated
export const experienceController = new Elysia({ prefix: "/experience" })
  // Public endpoint - NO AUTHENTICATION
  .get("/", async ({ set }) => {
    try {
      console.log('[Experience] Public GET / called');
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
      console.log('[Experience] Returning', formattedExperiences.length, 'experiences');
      set.status = 200;
      return successResponse(formattedExperiences, "Get experiences successfully", 200);
    } catch (error) {
      console.error('[Experience] Error in public GET /', error);
      set.status = 500;
      return errorResponse(error, "Failed to get experiences", 500);
    }
  });

// Note: Protected routes (POST, PATCH, DELETE) have been temporarily removed
// to isolate the JWT authentication issue. They can be re-added once the
// public route is working correctly.
