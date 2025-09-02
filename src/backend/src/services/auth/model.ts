// import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/client";
import bcrypt from "bcryptjs";

// const JWT_SECRET = process.env.JWT_SECRET || "portfolio-twinedo-jwt";

export const registerUser = async (data: {
  email: string;
  password: string;
  role?: "superadmin" | "user";
}) => {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role ?? "user",
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to register user");
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid password");

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    // Check if this is a database connection error
    if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
      throw new Error("Database connection error - Please check your database configuration");
    }
    throw error;
  }
};

// export const verifyToken = (token: string) => {
//   if (!token) {
//     throw new Error("No token provided