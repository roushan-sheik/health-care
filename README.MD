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
