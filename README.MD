# Go to prisma website and follow the website guides

```
https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql
```

> src/app.ts

```ts
import express, { Application, Request, Response } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export { app };
import express, { Application, Request, Response } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export { app };
```

> src/server.ts

```ts
/* eslint-disable no-console */
import { Server } from "http";
import { app } from "./app";
const PORT = process.env.PORT || 8000;

async function main() {
  const server: Server = app.listen(PORT, () => {
    console.log(`\n Application is running on port: http://localhost:${PORT}`);
  });
}

main();
```

## Async Handler

```ts
import { NextFunction, Request, Response } from "express";

const AsyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default AsyncHandler;
```

## Api Response

```ts
class ApiResponse<T, K = undefined> {
  private success: boolean;

  constructor(
    public statusCode: number,
    public data: T,
    public message: string = "Successful",
    public meta?: K
  ) {
    this.success = statusCode < 400;
    this.message = statusCode >= 400 ? "Failed" : message;
  }
  // format the response method
  public format(): Record<string, any> {
    return {
      success: this.success,
      message: this.message,
      meta: this.meta || {},
      data: this.data,
    };
  }
}
export default ApiResponse;
```

## Basic search Query

```ts
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/database/prisma.client";

export const getAdminsDataFromDB = async (params: any) => {
  const andCondition: Prisma.AdminWhereInput[] = [];

  if (params.searchTerm) {
    andCondition.push({
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
    });
  }
  const whereCondition: Prisma.AdminWhereInput = { AND: andCondition };
  const result = await prisma.admin.findMany({
    where: whereCondition,
  });
  return result;
};

export const adminService = { getAdminsDataFromDB };
```

## efficient search Query

```ts
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/database/prisma.client";

export const getAdminsDataFromDB = async (params: any) => {
  const andCondition: Prisma.AdminWhereInput[] = [];
  const adminSearchAbleFields = ["name", "email"];

  if (params.searchTerm) {
    andCondition.push({
      OR: adminSearchAbleFields.map((field: string) => {
        return {
          [field]: {
            contains: params.searchTerm,
            mode: "insensitive",
          },
        };
      }),
    });
  }
  const whereCondition: Prisma.AdminWhereInput = { AND: andCondition };
  const result = await prisma.admin.findMany({
    where: whereCondition,
  });
  return result;
};

export const adminService = { getAdminsDataFromDB };
```

## multiple fields condition search

```ts
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
```

## Pik Function for pik spec fields

```ts
// pik function for spec fields
export const pik = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> => {
  const finalObj: Partial<T> = {};

  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
  }
  return finalObj;
};
```

## Pagination helper

```ts
interface ICalculatePagination {
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: string;
}
export const calculatePagination = (
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

const paginationHelper = {
  calculatePagination,
};
```

## Add Final sorting searching and pagination

```ts
import { Prisma } from "@prisma/client";
import { prisma } from "../../../shared/prisma";
import { calculatePagination } from "../../../helpers/pagination.helper";

export const getAdminsDataFromDB = async (filters: any, options: any) => {
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

export const adminService = { getAdminsDataFromDB };
```

## Backend Response Example

```ts
  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        result.data,
        "Admin data",
        result.meta
      ).format()
```

## Frontend Pretty Response Example 😊😊😍

```ts
{
    "success": true,
    "message": "Admin data",
    "meta": {
        "page": 2,
        "limit": 1,
        "total": 11
    },
    "data": [
        {
            "id": "634e5c45-c334-4bad-97f0-116867ceb76b",
            "name": "Test User 6",
            "email": "test6@gmail.com",
            "profilePhoto": null,
            "contactNumber": "0123456787",
            "isDeleted": false,
            "createdAt": "2024-12-27T01:11:40.602Z",
            "updatedAt": "2024-12-27T01:11:40.602Z"
        }
    ]
}
```
