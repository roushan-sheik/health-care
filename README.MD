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
import { NextFunction, Request, RequestHandler, Response } from "express";

const AsyncHandler = (fn: RequestHandler) => {
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
    this.message = statusCode >= 400 ? "Failed" : message || "Successful";
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
Fetch: "{{base}}/admin?page=2&limit=1&sortBy=name&sortOrder=desc"
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

## SendResponse Function

```ts
import { Response } from "express";

// Send Response ====================================>
export const SendResponse = <T>(
  res: Response,
  jsonData: {
    statusCode: number;
    data: T | null | undefined;
    message?: string;
    meta?: {
      page: number;
      limit: number;
      total: number;
    };
  }
) => {
  // destructure
  const { statusCode, data, message, meta } = jsonData;
  // send response
  res.status(statusCode).json({
    success: statusCode < 400,
    message: statusCode >= 400 ? "Failed" : message || "Successful",
    meta: meta || null || undefined,
    data: data || null || undefined,
  });
};
```

## Backend Response Example 😊😊😍

```ts
SendResponse(res, { statusCode: StatusCodes.OK, data: result });
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
Fetch: "{{base}}/admin?page=2&limit=1&sortBy=name&sortOrder=desc"
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

## Routes Organize

```ts
import express from "express";
import { userRoutes } from "../modules/User/user.routes";
import { adminRoutes } from "../modules/Admin/admin.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
```

## Uses Example

```ts
// Routes Imports =========================>
import appRoute from "./app/routes";
app.use("/api/v1", appRoute);
```

## ApiError

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */

class ApiError extends Error {
  public success: boolean;
  public timeStamp: string;

  constructor(
    public statusCode: number,
    public message: string = "Internal Server Error!!",
    public errors: string[] | any[] = [],
    public data: any = undefined,
    public errorType: string = "General",
    public stack: string = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false; // by default false
    this.errors = errors;
    this.data = data;
    this.timeStamp = new Date().toISOString();
    this.errorType = errorType;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  //  format the error
  public toResponseFormat() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      errors: this.errors,
      data: this.data,
      timestamp: this.timeStamp,
      errorType: this.errorType,
      stack: process.env.NODE_ENV === "production" ? undefined : this.stack, // প্রডাকশনে স্ট্যাক না দেখানো
    };
  }
}

export default ApiError;

// Input Data  ==================>
// 1. statusCode
// 2. message
// 3. errors
// 4. data
// 5. timestamp
// 6. stack

// // Output obj ================>
// 1. statusCode
// 2. message
// 3. errors
// 4. data
// 5. timestamp
// 6. success
// 7. errorType
// 8. stack
```

## JWT Helper

> > src/shared

```ts
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

//* token generate method >>>>>>>>>>>>>>>>>>>>>>

const generateToken = (payload: object, secret: Secret, expire: string) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expire,
  });
  return token;
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = { generateToken, verifyToken };
```

## Cookie Options

```ts
import { CookieOptions } from "express";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict", // Helps prevent CSRF attacks
};
```

## Login User

### Controller

```ts
const loginUser = AsyncHandler(async (req: Request, res: Response) => {
  const result = await authServices.loginUser(req.body);
  // set accessToken to the cookie
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  // send response with accessToken
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});
```

### Services

```ts
// Login user =====================>
const loginUser = async (payload: IPayload) => {
  const { username, email, password } = payload;
  // check email or username is required or not
  if (!username && !email) {
    throw new Error("Email or username is required");
  }
  // find user by email or username and check user status
  const user = await prisma.user.findFirstOrThrow({
    where: {
      status: UserStatus.ACTIVE,
      OR: [{ email: email }, { username: username }],
    },
  });
  if (!user) {
    throw new Error("User Dose not exist");
  }
  // check password is correct or not
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }
  // generate access token and refresh token
  const accessToken = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    "5m"
  );
  const refreshToken = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    "15d"
  );
  // update refresh token in user table
  await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      refreshToken,
    },
  });

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};
```

## Refreshed Token

### Controller

```ts
const refreshedToken = AsyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    // status 401
    throw new ApiError(401, "You are not authorized");
  }

  const result = await authServices.refreshedToken(refreshToken);

  // set accessToken to the cookie
  res.cookie("refreshToken", result?.refreshToken, cookieOptions);

  SendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Token refreshed",
    data: {
      accessToken: result?.accessToken,
      needPasswordChange: result?.needPasswordChange,
    },
  });
});
```

### Services

```ts
// Refresh token =====================>
const refreshedToken = async (incomingRefreshToken: string) => {
  // check  token have or not or throw an error
  if (!incomingRefreshToken) {
    throw new ApiError(401, "You are not authorized");
  }

  // decode token
  const decodedData: JwtPayload = jwtHelpers.verifyToken(
    incomingRefreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET as string
  );

  // find user by decoded email
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });
  // check user have or not
  if (!user) {
    throw new ApiError(401, "You are not authorized");
  }

  // check refresh token is same or not
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "You are not authorized");
  }
  // generate new access token and refresh token
  const newAccessToken = jwtHelpers.generateToken(
    { email: decodedData?.email, role: decodedData?.role },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    "5m"
  );
  const newRefreshToken = jwtHelpers.generateToken(
    { email: decodedData?.email, role: decodedData?.role },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    "15d"
  );
  // update refresh token in user table
  await prisma.user.update({
    where: {
      email: decodedData?.email,
    },
    data: {
      refreshToken: newRefreshToken,
    },
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};
```

## Logout User

### Controller

```ts
const logOutUser = AsyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    // status 401
    throw new ApiError(401, "You are not authorized");
  }
  await authServices.logOutUser(refreshToken);

  // remove refreshToken from the cookie
  res.clearCookie("refreshToken");

  SendResponse(res, {
    statusCode: 200,
    message: "Logout successful",
  });
});
```

### Services

```ts
//log out user =====================>
const logOutUser = async (refreshToken: string) => {
  // check  token have or not or throw an error
  if (!refreshToken) {
    throw new ApiError(401, "You are not authorized");
  }
  // use try catch block to handle error
  try {
    // decode token
    const decodedData: JwtPayload | null = jwtHelpers.verifyToken(
      refreshToken,
      config.jwt.refresh_token_secret as string
    );

    // update refresh token in user table
    await prisma.user.update({
      where: {
        email: decodedData?.email,
      },
      data: {
        refreshToken: "",
      },
    });
    return {
      message: "Logout successfully",
    };
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }
};
```

## Env Config

> > src/config/index.ts

```ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  jwt: {
    access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    access_token_expiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    refresh_token_expiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  },
};
```

## Role Base Access Control auth Middleware

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helpers/jwtHelper";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import { UserRole } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

export const auth = (...roles: UserRole[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          message: "You are not authorized",
        });
        return;
      }
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_token_secret as Secret
      );
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Forbidden! You are not authorized to access this route"
        );
      }
      req.user = verifiedUser;
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

