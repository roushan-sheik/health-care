import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const createAdmin = async (payload: any) => {
  const userData = {
    email: payload.admin.email,
    password: payload.password,
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
