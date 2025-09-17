import type { JWTPayloadSpec } from "@elysiajs/jwt";
import type { User } from "./types";

type AdminContext = {
  bearer?: string;
  jwt?: {
    verify: (token: string) => Promise<JWTPayloadSpec>;
    sign: (payload: User) => Promise<string>;
  };
  set: {
    status: number;
  } & Record<string, unknown>;
} & Record<string, unknown>;

const ADMIN_EMAIL = "twinedo.dev@gmail.com";

export const adminMiddleware = () => {
  return async (context: AdminContext) => {
    const { bearer, jwt, set } = context;

    if (!bearer) {
      set.status = 401;
      return {
        status: 401,
        message: "Authentication required",
      };
    }

    if (!jwt) {
      set.status = 500;
      return {
        status: 500,
        message: "JWT verification is not configured",
      };
    }

    try {
      const user = await jwt.verify(bearer);
      const dataUser = user as User;

      // Restrict access to admin email only
      if (dataUser.email !== ADMIN_EMAIL) {
        set.status = 403;
        return {
          status: 403,
          message: "Access denied. Admin privileges required.",
        };
      }

      // Must be superadmin role
      if (dataUser.role !== "superadmin") {
        set.status = 403;
        return {
          status: 403,
          message: "Access denied. Superadmin role required.",
        };
      }

      // Return success response instead of user data directly
      set.status = 200;
      return {
        status: 200,
        message: "Admin access verified",
        data: { admin: true },
      };
    } catch (error) {
      set.status = 401;
      return {
        status: 401,
        message: "Invalid token",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };
};

// Helper function to ensure admin user exists
export const ensureAdminExists = async () => {
  const { prisma } = await import('../../../prisma/client');
  
  try {
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL }
    });

    if (!existingAdmin) {
      console.log('Admin user not found. Please create admin user manually.');
      return false;
    }

    // Ensure admin has superadmin role
    if (existingAdmin.role !== 'superadmin') {
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'superadmin' }
      });
      console.log('Admin user role updated to superadmin.');
    }

    return true;
  } catch (error) {
    console.error('Error checking admin user:', error);
    return false;
  }
};
