import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../../../shared/prisma";

interface AdminPayload {
  admin: {
    username: string;
    email: string;
    password: string;
    contactNumber: string;
  };
  username?: string;
  password: string;
}

const createAdmin = async (payload: AdminPayload) => {
  // hash the user password
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const userData = {
    username: payload?.admin?.username,
    email: payload.admin?.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };
  const result = await prisma.$transaction(async (transactionClient) => {
    // user creation
    await transactionClient.user.create({
      data: userData,
    });
    const createdAdminData = await transactionClient.admin.create({
      data: payload.admin,
    });
    return createdAdminData;
  });
  return result;
};

// get all users

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany();
  return result;
};

export const userService = {
  createAdmin,
  getAllUsersFromDB,
};