# forget password with modemailer

```ts
//  Change password =====================>
// Steps algorithm
// 1. Find user by email  and check user status
// 2. Generate reset password token
// 3. Make a link with email and token
// 5. create a file called emailSender.ts
// 6. go to nodemailer and copy the example  code
// 7. create a emailSender function paste the code and export it
// 8. change auth user email and password
// 9. change host it will be gmail host "smtp.gmail.com" search on google
// 10. remove the main function make emailSender function async
// 11. you will find those in your google account App password
// 12. https://myaccount.google.com/apppasswords
// 13. change transport object info like, from , to , html body
//* 14. make reset password route for reset the password
// 15. find user by email and check user status
// 16. verify the token
// 17. hash the password
// 18. update the password
```

# Forgot password

> > forgotPassword controller

```ts
const forgotPassword = AsyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await authServices.forgotPassword(req.body);

    SendResponse(res, {
      statusCode: 200,
      message: "Password changed successfully",
      data: result,
    });
  }
);
```

> > forgotPassword service

```ts
const forgotPassword = async (payload: { email: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  // generate access token and refresh token
  const resetPassToken = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    config.jwt.reset_token_secret as Secret,
    config.jwt.reset_token_expiration as string
  );
  // Make a Frontend Link
  const resetPasswordLink = `${config.reset_password_link}?email=${user.email}&token=${resetPassToken}`;

  await emailSender(
    user.email,
    `
    <div>
      <h1>Reset Password</h1>
      <p>Click this link to reset your password</p>
      <a href="${resetPasswordLink}">
        <button>Reset Password</button>
      </a>
    </div>
    `
  );
  return {
    email: payload.email,
    message: "Password changed successfully",
  };
};
```

# Reset password

> > resetPassword controller

```ts
const resetPassword = AsyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const token = req.headers.authorization || "";

    await authServices.resetPassword(token, req.body);

    SendResponse(res, {
      statusCode: 200,
      message: "Password Reset successfully",
      data: null,
    });
  }
);
```

> > resetPassword service

```ts
const resetPassword = async (
  token: string,
  payload: { email: string; password: string }
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_token_secret as Secret
  );

  if (!isValidToken) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Forbidden!");
  }

  // hash password
  const password = await bcrypt.hash(payload.password, 12);

  // update into database
  await prisma.user.update({
    where: {
      email: payload.email,
    },
    data: {
      password,
    },
  });
};
```

# Image Upload With Multer and Cloudinary

```ts
 yarn add multer
 yarn add @types/multer -D

 // Go to multer docs Disk storage and copy the code

https://www.npmjs.com/package/multer

```

> > helpers/fileUploader.ts

```ts
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export const fileUploader = {
  upload,
};
```

> > helpers/fileUploader.ts

```ts

```
