import { Prisma } from "@prisma/client";
import { prisma } from "../../../shared/prisma";

interface ICalculatePagination {
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: string;
}
const calculatePagination = (
  options: ICalculatePagination
): ICalculatePagination => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export const getAdminsDataFromDB = async (filters: any, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
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

  const whereCondition: Prisma.AdminWhereInput = { AND: andCondition };
  const result = await prisma.admin.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
  });
  return result;
};

export const adminService = { getAdminsDataFromDB };
