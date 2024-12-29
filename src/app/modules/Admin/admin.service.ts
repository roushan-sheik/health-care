import { Admin, Prisma } from "@prisma/client";
import { prisma } from "../../../shared/prisma";
import { calculatePagination } from "../../../helpers/pagination.helper";

// get admins from db
const getAdminsDataFromDB = async (filters: any, options: any) => {
  const { searchTerm, ...filterData } = filters;

  const andCondition: Prisma.AdminWhereInput[] = [];

  const adminSearchAbleFields = ["name", "email", "contactNumber"];

  if (filters.searchTerm) {
    andCondition.push({
      OR: adminSearchAbleFields.map((field: string) => {
        return {
          [field]: {
            contains: filters.searchTerm,
            mode: "insensitive",
          },
        };
      }),
    });
  }
  // multiple fields condition search
  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: filterData[key],
          },
        };
      }),
    });
  }

  // calculate  pagination
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const whereCondition: Prisma.AdminWhereInput = { AND: andCondition };
  const result = await prisma.admin.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
  });
  // calculate total
  const total = await prisma.admin.count({
    where: whereCondition,
  });
  // finally return results ============
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};
// Get admin by id
const getAdminByIdFromDB = async (adminId: string) => {
  const result = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
  });
  console.log("result", result);
  return result;
};
// Update admin by id
const updateAdminByIdFromDB = async (
  adminId: string,
  payload: Partial<Admin>
) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id: adminId,
    },
  });

  const result = await prisma.admin.update({
    where: {
      id: adminId,
    },
    data: payload,
  });
  return result;
};
// Delete admin by id from db

const deleteAdminByIdFromDB = async (adminId: string) => {
  const result = await prisma.$transaction(async (transactionClient) => {
    const adminDeletedData = await transactionClient.admin.delete({
      where: {
        id: adminId,
      },
    });
    await transactionClient.user.delete({
      where: {
        email: adminDeletedData.email,
      },
    });
    return adminDeletedData;
  });

  return result;
};

export const adminService = {
  getAdminsDataFromDB,
  getAdminByIdFromDB,
  updateAdminByIdFromDB,
  deleteAdminByIdFromDB,
};
