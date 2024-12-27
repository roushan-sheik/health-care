import { prisma } from "../../lib/database/prisma.client";

export const getAdminsDataFromDB = async () => {
  return await prisma.admin.findMany();
};

export const adminService = { getAdminsDataFromDB };
