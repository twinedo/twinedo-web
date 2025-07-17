import { Elysia, t } from "elysia";
import { loginUser, registerUser } from "./model";
import jwt from "@elysiajs/jwt";
import { jwtProps } from "../../utils/const";

export const authController = new Elysia({ prefix: "/auth" })
    // .post(
    //   "/register",
    //   async ({ body, set }) => {
    //     try {
    //       const user = await registerUser(body);
    //       set.status = 201;
    //       return {
    //         status: 201,
    //         message: "User registered successfully",
    //         data: {
    //           id: user.id,
    //           email: user.email,
    //         },
    //       };
    //     } catch (error) {
    //       set.status = 400;
    //       return {
    //         status: 400,
    //         message: "Registration failed",
    //         error: error instanceof Error ? error.message : String(error),
    //       };
    //     }
    //   },
    //   {
    //     body: t.Object({
    //       email: t.String({ format: "email" }),
    //       password: t.String({ minLength: 8 }),
    //     }),
    //   }
    // )
  .use(jwt(jwtProps))
  .post(
    "/login",
    async ({ jwt, body, set }) => {
      try {
        const { user } = await loginUser(body.email, body.password);
        const token = await jwt.sign(user)
        set.status = 200;
        return {
          status: 200,
          message: "Login successful",
          data: { user, token },
        };
      } catch (error) {
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
  //       id: t.String(),
  //     }),
  //   }
  // );
