import { Elysia, t } from "elysia";
import { loginUser } from "./model";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";
import bearer from "@elysiajs/bearer";
import { adminMiddleware } from "./adminMiddleware";

export const authController = new Elysia({ prefix: "/auth" })
  .get('/health', () => ({ status: 200, message: 'Auth service is running' }))
  .get('/debug', ({ headers }) => ({ headers }))
  // Public login endpoint - no bearer auth needed
  .use(jwt(jwtProps))
  .post(
    "/login",
    async ({ jwt, body, set }) => {
      try {
        console.log("Login attempt for email:", body.email);
        const loginResult = await loginUser(body.email, body.password);
        console.log("Login result:", loginResult);
        
        const { user } = loginResult;
        console.log("User object:", user);
        
        // Check if jwt.sign is properly defined
        if (!jwt || typeof jwt.sign !== 'function') {
          console.error("JWT sign function is not available:", jwt);
          set.status = 500;
          return {
            status: 500,
            message: "Internal server error - JWT configuration issue",
          };
        }
        
        console.log("JWT object:", jwt);
        const token = await jwt.sign(user);
        console.log("Token generated successfully:", token);
        
        set.status = 200;
        // Return data in the format expected by the frontend
        const response = {
          status: 200,
          message: "Login successful",
          data: {
            user,
            token
          },
        };
        console.log("Login response:", response);
        return response;
      } catch (error) {
        console.error("Login error:", error);
        // Check if this is a database connection error
        if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
          set.status = 500;
          return {
            status: 500,
            message: "Database connection error - Please check your database configuration",
            error: error.message
          };
        }
        set.status = 401;
        return {
          status: 401,
          message: "Login failed",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  // Protected endpoints - apply bearer auth only to these
  .group("/admin", (app) => 
    app
      .use(jwt(jwtProps))
      .use(bearer())
      .get(
        "/verify",
        async ({ set }) => {
          try {
            set.status = 200;
            return {
              status: 200,
              message: "Admin access verified",
              data: { admin: true },
            };
          } catch (error) {
            set.status = 403;
            return {
              status: 403,
              message: "Admin verification failed",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
        {
          beforeHandle: adminMiddleware()
        }
      )
  );
  // .delete(
  //   "/:id",
  //   async ({ params: { id }, set }) => {
  //     try {
  //       const data = await deleteUser(id);
  //       set.status = 200;
  //       return {
  //         status: 200,
  //         message: "User deleted successfully",
  //         data,
  //       };
  //     } catch (error) {
  //       set.status = 500;
  //       return {
  //         status: 500,
  //         message: "Failed to delete user",
  //         error: error instanceof Error ? error.message : String(error),
  //       };
  //     }
  //   },
  //   {
  //     params: t.Object({
  //     id: t.String(),
  //     }),
  //   }
  // );