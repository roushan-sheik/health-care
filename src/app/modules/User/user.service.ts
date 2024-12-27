import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";

const createAdmin = async (payload: any) => {
  // hash the user password
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const userData = {
    email: payload.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };
  const result = await prisma.$transaction(async (transactionClient) => {
    // user creation
    await transactionClient.user.create({
      data: userData,
    });
    // admin creation
    const createdAdminData = await transactionClient.admin.create({
      data: payload.admin,
    });
    return createdAdminData;
  });
  return result;
};

export const userService = {
  createAdmin,
};
