import type { User } from "./src/services/auth/types";


declare module 'elysia' {
  interface Request {
    user?: User;
  }
}