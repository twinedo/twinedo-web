import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { cvController } from "./src/services/cv";
import { experienceController } from "./src/services/experience";
import { projectController } from "./src/services/projects";
import { projectImageController } from "./src/services/projectImages";
import { authController } from "./src/services/auth";

const app = new Elysia({ prefix: "/api" })
  .use(cors())
  .get("/", () => "Hello from Elysia!")
  .use(cvController)
  .use(experienceController)
  .use(projectController)
  .use(projectImageController)
  .use(authController)
  .use(
    swagger({
      documentation: {
        info: {
          title: "Portfolio API",
          version: "1.0.0",
        },
        tags: [
          { name: "Project Images", description: "Image management endpoints" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        // Remove the global security: [{ bearerAuth: [] }] here
      },
    })
  );

// console.log(
//   `🦊 Backend running at http://${app.server}:${app.server?.port}`
// );

export default app;
