// import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/client";

// const JWT_SECRET = process.env.JWT_SECRET || "portfolio-twinedo-jwt";

export const registerUser = async (data: {
  email: string;
  password: string;
  role?: "superadmin" | "user";
}) => {
  const hashedPassword = await Bun.password.hash(data.password, "bcrypt");
  return await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role ?? "user",
    },
  });
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const valid = await Bun.password.verify(password, user.password);
  if (!valid) throw new Error("Invalid password");

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

// export const verifyToken = (token: string) => {
//   if (!token) {
//     throw new Error("No token provided");
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as {
//       id: string;
//       email: string;
//       role: string;
//       exp: number;
//     };

//     // Check token expiration
//     if (decoded.exp && Date.now() >= decoded.exp * 1000) {
//       throw new Error("Token expired");
//     }

//     return decoded;
//   } catch (error) {
//     throw new Error("Invalid token");
//   }
// };

export const deleteUser = async (id: string) => {
  const response = await prisma.user.delete({
    where: {
      id: id,
    },
  });
  return response;
};
