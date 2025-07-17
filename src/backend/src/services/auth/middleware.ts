import { type Context } from "elysia";
import { type JWTPayloadSpec } from "@elysiajs/jwt";
import type { User } from "./types";

type AuthContext = Context & {
  bearer?: string;
  jwt: {
    verify: (token: string) => Promise<JWTPayloadSpec>;
    sign: (payload: User) => Promise<string>;
  };
};

export const authMiddleWare = () => {
  return async ({ bearer, jwt, set }: AuthContext) => {
    if (!bearer) {
      set.status = 401;
      return {
        status: 401,
        message: "User authentication is missing",
      };
    }

    const user = await jwt.verify(bearer);
    const dataUser = user as User;

    if (dataUser.role !== "superadmin") {
      set.status = 403;
      return {
        status: 403,
        message: "You do not have permission to create projects",
      };
    }
  };
};