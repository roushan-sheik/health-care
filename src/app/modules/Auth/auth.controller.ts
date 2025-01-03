import { Request, Response } from "express";
import AsyncHandler from "../../utils/AsyncHandler";
import { authServices } from "./auth.service";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";

const loginUser = AsyncHandler(async (req: Request, res: Response) => {
  const result = await authServices.loginUser(req.body);
  // set accessToken to the cookie
  res.cookie("refreshToken", result.refreshToken, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

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

const refreshToken = AsyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }
  const result = await authServices.refreshToken(refreshToken);
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Token refreshed",
    data: {
      accessToken: result.accessToken,
    },
  });
});
export const authController = { loginUser, refreshToken };
