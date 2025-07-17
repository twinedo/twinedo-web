import { authMiddleWare } from "../services/auth/middleware";


export const authSwagger = (required: boolean, tags?: string[]) => ({
  beforeHandle: authMiddleWare(),
  detail: {
    security: required ? [{ bearerAuth: [] }] : [],
    swagger: {
      security: [{ bearerAuth: [] }],
      securityRequired: true,
    },
    tags: tags || [],
  },
});