import type { JWTPayloadSpec } from "@elysiajs/jwt";
import type { User } from "./types";

type AdminContext = {
  jwt?: {
    verify: (token: string) => Promise<JWTPayloadSpec | false>;
    sign: (payload: User) => Promise<string>;
  };
  set: {
    status?: number | string;
  } & Record<string, unknown>;
  request: Request;
} & Record<string, unknown>;

const ADMIN_EMAIL = "twinedo.dev@gmail.com";

export const adminMiddleware = () => {
  return async (context: AdminContext) => {
    const { jwt, set, request } = context;

    const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : (typeof authHeader === 'string' && authHeader.length > 0 ? authHeader : undefined);

    if (!token) {
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
      const user = await jwt.verify(token);
      if (!user) {
        set.status = 401;
        return {
          status: 401,
          message: "Invalid token",
        };
      }
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
      Object.assign(context, { adminUser: dataUser });
      return context;
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
