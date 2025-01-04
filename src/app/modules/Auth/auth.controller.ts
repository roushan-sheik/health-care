import { Request, Response } from "express";
import AsyncHandler from "../../utils/AsyncHandler";
import { authServices } from "./auth.service";
import { SendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError";
import { cookieOptions } from "../../constants";

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

const refreshToken = AsyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) {
    // status 401
    throw new ApiError(401, "You are not authorized");
  }
  const result = await authServices.refreshToken(refreshToken);

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
export const authController = { loginUser, refreshToken };
