import type { JWTOption } from "@elysiajs/jwt";

export const jwtProps: JWTOption = {
  name: "jwt",
  secret: process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || "fallback-jwt-secret-for-development",
  exp: "1d",
  alg: 'HS256',
};
