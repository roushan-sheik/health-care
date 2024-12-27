import { prisma } from "../../lib/database/prisma.client";

export const getAdminsDataFromDB = async (params: any) => {
  return await prisma.admin.findMany({
    where: {
      OR: [
        {
          name: {
            contains: params.searchTerm,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: params.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    },
  });
};

export const adminService = { getAdminsDataFromDB };
